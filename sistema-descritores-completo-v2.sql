-- ====================================================================
-- 🔧 SISTEMA DE DESCRITORES COMPLETO V2.0 - CURSO ENTROPIA
-- Reestruturação total para três módulos integrados
-- ====================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. LIMPEZA E PREPARAÇÃO
-- ====================================================================

-- Desabilitar RLS temporariamente para migração
SET session_replication_role = replica;

-- ====================================================================
-- 2. ENUMS E TIPOS
-- ====================================================================

-- Status de envio dos descritores
DROP TYPE IF EXISTS status_envio_enum CASCADE;
CREATE TYPE status_envio_enum AS ENUM ('pendente', 'sucesso', 'falha', 'cancelado');

-- Turnos do dia
DROP TYPE IF EXISTS turno_enum CASCADE;
CREATE TYPE turno_enum AS ENUM ('manha', 'tarde', 'noite');

-- Dias da semana
DROP TYPE IF EXISTS dia_semana_enum CASCADE;
CREATE TYPE dia_semana_enum AS ENUM ('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo');

-- Status de presença
DROP TYPE IF EXISTS status_presenca_enum CASCADE;
CREATE TYPE status_presenca_enum AS ENUM ('ausente', 'presente', 'atrasado');

-- Status de pagamento
DROP TYPE IF EXISTS status_pagamento_enum CASCADE;
CREATE TYPE status_pagamento_enum AS ENUM ('pendente', 'pago', 'cancelado');

-- ====================================================================
-- 3. TABELA DE MATÉRIAS
-- ====================================================================

CREATE TABLE IF NOT EXISTS materias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    codigo VARCHAR(10) UNIQUE,
    cor_hex VARCHAR(7) DEFAULT '#3B82F6', -- Cor para interface
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir matérias padrão
INSERT INTO materias (nome, codigo, cor_hex, ordem) VALUES
('Matemática', 'MAT', '#EF4444', 1),
('Português', 'POR', '#10B981', 2),
('Física', 'FIS', '#3B82F6', 3),
('Química', 'QUI', '#F59E0B', 4),
('Biologia', 'BIO', '#10B981', 5),
('História', 'HIS', '#8B5CF6', 6),
('Geografia', 'GEO', '#06B6D4', 7),
('Filosofia', 'FIL', '#84CC16', 8),
('Sociologia', 'SOC', '#F97316', 9),
('Redação', 'RED', '#EC4899', 10),
('Literatura', 'LIT', '#6366F1', 11),
('Inglês', 'ING', '#14B8A6', 12)
ON CONFLICT (nome) DO NOTHING;

-- ====================================================================
-- 4. TABELA DE PROFESSORES (REESTRUTURADA)
-- ====================================================================

-- Backup da tabela existente se houver
CREATE TABLE IF NOT EXISTS professores_backup AS 
SELECT * FROM professores WHERE EXISTS (SELECT 1 FROM professores LIMIT 1);

-- Recriar tabela com nova estrutura
DROP TABLE IF EXISTS professores CASCADE;
CREATE TABLE professores (
    id SERIAL PRIMARY KEY,
    numero INTEGER UNIQUE,
    nome VARCHAR(255) NOT NULL,
    cpf CHAR(11) UNIQUE NOT NULL,
    materia_id UUID REFERENCES materias(id) ON DELETE SET NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    valor_por_minuto DECIMAL(10,2) DEFAULT 1.85,
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_cpf_valido CHECK (LENGTH(cpf) = 11),
    CONSTRAINT check_valor_positivo CHECK (valor_por_minuto > 0)
);

-- Índices para performance
CREATE INDEX idx_professores_cpf ON professores(cpf);
CREATE INDEX idx_professores_ativo ON professores(ativo);
CREATE INDEX idx_professores_materia ON professores(materia_id);

-- ====================================================================
-- 5. TABELA DE TÓPICOS
-- ====================================================================

CREATE TABLE IF NOT EXISTS topicos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    materia_id UUID NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para evitar duplicação
    UNIQUE(materia_id, nome)
);

-- Índices
CREATE INDEX idx_topicos_materia ON topicos(materia_id);
CREATE INDEX idx_topicos_ativo ON topicos(ativo);

-- ====================================================================
-- 6. TABELA DE TURMAS (SIMPLIFICADA)
-- ====================================================================

CREATE TABLE IF NOT EXISTS turmas_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    turno turno_enum NOT NULL,
    capacidade_maxima INTEGER DEFAULT 45,
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir turmas padrão
INSERT INTO turmas_sistema (codigo, nome, turno) VALUES
('PSC-M-01', 'PSC Manhã Turma 1', 'manha'),
('PSC-M-02', 'PSC Manhã Turma 2', 'manha'),
('PSC-T-01', 'PSC Tarde Turma 1', 'tarde'),
('PSC-T-02', 'PSC Tarde Turma 2', 'tarde'),
('ENEM-M-01', 'ENEM Manhã Turma 1', 'manha'),
('ENEM-T-01', 'ENEM Tarde Turma 1', 'tarde'),
('ENEM-N-01', 'ENEM Noite Turma 1', 'noite')
ON CONFLICT (codigo) DO NOTHING;

-- ====================================================================
-- 7. TABELA DE HORÁRIOS DE AULAS (REESTRUTURADA)
-- ====================================================================

DROP TABLE IF EXISTS horarios_aulas CASCADE;
CREATE TABLE horarios_aulas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    turma_id UUID NOT NULL REFERENCES turmas_sistema(id) ON DELETE CASCADE,
    dia_semana dia_semana_enum NOT NULL,
    tempo INTEGER NOT NULL, -- 1º tempo, 2º tempo, etc.
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    duracao_minutos INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (hora_fim - hora_inicio)) / 60
    ) STORED,
    materia_id UUID NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
    professor_id INTEGER REFERENCES professores(id) ON DELETE SET NULL,
    sala VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(turma_id, dia_semana, tempo),
    CHECK (hora_fim > hora_inicio),
    CHECK (tempo > 0 AND tempo <= 10),
    CHECK (duracao_minutos > 0)
);

-- Índices críticos
CREATE INDEX idx_horarios_turma ON horarios_aulas(turma_id);
CREATE INDEX idx_horarios_professor ON horarios_aulas(professor_id);
CREATE INDEX idx_horarios_dia ON horarios_aulas(dia_semana);
CREATE INDEX idx_horarios_tempo ON horarios_aulas(tempo);
CREATE INDEX idx_horarios_ativo ON horarios_aulas(ativo);

-- ====================================================================
-- 8. TABELA DE DESCRITORES (REESTRUTURADA COMPLETA)
-- ====================================================================

DROP TABLE IF EXISTS descritores CASCADE;
CREATE TABLE descritores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    horario_id UUID NOT NULL REFERENCES horarios_aulas(id) ON DELETE CASCADE,
    professor_id INTEGER NOT NULL REFERENCES professores(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    
    -- Dados preenchidos automaticamente
    turma_id UUID NOT NULL REFERENCES turmas_sistema(id) ON DELETE CASCADE,
    materia_id UUID NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
    minutos_aula INTEGER NOT NULL,
    
    -- Dados preenchidos pelo professor
    topico_id UUID REFERENCES topicos(id) ON DELETE SET NULL,
    descricao_livre TEXT NOT NULL,
    
    -- Controle de envio
    enviado BOOLEAN DEFAULT false,
    status_envio status_envio_enum DEFAULT 'pendente',
    tentativas_envio INTEGER DEFAULT 0,
    data_envio TIMESTAMP WITH TIME ZONE,
    erro_envio TEXT,
    
    -- Controle de edição
    editavel BOOLEAN DEFAULT true,
    editado_admin BOOLEAN DEFAULT false,
    admin_que_editou VARCHAR(255),
    
    -- Auditoria
    ip_submissao INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(horario_id, data), -- Um descritor por horário por data
    CHECK (minutos_aula > 0),
    CHECK (tentativas_envio >= 0),
    CHECK (LENGTH(descricao_livre) >= 10) -- Mínimo 10 caracteres
);

-- Índices críticos para performance
CREATE INDEX idx_descritores_data ON descritores(data);
CREATE INDEX idx_descritores_professor ON descritores(professor_id);
CREATE INDEX idx_descritores_turma ON descritores(turma_id);
CREATE INDEX idx_descritores_status ON descritores(status_envio);
CREATE INDEX idx_descritores_enviado ON descritores(enviado);
CREATE INDEX idx_descritores_data_professor ON descritores(data, professor_id);
CREATE INDEX idx_descritores_data_turma ON descritores(data, turma_id);

-- ====================================================================
-- 9. TABELA DE PRESENÇAS DE PROFESSORES
-- ====================================================================

CREATE TABLE IF NOT EXISTS professor_presencas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id INTEGER NOT NULL REFERENCES professores(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    horario_id UUID NOT NULL REFERENCES horarios_aulas(id) ON DELETE CASCADE,
    
    -- Status da presença
    status_presenca status_presenca_enum DEFAULT 'ausente',
    hora_chegada TIME,
    minutos_atraso INTEGER DEFAULT 0,
    
    -- Dados de registro
    observacoes TEXT,
    registrado_por VARCHAR(255),
    ip_registro INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(professor_id, data, horario_id),
    CHECK (minutos_atraso >= 0)
);

-- Índices
CREATE INDEX idx_prof_presencas_data ON professor_presencas(data);
CREATE INDEX idx_prof_presencas_professor ON professor_presencas(professor_id);
CREATE INDEX idx_prof_presencas_status ON professor_presencas(status_presenca);

-- ====================================================================
-- 10. TABELA DE MINUTOS POR PROFESSOR
-- ====================================================================

CREATE TABLE IF NOT EXISTS minutos_professores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id INTEGER NOT NULL REFERENCES professores(id) ON DELETE CASCADE,
    descritor_id UUID NOT NULL REFERENCES descritores(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    minutos INTEGER NOT NULL,
    valor_por_minuto DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) GENERATED ALWAYS AS (minutos * valor_por_minuto) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(descritor_id), -- Um registro por descritor
    CHECK (minutos > 0),
    CHECK (valor_por_minuto > 0)
);

-- Índices
CREATE INDEX idx_minutos_professor ON minutos_professores(professor_id);
CREATE INDEX idx_minutos_data ON minutos_professores(data);
CREATE INDEX idx_minutos_mes ON minutos_professores(DATE_TRUNC('month', data));

-- ====================================================================
-- 11. TABELA DE LOGS DE DESCRITORES
-- ====================================================================

CREATE TABLE IF NOT EXISTS descritor_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    descritor_id UUID REFERENCES descritores(id) ON DELETE CASCADE,
    professor_id INTEGER REFERENCES professores(id) ON DELETE CASCADE,
    admin_id UUID, -- ID do admin que fez a alteração
    acao VARCHAR(100) NOT NULL, -- 'criado', 'editado', 'enviado', 'bloqueado'
    
    -- Dados da alteração
    campo_alterado VARCHAR(100),
    valor_anterior TEXT,
    valor_novo TEXT,
    dados_completos_antes JSONB,
    dados_completos_depois JSONB,
    
    -- Auditoria
    ip_address INET,
    user_agent TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para auditoria
CREATE INDEX idx_descritor_logs_descritor ON descritor_logs(descritor_id);
CREATE INDEX idx_descritor_logs_professor ON descritor_logs(professor_id);
CREATE INDEX idx_descritor_logs_acao ON descritor_logs(acao);
CREATE INDEX idx_descritor_logs_data ON descritor_logs(created_at);

-- ====================================================================
-- 12. TABELA DE CONFIGURAÇÕES DO SISTEMA
-- ====================================================================

CREATE TABLE IF NOT EXISTS configuracoes_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
    descricao TEXT,
    editavel BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO configuracoes_sistema (chave, valor, tipo, descricao) VALUES
('portaria_senha', 'entropia2024', 'string', 'Senha de acesso ao módulo da portaria'),
('auto_refresh_portaria', '5', 'number', 'Intervalo de atualização automática da portaria (segundos)'),
('webhook_pais_url', '', 'string', 'URL do webhook para envio aos pais'),
('notificacao_antecedencia', '60', 'number', 'Minutos de antecedência para notificar professores'),
('valor_padrao_minuto', '1.85', 'number', 'Valor padrão por minuto de aula'),
('bloquear_edicao_apos_envio', 'true', 'boolean', 'Bloquear edição de descritores após envio'),
('horario_corte_descritores', '23:59', 'string', 'Horário limite para preenchimento de descritores')
ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor;

-- ====================================================================
-- 13. VIEWS PARA RELATÓRIOS
-- ====================================================================

-- View para resumo de pagamentos mensais
CREATE OR REPLACE VIEW vw_resumo_pagamentos AS
SELECT 
    p.id as professor_id,
    p.nome as professor_nome,
    p.cpf as professor_cpf,
    m.nome as materia_nome,
    DATE_TRUNC('month', mp.data) as mes_referencia,
    COUNT(mp.id) as total_aulas,
    SUM(mp.minutos) as total_minutos,
    AVG(mp.valor_por_minuto) as valor_medio_minuto,
    SUM(mp.valor_total) as valor_total_mes,
    p.ativo
FROM professores p
LEFT JOIN materias m ON p.materia_id = m.id
LEFT JOIN minutos_professores mp ON p.id = mp.professor_id
GROUP BY p.id, p.nome, p.cpf, m.nome, DATE_TRUNC('month', mp.data), p.ativo
ORDER BY mes_referencia DESC NULLS LAST, p.nome;

-- View para grade de horários completa
CREATE OR REPLACE VIEW vw_grade_completa AS
SELECT 
    h.id as horario_id,
    ts.codigo as turma_codigo,
    ts.nome as turma_nome,
    ts.turno,
    h.dia_semana,
    h.tempo,
    h.hora_inicio,
    h.hora_fim,
    h.duracao_minutos,
    m.nome as materia_nome,
    m.cor_hex as materia_cor,
    p.nome as professor_nome,
    p.cpf as professor_cpf,
    h.sala,
    h.ativo
FROM horarios_aulas h
JOIN turmas_sistema ts ON h.turma_id = ts.id
JOIN materias m ON h.materia_id = m.id
LEFT JOIN professores p ON h.professor_id = p.id
WHERE h.ativo = true AND ts.ativo = true
ORDER BY ts.turno, ts.codigo, h.dia_semana, h.tempo;

-- View para descritores completos
CREATE OR REPLACE VIEW vw_descritores_completos AS
SELECT 
    d.id,
    d.data,
    ts.codigo as turma_codigo,
    ts.nome as turma_nome,
    ts.turno,
    m.nome as materia_nome,
    p.nome as professor_nome,
    p.cpf as professor_cpf,
    h.dia_semana,
    h.tempo,
    h.hora_inicio,
    h.hora_fim,
    t.nome as topico_nome,
    d.descricao_livre,
    d.minutos_aula,
    d.enviado,
    d.status_envio,
    d.editavel,
    d.editado_admin,
    d.created_at,
    d.updated_at
FROM descritores d
JOIN horarios_aulas h ON d.horario_id = h.id
JOIN turmas_sistema ts ON d.turma_id = ts.id
JOIN materias m ON d.materia_id = m.id
JOIN professores p ON d.professor_id = p.id
LEFT JOIN topicos t ON d.topico_id = t.id
ORDER BY d.data DESC, ts.turno, h.tempo;

-- View para status da portaria
CREATE OR REPLACE VIEW vw_status_portaria AS
SELECT 
    CURRENT_DATE as data,
    ts.turno,
    h.tempo,
    h.hora_inicio,
    h.hora_fim,
    ts.codigo as turma_codigo,
    ts.nome as turma_nome,
    m.nome as materia_nome,
    p.nome as professor_nome,
    p.cpf as professor_cpf,
    COALESCE(pp.status_presenca, 'ausente') as status_presenca,
    pp.hora_chegada,
    pp.minutos_atraso,
    pp.observacoes,
    h.id as horario_id,
    p.id as professor_id
FROM horarios_aulas h
JOIN turmas_sistema ts ON h.turma_id = ts.id
JOIN materias m ON h.materia_id = m.id
JOIN professores p ON h.professor_id = p.id
LEFT JOIN professor_presencas pp ON (
    pp.professor_id = p.id 
    AND pp.data = CURRENT_DATE 
    AND pp.horario_id = h.id
)
WHERE h.ativo = true 
AND ts.ativo = true 
AND p.ativo = true
ORDER BY ts.turno, h.tempo, h.hora_inicio;

-- ====================================================================
-- 14. TRIGGERS PARA AUTOMAÇÃO
-- ====================================================================

-- Trigger para auto-preenchimento de descritores
CREATE OR REPLACE FUNCTION trg_descritor_auto_fill()
RETURNS TRIGGER AS $$
BEGIN
    -- Preencher dados automaticamente do horário
    SELECT 
        h.turma_id, 
        h.materia_id, 
        h.duracao_minutos,
        h.professor_id
    INTO 
        NEW.turma_id, 
        NEW.materia_id, 
        NEW.minutos_aula,
        NEW.professor_id
    FROM horarios_aulas h
    WHERE h.id = NEW.horario_id;
    
    -- Validar se o professor está correto
    IF NEW.professor_id IS NULL THEN
        RAISE EXCEPTION 'Horário não tem professor definido';
    END IF;
    
    -- Atualizar timestamp
    NEW.updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_descritor_auto_fill
    BEFORE INSERT OR UPDATE ON descritores
    FOR EACH ROW
    EXECUTE FUNCTION trg_descritor_auto_fill();

-- Trigger para registrar minutos automaticamente
CREATE OR REPLACE FUNCTION trg_registrar_minutos()
RETURNS TRIGGER AS $$
DECLARE
    v_valor_minuto DECIMAL(10,2);
BEGIN
    -- Buscar valor por minuto do professor
    SELECT valor_por_minuto INTO v_valor_minuto
    FROM professores 
    WHERE id = NEW.professor_id;
    
    -- Inserir registro de minutos
    INSERT INTO minutos_professores (
        professor_id,
        descritor_id,
        data,
        minutos,
        valor_por_minuto
    ) VALUES (
        NEW.professor_id,
        NEW.id,
        NEW.data,
        NEW.minutos_aula,
        COALESCE(v_valor_minuto, 1.85)
    )
    ON CONFLICT (descritor_id) DO UPDATE SET
        minutos = EXCLUDED.minutos,
        valor_por_minuto = EXCLUDED.valor_por_minuto;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_registrar_minutos
    AFTER INSERT OR UPDATE ON descritores
    FOR EACH ROW
    EXECUTE FUNCTION trg_registrar_minutos();

-- Trigger para log de alterações
CREATE OR REPLACE FUNCTION trg_descritor_log()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO descritor_logs (
            descritor_id, 
            professor_id, 
            acao, 
            dados_completos_depois
        ) VALUES (
            NEW.id, 
            NEW.professor_id, 
            'criado', 
            row_to_json(NEW)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO descritor_logs (
            descritor_id, 
            professor_id, 
            acao, 
            dados_completos_antes,
            dados_completos_depois
        ) VALUES (
            NEW.id, 
            NEW.professor_id, 
            'editado', 
            row_to_json(OLD),
            row_to_json(NEW)
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_descritor_log
    AFTER INSERT OR UPDATE ON descritores
    FOR EACH ROW
    EXECUTE FUNCTION trg_descritor_log();

-- Trigger para inicializar presenças diárias
CREATE OR REPLACE FUNCTION trg_inicializar_presencas_diarias()
RETURNS VOID AS $$
BEGIN
    -- Inserir registros de presença para todos os professores do dia
    INSERT INTO professor_presencas (
        professor_id,
        data,
        horario_id,
        status_presenca
    )
    SELECT DISTINCT
        h.professor_id,
        CURRENT_DATE,
        h.id,
        'ausente'
    FROM horarios_aulas h
    JOIN professores p ON h.professor_id = p.id
    WHERE h.ativo = true 
    AND p.ativo = true
    AND h.professor_id IS NOT NULL
    ON CONFLICT (professor_id, data, horario_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 15. FUNÇÕES UTILITÁRIAS
-- ====================================================================

-- Função para calcular pagamento de um professor em um mês
CREATE OR REPLACE FUNCTION fn_calcular_pagamento_professor(
    p_professor_id INTEGER,
    p_mes_ano DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
    total_aulas BIGINT,
    total_minutos NUMERIC,
    valor_total NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(mp.id) as total_aulas,
        COALESCE(SUM(mp.minutos), 0) as total_minutos,
        COALESCE(SUM(mp.valor_total), 0) as valor_total
    FROM minutos_professores mp
    WHERE mp.professor_id = p_professor_id
    AND DATE_TRUNC('month', mp.data) = DATE_TRUNC('month', p_mes_ano);
END;
$$ LANGUAGE plpgsql;

-- Função para validar se pode preencher descritor
CREATE OR REPLACE FUNCTION fn_pode_preencher_descritor(
    p_horario_id UUID,
    p_data DATE,
    p_professor_id INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    v_hora_inicio TIME;
    v_dia_semana TEXT;
    v_pode_preencher BOOLEAN := false;
BEGIN
    -- Buscar dados do horário
    SELECT 
        h.hora_inicio,
        h.dia_semana::TEXT
    INTO v_hora_inicio, v_dia_semana
    FROM horarios_aulas h
    WHERE h.id = p_horario_id;
    
    -- Verificar se a data corresponde ao dia da semana
    IF EXTRACT(DOW FROM p_data) = CASE v_dia_semana
        WHEN 'segunda' THEN 1
        WHEN 'terca' THEN 2
        WHEN 'quarta' THEN 3
        WHEN 'quinta' THEN 4
        WHEN 'sexta' THEN 5
        WHEN 'sabado' THEN 6
        WHEN 'domingo' THEN 0
    END THEN
        -- Verificar se já passou o horário da aula
        IF p_data < CURRENT_DATE OR 
           (p_data = CURRENT_DATE AND CURRENT_TIME > v_hora_inicio) THEN
            v_pode_preencher := true;
        END IF;
    END IF;
    
    RETURN v_pode_preencher;
END;
$$ LANGUAGE plpgsql;

-- Função para envio em lote de descritores
CREATE OR REPLACE FUNCTION fn_preparar_envio_turma(
    p_turma_id UUID,
    p_data DATE
) RETURNS TABLE (
    descritor_id UUID,
    turma_nome TEXT,
    materia_nome TEXT,
    professor_nome TEXT,
    topico_nome TEXT,
    descricao_livre TEXT,
    hora_inicio TIME,
    hora_fim TIME
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        ts.nome,
        m.nome,
        p.nome,
        t.nome,
        d.descricao_livre,
        h.hora_inicio,
        h.hora_fim
    FROM descritores d
    JOIN horarios_aulas h ON d.horario_id = h.id
    JOIN turmas_sistema ts ON d.turma_id = ts.id
    JOIN materias m ON d.materia_id = m.id
    JOIN professores p ON d.professor_id = p.id
    LEFT JOIN topicos t ON d.topico_id = t.id
    WHERE d.turma_id = p_turma_id
    AND d.data = p_data
    AND d.editavel = true
    ORDER BY h.tempo;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 16. POLÍTICAS DE SEGURANÇA (RLS)
-- ====================================================================

-- Habilitar RLS nas tabelas críticas
ALTER TABLE descritores ENABLE ROW LEVEL SECURITY;
ALTER TABLE minutos_professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE professor_presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE descritor_logs ENABLE ROW LEVEL SECURITY;

-- Política para professores (só veem seus próprios dados)
CREATE POLICY pol_professor_descritores ON descritores
    FOR ALL
    TO authenticated
    USING (
        professor_id = (
            SELECT id FROM professores 
            WHERE cpf = (current_setting('app.current_user_cpf', true))
        )
    );

CREATE POLICY pol_professor_minutos ON minutos_professores
    FOR SELECT
    TO authenticated
    USING (
        professor_id = (
            SELECT id FROM professores 
            WHERE cpf = (current_setting('app.current_user_cpf', true))
        )
    );

-- Política para admins (veem tudo)
CREATE POLICY pol_admin_total_access ON descritores
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- ====================================================================
-- 17. INSERÇÃO DE DADOS DE EXEMPLO
-- ====================================================================

-- Inserir professores de exemplo
INSERT INTO professores (numero, nome, cpf, materia_id, telefone, valor_por_minuto) 
SELECT 
    row_number() OVER (),
    nome,
    cpf,
    m.id,
    telefone,
    1.85
FROM (VALUES
    ('João Silva', '12345678901', 'Matemática', '(92) 99999-0001'),
    ('Maria Santos', '12345678902', 'Português', '(92) 99999-0002'),
    ('Pedro Oliveira', '12345678903', 'Física', '(92) 99999-0003'),
    ('Ana Costa', '12345678904', 'Química', '(92) 99999-0004'),
    ('Carlos Ferreira', '12345678905', 'Biologia', '(92) 99999-0005')
) AS dados(nome, cpf, materia_nome, telefone)
JOIN materias m ON m.nome = dados.materia_nome
ON CONFLICT (cpf) DO NOTHING;

-- Inserir tópicos de exemplo para cada matéria
INSERT INTO topicos (materia_id, nome, ordem) 
SELECT m.id, t.nome, t.ordem
FROM materias m
CROSS JOIN (VALUES
    ('Funções', 1),
    ('Logaritmos', 2),
    ('Trigonometria', 3),
    ('Geometria Analítica', 4),
    ('Probabilidade', 5)
) AS t(nome, ordem)
WHERE m.nome = 'Matemática'
ON CONFLICT (materia_id, nome) DO NOTHING;

INSERT INTO topicos (materia_id, nome, ordem) 
SELECT m.id, t.nome, t.ordem
FROM materias m
CROSS JOIN (VALUES
    ('Interpretação de Texto', 1),
    ('Gramática Normativa', 2),
    ('Sintaxe', 3),
    ('Semântica', 4),
    ('Estilística', 5)
) AS t(nome, ordem)
WHERE m.nome = 'Português'
ON CONFLICT (materia_id, nome) DO NOTHING;

-- Inserir grade de horários de exemplo para uma turma
INSERT INTO horarios_aulas (turma_id, dia_semana, tempo, hora_inicio, hora_fim, materia_id, professor_id, sala)
SELECT 
    ts.id,
    h.dia_semana::dia_semana_enum,
    h.tempo,
    h.hora_inicio::TIME,
    h.hora_fim::TIME,
    m.id,
    p.id,
    h.sala
FROM turmas_sistema ts
CROSS JOIN (VALUES
    ('segunda', 1, '07:00', '07:50', 'Matemática', 'Sala 01'),
    ('segunda', 2, '07:50', '08:40', 'Português', 'Sala 01'),
    ('segunda', 3, '09:00', '09:50', 'Física', 'Sala 01'),
    ('segunda', 4, '09:50', '10:40', 'Química', 'Sala 01'),
    ('terca', 1, '07:00', '07:50', 'Biologia', 'Sala 01'),
    ('terca', 2, '07:50', '08:40', 'Matemática', 'Sala 01'),
    ('quarta', 1, '07:00', '07:50', 'Português', 'Sala 01'),
    ('quarta', 2, '07:50', '08:40', 'Física', 'Sala 01')
) AS h(dia_semana, tempo, hora_inicio, hora_fim, materia_nome, sala)
JOIN materias m ON m.nome = h.materia_nome
JOIN professores p ON p.materia_id = m.id
WHERE ts.codigo = 'PSC-M-01'
ON CONFLICT (turma_id, dia_semana, tempo) DO NOTHING;

-- ====================================================================
-- 18. PROCEDIMENTOS DE MANUTENÇÃO
-- ====================================================================

-- Função para executar inicialização diária (executar via cron)
CREATE OR REPLACE FUNCTION fn_inicializacao_diaria()
RETURNS VOID AS $$
BEGIN
    -- Inicializar presenças do dia
    PERFORM trg_inicializar_presencas_diarias();
    
    -- Limpar logs antigos (manter últimos 90 dias)
    DELETE FROM descritor_logs 
    WHERE created_at < CURRENT_DATE - INTERVAL '90 days';
    
    -- Atualizar estatísticas das tabelas
    ANALYZE descritores;
    ANALYZE minutos_professores;
    ANALYZE professor_presencas;
    
    RAISE NOTICE 'Inicialização diária executada com sucesso';
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 19. VERIFICAÇÃO FINAL
-- ====================================================================

-- Habilitar RLS novamente
SET session_replication_role = DEFAULT;

-- Verificar se todas as tabelas foram criadas
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN (
    'materias', 'professores', 'topicos', 'turmas_sistema',
    'horarios_aulas', 'descritores', 'professor_presencas',
    'minutos_professores', 'descritor_logs', 'configuracoes_sistema'
)
ORDER BY table_name;

-- Verificar se as views foram criadas
SELECT 
    table_name as view_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_type = 'VIEW'
AND table_name LIKE 'vw_%'
ORDER BY table_name;

-- Verificar se as funções foram criadas
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE 'fn_%'
ORDER BY routine_name;

-- Executar inicialização para o dia atual
SELECT fn_inicializacao_diaria();

-- ====================================================================
-- 20. COMANDOS DE FINALIZAÇÃO
-- ====================================================================

-- Comentários finais
COMMENT ON SCHEMA public IS 'Sistema de Descritores - Curso Entropia v2.0';

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '🎉 SISTEMA DE DESCRITORES V2.0 INSTALADO COM SUCESSO!';
    RAISE NOTICE '📊 Tabelas criadas: 10';
    RAISE NOTICE '👁️ Views criadas: 4'; 
    RAISE NOTICE '⚡ Triggers criados: 3';
    RAISE NOTICE '🔧 Funções criadas: 5';
    RAISE NOTICE '🛡️ RLS habilitado em tabelas críticas';
    RAISE NOTICE '✅ Sistema pronto para uso!';
END $$;