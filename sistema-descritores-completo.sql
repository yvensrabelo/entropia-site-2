-- ====================================================================
-- SISTEMA DE DESCRITORES COMPLETO - SUPABASE
-- Script de criação/alteração para atender todos os requisitos
-- ====================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. ENUMS E TIPOS
-- ====================================================================

-- Enum para status de envio
CREATE TYPE status_envio AS ENUM ('pendente', 'enviado', 'falha', 'cancelado');

-- Enum para turnos
CREATE TYPE turno_enum AS ENUM ('MATUTINO', 'VESPERTINO', 'NOTURNO');

-- Enum para dias da semana
CREATE TYPE dia_semana_enum AS ENUM ('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo');

-- ====================================================================
-- 2. ALTERAÇÕES NA TABELA DE PROFESSORES
-- ====================================================================

-- Adicionar matéria fixa ao professor
ALTER TABLE professores 
ADD COLUMN IF NOT EXISTS materia VARCHAR(100),
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS valor_por_minuto DECIMAL(10,2) DEFAULT 1.85;

-- Comentários para documentação
COMMENT ON COLUMN professores.materia IS 'Matéria principal que o professor leciona';
COMMENT ON COLUMN professores.valor_por_minuto IS 'Valor pago por minuto de aula (padrão R$ 1,85)';

-- ====================================================================
-- 3. NOVA TABELA DE TÓPICOS POR MATÉRIA
-- ====================================================================

CREATE TABLE IF NOT EXISTS topicos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    materia VARCHAR(100) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    INDEX idx_topicos_materia (materia),
    INDEX idx_topicos_ativo (ativo)
);

COMMENT ON TABLE topicos IS 'Tópicos cadastrados por matéria para seleção nos descritores';

-- Inserir alguns tópicos de exemplo
INSERT INTO topicos (materia, nome, ordem) VALUES
('Matemática', 'Álgebra Linear', 1),
('Matemática', 'Geometria Analítica', 2),
('Matemática', 'Trigonometria', 3),
('Português', 'Interpretação de Texto', 1),
('Português', 'Gramática Normativa', 2),
('Português', 'Literatura Brasileira', 3),
('Física', 'Mecânica', 1),
('Física', 'Termodinâmica', 2),
('Física', 'Eletromagnetismo', 3),
('Química', 'Química Orgânica', 1),
('Química', 'Físico-Química', 2),
('Química', 'Química Inorgânica', 3),
('Biologia', 'Biologia Celular', 1),
('Biologia', 'Genética', 2),
('Biologia', 'Ecologia', 3),
('História', 'História do Brasil', 1),
('História', 'História Geral', 2),
('Geografia', 'Geografia Física', 1),
('Geografia', 'Geografia Humana', 2)
ON CONFLICT DO NOTHING;

-- ====================================================================
-- 4. MELHORIAS NA TABELA DE HORÁRIOS
-- ====================================================================

-- Renomear e melhorar a tabela existente
DROP TABLE IF EXISTS horarios_aulas_old;
ALTER TABLE horarios_aulas RENAME TO horarios_aulas_old;

CREATE TABLE horarios_aulas (
    id SERIAL PRIMARY KEY,
    turma_id VARCHAR(100) NOT NULL, -- Referência flexível à turma
    dia_semana dia_semana_enum NOT NULL,
    tempo INTEGER NOT NULL, -- 1º tempo, 2º tempo, etc.
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    duracao_minutos INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (hora_fim - hora_inicio)) / 60
    ) STORED,
    materia VARCHAR(100) NOT NULL,
    professor_id INTEGER REFERENCES professores(id) ON DELETE SET NULL,
    sala VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(turma_id, dia_semana, tempo),
    CHECK (hora_fim > hora_inicio),
    CHECK (tempo > 0),
    
    -- Índices
    INDEX idx_horarios_turma (turma_id),
    INDEX idx_horarios_professor (professor_id),
    INDEX idx_horarios_dia (dia_semana),
    INDEX idx_horarios_ativo (ativo)
);

COMMENT ON TABLE horarios_aulas IS 'Grade de horários semanal com tempos definidos';
COMMENT ON COLUMN horarios_aulas.tempo IS 'Número do tempo da aula (1º, 2º, 3º, etc.)';
COMMENT ON COLUMN horarios_aulas.duracao_minutos IS 'Duração automática calculada em minutos';

-- Migrar dados da tabela antiga se existir
INSERT INTO horarios_aulas (turma_id, dia_semana, tempo, hora_inicio, hora_fim, materia, professor_id, sala)
SELECT 
    turma,
    CASE 
        WHEN dia_semana = 'Segunda' THEN 'segunda'::dia_semana_enum
        WHEN dia_semana = 'Terça' THEN 'terca'::dia_semana_enum
        WHEN dia_semana = 'Quarta' THEN 'quarta'::dia_semana_enum
        WHEN dia_semana = 'Quinta' THEN 'quinta'::dia_semana_enum
        WHEN dia_semana = 'Sexta' THEN 'sexta'::dia_semana_enum
        WHEN dia_semana = 'Sábado' THEN 'sabado'::dia_semana_enum
        ELSE 'segunda'::dia_semana_enum
    END,
    1, -- tempo padrão
    hora_inicio,
    hora_fim,
    materia,
    professor_id,
    sala
FROM horarios_aulas_old
WHERE EXISTS (SELECT 1 FROM horarios_aulas_old)
ON CONFLICT DO NOTHING;

-- ====================================================================
-- 5. REESTRUTURAÇÃO COMPLETA DA TABELA DESCRITORES
-- ====================================================================

-- Backup da tabela antiga
DROP TABLE IF EXISTS descritores_old;
ALTER TABLE descritores RENAME TO descritores_old;

CREATE TABLE descritores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    horario_id INTEGER NOT NULL REFERENCES horarios_aulas(id) ON DELETE CASCADE,
    professor_id INTEGER NOT NULL REFERENCES professores(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    turma_id VARCHAR(100) NOT NULL,
    materia VARCHAR(100) NOT NULL, -- Preenchido automaticamente
    topico_id UUID REFERENCES topicos(id) ON DELETE SET NULL,
    topico_nome VARCHAR(255), -- Cache do nome do tópico
    descricao_livre TEXT NOT NULL,
    minutos_aula INTEGER NOT NULL, -- Calculado automaticamente
    enviado_pais BOOLEAN DEFAULT false,
    status_envio status_envio DEFAULT 'pendente',
    tentativas_envio INTEGER DEFAULT 0,
    data_envio TIMESTAMP WITH TIME ZONE,
    erro_envio TEXT,
    ip_submissao INET,
    user_agent TEXT,
    editavel BOOLEAN DEFAULT true, -- Permite bloquear edição
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(horario_id, data), -- Um descritor por horário por data
    CHECK (minutos_aula > 0),
    CHECK (tentativas_envio >= 0),
    
    -- Índices para performance
    INDEX idx_descritores_data (data),
    INDEX idx_descritores_professor (professor_id),
    INDEX idx_descritores_turma (turma_id),
    INDEX idx_descritores_status (status_envio),
    INDEX idx_descritores_enviado (enviado_pais)
);

COMMENT ON TABLE descritores IS 'Descritores de aulas com controle completo de envio';
COMMENT ON COLUMN descritores.editavel IS 'Define se o descritor ainda pode ser editado pelo professor';

-- ====================================================================
-- 6. TABELA DE ATRASOS E PRESENÇAS DE PROFESSORES
-- ====================================================================

CREATE TABLE IF NOT EXISTS professor_presencas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id INTEGER NOT NULL REFERENCES professores(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    horario_id INTEGER NOT NULL REFERENCES horarios_aulas(id) ON DELETE CASCADE,
    presente BOOLEAN DEFAULT false,
    hora_chegada TIME,
    minutos_atraso INTEGER DEFAULT 0,
    observacoes TEXT,
    registrado_por VARCHAR(255), -- Quem da portaria registrou
    ip_registro INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(professor_id, data, horario_id),
    CHECK (minutos_atraso >= 0),
    
    -- Índices
    INDEX idx_prof_presencas_data (data),
    INDEX idx_prof_presencas_professor (professor_id),
    INDEX idx_prof_presencas_presente (presente)
);

COMMENT ON TABLE professor_presencas IS 'Controle de presença e atrasos dos professores';

-- ====================================================================
-- 7. TABELA DE PAGAMENTOS POR MINUTO
-- ====================================================================

CREATE TABLE IF NOT EXISTS professor_pagamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id INTEGER NOT NULL REFERENCES professores(id) ON DELETE CASCADE,
    mes_referencia DATE NOT NULL, -- Primeiro dia do mês de referência
    total_minutos INTEGER DEFAULT 0,
    total_aulas INTEGER DEFAULT 0,
    valor_por_minuto DECIMAL(10,2) DEFAULT 1.85,
    valor_total DECIMAL(10,2) GENERATED ALWAYS AS (total_minutos * valor_por_minuto) STORED,
    status_pagamento VARCHAR(50) DEFAULT 'pendente',
    data_pagamento DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(professor_id, mes_referencia),
    CHECK (total_minutos >= 0),
    CHECK (total_aulas >= 0),
    CHECK (valor_por_minuto > 0),
    
    -- Índices
    INDEX idx_pagamentos_mes (mes_referencia),
    INDEX idx_pagamentos_professor (professor_id),
    INDEX idx_pagamentos_status (status_pagamento)
);

COMMENT ON TABLE professor_pagamentos IS 'Consolidação mensal de pagamentos por minuto de aula';

-- ====================================================================
-- 8. LOGS ESPECÍFICOS PARA DESCRITORES
-- ====================================================================

CREATE TABLE IF NOT EXISTS descritor_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    descritor_id UUID REFERENCES descritores(id) ON DELETE CASCADE,
    professor_id INTEGER NOT NULL REFERENCES professores(id) ON DELETE CASCADE,
    acao VARCHAR(100) NOT NULL, -- 'criado', 'editado', 'enviado', 'bloqueado'
    dados_antigos JSONB,
    dados_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    INDEX idx_descritor_logs_descritor (descritor_id),
    INDEX idx_descritor_logs_professor (professor_id),
    INDEX idx_descritor_logs_acao (acao),
    INDEX idx_descritor_logs_data (created_at)
);

COMMENT ON TABLE descritor_logs IS 'Log completo de todas as ações nos descritores';

-- ====================================================================
-- 9. VIEWS PARA FACILITAR CONSULTAS
-- ====================================================================

-- View para descritores completos com informações consolidadas
CREATE OR REPLACE VIEW vw_descritores_completos AS
SELECT 
    d.id,
    d.data,
    d.turma_id,
    d.materia,
    p.nome as professor_nome,
    p.cpf as professor_cpf,
    h.dia_semana,
    h.tempo,
    h.hora_inicio,
    h.hora_fim,
    h.sala,
    t.nome as topico_nome,
    d.descricao_livre,
    d.minutos_aula,
    d.enviado_pais,
    d.status_envio,
    d.editavel,
    d.created_at,
    d.updated_at
FROM descritores d
JOIN professores p ON d.professor_id = p.id
JOIN horarios_aulas h ON d.horario_id = h.id
LEFT JOIN topicos t ON d.topico_id = t.id;

-- View para pagamentos mensais consolidados
CREATE OR REPLACE VIEW vw_pagamentos_professores AS
SELECT 
    p.nome as professor_nome,
    p.cpf as professor_cpf,
    p.materia,
    pp.mes_referencia,
    pp.total_minutos,
    pp.total_aulas,
    pp.valor_por_minuto,
    pp.valor_total,
    pp.status_pagamento,
    pp.data_pagamento
FROM professor_pagamentos pp
JOIN professores p ON pp.professor_id = p.id
ORDER BY pp.mes_referencia DESC, p.nome;

-- View para grade de horários completa
CREATE OR REPLACE VIEW vw_grade_horarios AS
SELECT 
    h.turma_id,
    h.dia_semana,
    h.tempo,
    h.hora_inicio,
    h.hora_fim,
    h.duracao_minutos,
    h.materia,
    p.nome as professor_nome,
    p.cpf as professor_cpf,
    h.sala,
    h.ativo
FROM horarios_aulas h
LEFT JOIN professores p ON h.professor_id = p.id
ORDER BY h.turma_id, h.dia_semana, h.tempo;

-- ====================================================================
-- 10. TRIGGERS PARA AUTOMATIZAÇÕES
-- ====================================================================

-- Trigger para preencher automaticamente campos do descritor
CREATE OR REPLACE FUNCTION trigger_descritor_auto_fill()
RETURNS TRIGGER AS $$
BEGIN
    -- Preencher matéria automaticamente baseada no horário
    SELECT h.materia, h.duracao_minutos, h.turma_id
    INTO NEW.materia, NEW.minutos_aula, NEW.turma_id
    FROM horarios_aulas h
    WHERE h.id = NEW.horario_id;
    
    -- Preencher nome do tópico se selecionado
    IF NEW.topico_id IS NOT NULL THEN
        SELECT nome INTO NEW.topico_nome
        FROM topicos
        WHERE id = NEW.topico_id;
    END IF;
    
    -- Atualizar timestamp
    NEW.updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_descritor_auto_fill
    BEFORE INSERT OR UPDATE ON descritores
    FOR EACH ROW
    EXECUTE FUNCTION trigger_descritor_auto_fill();

-- Trigger para log de alterações em descritores
CREATE OR REPLACE FUNCTION trigger_descritor_log()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO descritor_logs (descritor_id, professor_id, acao, dados_novos)
        VALUES (NEW.id, NEW.professor_id, 'criado', row_to_json(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO descritor_logs (descritor_id, professor_id, acao, dados_antigos, dados_novos)
        VALUES (NEW.id, NEW.professor_id, 'editado', row_to_json(OLD), row_to_json(NEW));
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_descritor_log
    AFTER INSERT OR UPDATE ON descritores
    FOR EACH ROW
    EXECUTE FUNCTION trigger_descritor_log();

-- ====================================================================
-- 11. FUNÇÕES ÚTEIS
-- ====================================================================

-- Função para calcular pagamento mensal de um professor
CREATE OR REPLACE FUNCTION calcular_pagamento_professor(
    p_professor_id INTEGER,
    p_mes_referencia DATE
) RETURNS TABLE (
    total_minutos INTEGER,
    total_aulas INTEGER,
    valor_total DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(d.minutos_aula), 0)::INTEGER as total_minutos,
        COUNT(d.id)::INTEGER as total_aulas,
        (COALESCE(SUM(d.minutos_aula), 0) * 
         COALESCE(p.valor_por_minuto, 1.85))::DECIMAL as valor_total
    FROM descritores d
    JOIN professores p ON d.professor_id = p.id
    WHERE d.professor_id = p_professor_id
    AND DATE_TRUNC('month', d.data) = DATE_TRUNC('month', p_mes_referencia);
END;
$$ LANGUAGE plpgsql;

-- Função para consolidar pagamento mensal
CREATE OR REPLACE FUNCTION consolidar_pagamento_mensal(
    p_professor_id INTEGER,
    p_mes_referencia DATE
) RETURNS UUID AS $$
DECLARE
    v_pagamento_id UUID;
    v_stats RECORD;
BEGIN
    -- Calcular estatísticas
    SELECT * INTO v_stats 
    FROM calcular_pagamento_professor(p_professor_id, p_mes_referencia);
    
    -- Inserir ou atualizar pagamento
    INSERT INTO professor_pagamentos (
        professor_id, 
        mes_referencia, 
        total_minutos, 
        total_aulas
    ) VALUES (
        p_professor_id,
        DATE_TRUNC('month', p_mes_referencia),
        v_stats.total_minutos,
        v_stats.total_aulas
    )
    ON CONFLICT (professor_id, mes_referencia) 
    DO UPDATE SET
        total_minutos = EXCLUDED.total_minutos,
        total_aulas = EXCLUDED.total_aulas,
        updated_at = NOW()
    RETURNING id INTO v_pagamento_id;
    
    RETURN v_pagamento_id;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 12. POLÍTICAS DE SEGURANÇA (RLS)
-- ====================================================================

-- Habilitar RLS nas tabelas sensíveis
ALTER TABLE descritores ENABLE ROW LEVEL SECURITY;
ALTER TABLE descritor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE professor_presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE professor_pagamentos ENABLE ROW LEVEL SECURITY;

-- Política para professores (só veem seus próprios dados)
CREATE POLICY professor_descritores_policy ON descritores
    USING (professor_id = (
        SELECT id FROM professores 
        WHERE cpf = (auth.jwt() ->> 'cpf')
    ));

-- Política para admins (veem tudo)
CREATE POLICY admin_descritores_policy ON descritores
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    ));

-- ====================================================================
-- 13. ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ====================================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_descritores_data_professor 
ON descritores (data, professor_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_descritores_turma_data 
ON descritores (turma_id, data);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_horarios_professor_ativo 
ON horarios_aulas (professor_id, ativo);

-- ====================================================================
-- 14. COMENTÁRIOS FINAIS E DOCUMENTAÇÃO
-- ====================================================================

COMMENT ON DATABASE postgres IS 'Sistema de Descritores - Entropia Cursinho';

-- Inserir configuração inicial
INSERT INTO topicos (materia, nome, descricao, ordem) VALUES
('Redação', 'Dissertação Argumentativa', 'Estrutura e desenvolvimento de dissertações', 1),
('Redação', 'Coesão e Coerência', 'Elementos de ligação textual', 2),
('Redação', 'Proposta de Intervenção', 'Elaboração de soluções para problemas sociais', 3)
ON CONFLICT DO NOTHING;

-- ====================================================================
-- FIM DO SCRIPT
-- ====================================================================

-- Para verificar se tudo foi criado corretamente:
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN (
    'professores', 'topicos', 'horarios_aulas', 'descritores',
    'professor_presencas', 'professor_pagamentos', 'descritor_logs'
)
ORDER BY tablename;