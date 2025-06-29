-- ====================================================================
-- 🔧 SISTEMA DE DESCRITORES COMPLETO V2.0 - CURSO ENTROPIA (VERSÃO SEGURA CORRIGIDA)
-- Reestruturação total para três módulos integrados
-- VERSÃO SEGURA: Pode ser reexecutado sem erros
-- CORREÇÃO: Tipagem UUID consistente em todas as chaves estrangeiras
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
-- 2. ENUMS E TIPOS (COM VERIFICAÇÃO)
-- ====================================================================

-- Status de envio dos descritores
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_envio_enum') THEN
        CREATE TYPE status_envio_enum AS ENUM ('pendente', 'sucesso', 'falha', 'cancelado');
    END IF;
END $$;

-- Turnos do dia
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'turno_enum') THEN
        CREATE TYPE turno_enum AS ENUM ('manha', 'tarde', 'noite');
    END IF;
END $$;

-- Dias da semana
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dia_semana_enum') THEN
        CREATE TYPE dia_semana_enum AS ENUM ('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo');
    END IF;
END $$;

-- Status de presença
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_presenca_enum') THEN
        CREATE TYPE status_presenca_enum AS ENUM ('ausente', 'presente', 'atrasado');
    END IF;
END $$;

-- Status de pagamento
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_pagamento_enum') THEN
        CREATE TYPE status_pagamento_enum AS ENUM ('pendente', 'pago', 'cancelado');
    END IF;
END $$;

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
-- 4. TABELA DE PROFESSORES (COM CORREÇÃO DE TIPAGEM UUID)
-- ====================================================================

-- Verificar se a tabela professores já existe e tem a estrutura correta
DO $$
BEGIN
    -- Se a tabela não existe, criar
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'professores') THEN
        CREATE TABLE professores (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    ELSE
        -- Se existe, verificar e ajustar tipo da coluna ID se necessário
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professores' AND column_name = 'id' AND data_type = 'integer') THEN
            -- Aviso sobre conversão necessária
            RAISE NOTICE 'ATENÇÃO: Tabela professores tem ID como INTEGER. Será necessário migrar dados manualmente.';
            RAISE NOTICE 'Recomenda-se fazer backup e recriar a tabela com os dados migrados.';
        END IF;
        
        -- Verificar e adicionar coluna CPF (CRÍTICO)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professores' AND column_name = 'cpf') THEN
            ALTER TABLE professores ADD COLUMN cpf CHAR(11) UNIQUE;
            -- Adicionar constraint de validação apenas se a coluna foi criada
            IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_cpf_valido') THEN
                ALTER TABLE professores ADD CONSTRAINT check_cpf_valido CHECK (LENGTH(cpf) = 11);
            END IF;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professores' AND column_name = 'materia_id') THEN
            ALTER TABLE professores ADD COLUMN materia_id UUID REFERENCES materias(id) ON DELETE SET NULL;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professores' AND column_name = 'valor_por_minuto') THEN
            ALTER TABLE professores ADD COLUMN valor_por_minuto DECIMAL(10,2) DEFAULT 1.85;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professores' AND column_name = 'ativo') THEN
            ALTER TABLE professores ADD COLUMN ativo BOOLEAN DEFAULT true;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professores' AND column_name = 'observacoes') THEN
            ALTER TABLE professores ADD COLUMN observacoes TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professores' AND column_name = 'numero') THEN
            ALTER TABLE professores ADD COLUMN numero INTEGER UNIQUE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professores' AND column_name = 'telefone') THEN
            ALTER TABLE professores ADD COLUMN telefone VARCHAR(20);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professores' AND column_name = 'email') THEN
            ALTER TABLE professores ADD COLUMN email VARCHAR(255);
        END IF;
        
        -- Adicionar constraint de valor positivo se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_valor_positivo') THEN
            ALTER TABLE professores ADD CONSTRAINT check_valor_positivo CHECK (valor_por_minuto > 0);
        END IF;
    END IF;
END $$;

-- Índices para professores (COM VERIFICAÇÃO DE COLUNA)
DO $$
BEGIN
    -- Criar índice CPF apenas se a coluna existir
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professores' AND column_name = 'cpf') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_professores_cpf') THEN
            CREATE INDEX idx_professores_cpf ON professores(cpf);
        END IF;
    END IF;
    
    -- Outros índices
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professores' AND column_name = 'ativo') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_professores_ativo') THEN
            CREATE INDEX idx_professores_ativo ON professores(ativo);
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professores' AND column_name = 'materia_id') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_professores_materia') THEN
            CREATE INDEX idx_professores_materia ON professores(materia_id);
        END IF;
    END IF;
END $$;

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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar constraint de unicidade se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'topicos_materia_id_nome_key') THEN
        ALTER TABLE topicos ADD CONSTRAINT topicos_materia_id_nome_key UNIQUE(materia_id, nome);
    END IF;
END $$;

-- Índices para tópicos (com verificação)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_topicos_materia') THEN
        CREATE INDEX idx_topicos_materia ON topicos(materia_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_topicos_ativo') THEN
        CREATE INDEX idx_topicos_ativo ON topicos(ativo);
    END IF;
END $$;

-- ====================================================================
-- 6. TABELA DE TURMAS (SIMPLIFICADA)
-- ====================================================================

CREATE TABLE IF NOT EXISTS turmas_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    turno turno_enum NOT NULL,
    ano_letivo INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    ativo BOOLEAN DEFAULT true,
    capacidade INTEGER DEFAULT 50,
    whatsapp_grupo VARCHAR(255), -- Link ou ID do grupo
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir turmas padrão se não existirem
INSERT INTO turmas_sistema (codigo, nome, turno) VALUES
('PSC-M-01', 'PSC Manhã Turma 01', 'manha'),
('PSC-T-01', 'PSC Tarde Turma 01', 'tarde'),
('PSC-N-01', 'PSC Noite Turma 01', 'noite'),
('MACRO-M-01', 'MACRO Manhã Turma 01', 'manha'),
('MACRO-T-01', 'MACRO Tarde Turma 01', 'tarde'),
('SIS-M-01', 'SIS Manhã Turma 01', 'manha'),
('SIS-T-01', 'SIS Tarde Turma 01', 'tarde')
ON CONFLICT (codigo) DO NOTHING;

-- Índices para turmas (com verificação)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_turmas_ativo') THEN
        CREATE INDEX idx_turmas_ativo ON turmas_sistema(ativo);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_turmas_turno') THEN
        CREATE INDEX idx_turmas_turno ON turmas_sistema(turno);
    END IF;
END $$;

-- ====================================================================
-- 7. TABELA DE HORÁRIOS (COM CORREÇÃO DE TIPAGEM)
-- ====================================================================

CREATE TABLE IF NOT EXISTS horarios_aulas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    turma_id UUID NOT NULL REFERENCES turmas_sistema(id) ON DELETE CASCADE,
    dia_semana dia_semana_enum NOT NULL,
    tempo INTEGER NOT NULL, -- 1º tempo, 2º tempo, etc.
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    materia_id UUID NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES professores(id) ON DELETE SET NULL,
    sala VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_tempo_valido CHECK (tempo >= 1 AND tempo <= 10),
    CONSTRAINT check_horario_valido CHECK (hora_inicio < hora_fim)
);

-- Verificar e ajustar tipo da coluna professor_id se necessário
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'horarios_aulas' AND column_name = 'professor_id' AND data_type = 'integer') THEN
        RAISE NOTICE 'Ajustando tipo da coluna professor_id de INTEGER para UUID...';
        
        -- Remover constraint de chave estrangeira se existir
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'horarios_aulas_professor_id_fkey') THEN
            ALTER TABLE horarios_aulas DROP CONSTRAINT horarios_aulas_professor_id_fkey;
        END IF;
        
        -- Alterar tipo da coluna
        ALTER TABLE horarios_aulas ALTER COLUMN professor_id TYPE UUID USING NULL;
        
        -- Recriar constraint de chave estrangeira
        ALTER TABLE horarios_aulas ADD CONSTRAINT horarios_aulas_professor_id_fkey 
        FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Constraint de unicidade para evitar conflitos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'unique_horario_turma_tempo') THEN
        ALTER TABLE horarios_aulas ADD CONSTRAINT unique_horario_turma_tempo 
        UNIQUE(turma_id, dia_semana, tempo);
    END IF;
END $$;

-- Índices para horários (com verificação)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_horarios_turma') THEN
        CREATE INDEX idx_horarios_turma ON horarios_aulas(turma_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_horarios_professor') THEN
        CREATE INDEX idx_horarios_professor ON horarios_aulas(professor_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_horarios_dia') THEN
        CREATE INDEX idx_horarios_dia ON horarios_aulas(dia_semana);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_horarios_ativo') THEN
        CREATE INDEX idx_horarios_ativo ON horarios_aulas(ativo);
    END IF;
END $$;

-- ====================================================================
-- 8. TABELA DE DESCRITORES (COM CORREÇÃO DE TIPAGEM)
-- ====================================================================

CREATE TABLE IF NOT EXISTS descritores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    horario_id UUID NOT NULL REFERENCES horarios_aulas(id) ON DELETE CASCADE,
    professor_id UUID NOT NULL REFERENCES professores(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    topico_id UUID REFERENCES topicos(id) ON DELETE SET NULL,
    descricao_livre TEXT,
    minutos_aula INTEGER DEFAULT 50,
    observacoes TEXT,
    enviado BOOLEAN DEFAULT false,
    enviado_em TIMESTAMP WITH TIME ZONE,
    status_envio status_envio_enum DEFAULT 'pendente',
    editavel BOOLEAN DEFAULT true,
    editado_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_minutos_validos CHECK (minutos_aula > 0 AND minutos_aula <= 120),
    CONSTRAINT check_data_valida CHECK (data >= '2024-01-01' AND data <= CURRENT_DATE + INTERVAL '1 year')
);

-- Verificar e ajustar tipo da coluna professor_id se necessário
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'descritores' AND column_name = 'professor_id' AND data_type = 'integer') THEN
        RAISE NOTICE 'Ajustando tipo da coluna professor_id de INTEGER para UUID na tabela descritores...';
        
        -- Remover constraint de chave estrangeira se existir
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'descritores_professor_id_fkey') THEN
            ALTER TABLE descritores DROP CONSTRAINT descritores_professor_id_fkey;
        END IF;
        
        -- Alterar tipo da coluna
        ALTER TABLE descritores ALTER COLUMN professor_id TYPE UUID USING NULL;
        
        -- Recriar constraint de chave estrangeira
        ALTER TABLE descritores ADD CONSTRAINT descritores_professor_id_fkey 
        FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Constraint de unicidade para evitar duplicatas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'unique_descritor_horario_data') THEN
        ALTER TABLE descritores ADD CONSTRAINT unique_descritor_horario_data 
        UNIQUE(horario_id, data);
    END IF;
END $$;

-- Índices para descritores (com verificação)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_descritores_horario') THEN
        CREATE INDEX idx_descritores_horario ON descritores(horario_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_descritores_professor') THEN
        CREATE INDEX idx_descritores_professor ON descritores(professor_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_descritores_data') THEN
        CREATE INDEX idx_descritores_data ON descritores(data);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_descritores_enviado') THEN
        CREATE INDEX idx_descritores_enviado ON descritores(enviado);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_descritores_editavel') THEN
        CREATE INDEX idx_descritores_editavel ON descritores(editavel);
    END IF;
END $$;

-- ====================================================================
-- 9. TABELA DE PRESENÇAS (COM CORREÇÃO DE TIPAGEM)
-- ====================================================================

CREATE TABLE IF NOT EXISTS professor_presencas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID NOT NULL REFERENCES professores(id) ON DELETE CASCADE,
    horario_id UUID NOT NULL REFERENCES horarios_aulas(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    status_presenca status_presenca_enum NOT NULL DEFAULT 'ausente',
    hora_chegada TIME,
    minutos_atraso INTEGER DEFAULT 0,
    observacoes TEXT,
    registrado_por VARCHAR(100), -- Ex: 'portaria', 'admin', 'sistema'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_atraso_valido CHECK (minutos_atraso >= 0 AND minutos_atraso <= 480) -- Max 8h
);

-- Verificar e ajustar tipo da coluna professor_id se necessário
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professor_presencas' AND column_name = 'professor_id' AND data_type = 'integer') THEN
        RAISE NOTICE 'Ajustando tipo da coluna professor_id de INTEGER para UUID na tabela professor_presencas...';
        
        -- Remover constraint de chave estrangeira se existir
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'professor_presencas_professor_id_fkey') THEN
            ALTER TABLE professor_presencas DROP CONSTRAINT professor_presencas_professor_id_fkey;
        END IF;
        
        -- Alterar tipo da coluna
        ALTER TABLE professor_presencas ALTER COLUMN professor_id TYPE UUID USING NULL;
        
        -- Recriar constraint de chave estrangeira
        ALTER TABLE professor_presencas ADD CONSTRAINT professor_presencas_professor_id_fkey 
        FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Constraint de unicidade
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'unique_presenca_professor_horario_data') THEN
        ALTER TABLE professor_presencas ADD CONSTRAINT unique_presenca_professor_horario_data 
        UNIQUE(professor_id, horario_id, data);
    END IF;
END $$;

-- Índices para presenças (com verificação)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_presencas_professor') THEN
        CREATE INDEX idx_presencas_professor ON professor_presencas(professor_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_presencas_data') THEN
        CREATE INDEX idx_presencas_data ON professor_presencas(data);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_presencas_status') THEN
        CREATE INDEX idx_presencas_status ON professor_presencas(status_presenca);
    END IF;
END $$;

-- ====================================================================
-- 10. TABELA DE MINUTOS/PAGAMENTOS (COM CORREÇÃO DE TIPAGEM)
-- ====================================================================

CREATE TABLE IF NOT EXISTS minutos_professores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID NOT NULL REFERENCES professores(id) ON DELETE CASCADE,
    descritor_id UUID NOT NULL REFERENCES descritores(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    minutos_trabalhados INTEGER NOT NULL,
    valor_por_minuto DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) GENERATED ALWAYS AS (minutos_trabalhados * valor_por_minuto) STORED,
    mes_referencia DATE NOT NULL, -- Primeiro dia do mês
    status_pagamento status_pagamento_enum DEFAULT 'pendente',
    pago_em TIMESTAMP WITH TIME ZONE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_minutos_positivos CHECK (minutos_trabalhados > 0),
    CONSTRAINT check_valor_positivo_minuto CHECK (valor_por_minuto > 0)
);

-- Verificar e ajustar tipo da coluna professor_id se necessário
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'minutos_professores' AND column_name = 'professor_id' AND data_type = 'integer') THEN
        RAISE NOTICE 'Ajustando tipo da coluna professor_id de INTEGER para UUID na tabela minutos_professores...';
        
        -- Remover constraint de chave estrangeira se existir
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'minutos_professores_professor_id_fkey') THEN
            ALTER TABLE minutos_professores DROP CONSTRAINT minutos_professores_professor_id_fkey;
        END IF;
        
        -- Alterar tipo da coluna
        ALTER TABLE minutos_professores ALTER COLUMN professor_id TYPE UUID USING NULL;
        
        -- Recriar constraint de chave estrangeira
        ALTER TABLE minutos_professores ADD CONSTRAINT minutos_professores_professor_id_fkey 
        FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Índices para minutos (com verificação)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_minutos_professor') THEN
        CREATE INDEX idx_minutos_professor ON minutos_professores(professor_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_minutos_mes') THEN
        CREATE INDEX idx_minutos_mes ON minutos_professores(mes_referencia);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_minutos_status') THEN
        CREATE INDEX idx_minutos_status ON minutos_professores(status_pagamento);
    END IF;
END $$;

-- ====================================================================
-- 11. TABELA DE LOGS/AUDITORIA
-- ====================================================================

CREATE TABLE IF NOT EXISTS descritor_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    descritor_id UUID REFERENCES descritores(id) ON DELETE SET NULL,
    acao VARCHAR(50) NOT NULL, -- 'criacao', 'edicao', 'envio', 'bloqueio'
    dados_anteriores JSONB,
    dados_novos JSONB,
    usuario_id VARCHAR(100), -- CPF ou ID do admin
    usuario_tipo VARCHAR(20), -- 'professor', 'admin', 'sistema'
    ip_address INET,
    user_agent TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para logs (com verificação)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_logs_descritor') THEN
        CREATE INDEX idx_logs_descritor ON descritor_logs(descritor_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_logs_data') THEN
        CREATE INDEX idx_logs_data ON descritor_logs(created_at);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_logs_acao') THEN
        CREATE INDEX idx_logs_acao ON descritor_logs(acao);
    END IF;
END $$;

-- ====================================================================
-- 12. TABELA DE NOTIFICAÇÕES
-- ====================================================================

CREATE TABLE IF NOT EXISTS notificacoes_professores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_cpf CHAR(11) NOT NULL,
    horario_id UUID REFERENCES horarios_aulas(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'lembrete_aula', 'descritor_pendente', 'pagamento'
    mensagem TEXT NOT NULL,
    telefone_usado VARCHAR(20),
    status_envio status_envio_enum DEFAULT 'pendente',
    erro_envio TEXT,
    tentativas INTEGER DEFAULT 0,
    enviado_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para notificações (com verificação)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notificacoes_cpf') THEN
        CREATE INDEX idx_notificacoes_cpf ON notificacoes_professores(professor_cpf);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notificacoes_data') THEN
        CREATE INDEX idx_notificacoes_data ON notificacoes_professores(data);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notificacoes_status') THEN
        CREATE INDEX idx_notificacoes_status ON notificacoes_professores(status_envio);
    END IF;
END $$;

-- ====================================================================
-- 13. TABELA DE CONFIGURAÇÕES
-- ====================================================================

CREATE TABLE IF NOT EXISTS configuracoes_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descricao TEXT,
    tipo VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    categoria VARCHAR(50) DEFAULT 'geral',
    editavel BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO configuracoes_sistema (chave, valor, descricao, tipo, categoria) VALUES
('portaria_senha', 'entropia2024', 'Senha de acesso ao módulo da portaria', 'string', 'seguranca'),
('notificacao_antecedencia', '60', 'Minutos de antecedência para notificações', 'number', 'notificacoes'),
('notificacao_ativa', 'true', 'Se o sistema de notificações está ativo', 'boolean', 'notificacoes'),
('webhook_pais_url', '', 'URL do webhook para envio aos pais (N8N)', 'string', 'integracao'),
('whatsapp_ativo', 'true', 'Se o envio via WhatsApp está ativo', 'boolean', 'notificacoes'),
('valor_padrao_minuto', '1.85', 'Valor padrão por minuto de aula', 'number', 'pagamentos'),
('minutos_padrao_aula', '50', 'Duração padrão de uma aula em minutos', 'number', 'aulas'),
('auto_gerar_descritores', 'true', 'Auto-gerar descritores para horários ativos', 'boolean', 'sistema')
ON CONFLICT (chave) DO NOTHING;

-- ====================================================================
-- 14. VIEWS PARA CONSULTAS COMPLEXAS
-- ====================================================================

-- View da grade completa com todos os dados necessários
CREATE OR REPLACE VIEW vw_grade_completa AS
SELECT 
    h.id as horario_id,
    h.turma_id,
    ts.codigo as turma_codigo,
    ts.nome as turma_nome,
    ts.turno,
    h.dia_semana,
    h.tempo,
    h.hora_inicio,
    h.hora_fim,
    h.sala,
    m.id as materia_id,
    m.nome as materia_nome,
    m.codigo as materia_codigo,
    m.cor_hex as materia_cor,
    p.id as professor_id,
    p.numero as professor_numero,
    p.nome as professor_nome,
    p.cpf as professor_cpf,
    p.telefone as professor_telefone,
    p.email as professor_email,
    p.valor_por_minuto,
    h.ativo,
    h.created_at,
    h.updated_at
FROM horarios_aulas h
JOIN turmas_sistema ts ON h.turma_id = ts.id
JOIN materias m ON h.materia_id = m.id
LEFT JOIN professores p ON h.professor_id = p.id
WHERE h.ativo = true AND ts.ativo = true;

-- View de resumo de pagamentos por professor (VERSÃO CORRIGIDA)
DROP VIEW IF EXISTS vw_resumo_pagamentos;
DROP VIEW IF EXISTS vw_pagamentos_professores;

CREATE VIEW vw_resumo_pagamentos AS
SELECT 
    p.id as professor_id,
    p.nome as professor_nome,
    p.cpf as professor_cpf,
    mp.mes_referencia,
    COUNT(mp.id) as total_aulas,
    SUM(mp.minutos_trabalhados) as total_minutos,
    ROUND(SUM(mp.valor_total), 2) as valor_total,
    mp.status_pagamento,
    MIN(mp.created_at) as primeira_aula,
    MAX(mp.created_at) as ultima_aula
FROM professores p
JOIN minutos_professores mp ON p.id = mp.professor_id
GROUP BY p.id, p.nome, p.cpf, mp.mes_referencia, mp.status_pagamento
ORDER BY mp.mes_referencia DESC, p.nome;

-- Criar também a view alternativa solicitada
CREATE VIEW vw_pagamentos_professores AS
SELECT
    p.nome AS professor_nome,
    mp.mes_referencia,
    SUM(mp.minutos_trabalhados) AS total_minutos,
    ROUND(SUM(mp.valor_total), 2) AS valor_total,
    mp.status_pagamento
FROM minutos_professores mp
JOIN professores p ON p.id = mp.professor_id
GROUP BY p.nome, mp.mes_referencia, mp.status_pagamento;

-- ====================================================================
-- 15. TRIGGERS PARA AUTOMAÇÃO
-- ====================================================================

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de updated_at em todas as tabelas relevantes
DO $$
DECLARE
    tabela_nome TEXT;
    tabelas TEXT[] := ARRAY[
        'materias', 'professores', 'topicos', 'turmas_sistema', 
        'horarios_aulas', 'descritores', 'professor_presencas', 
        'minutos_professores', 'configuracoes_sistema'
    ];
BEGIN
    FOREACH tabela_nome IN ARRAY tabelas LOOP
        -- Verificar se o trigger já existe
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'trigger_updated_at_' || tabela_nome
        ) THEN
            EXECUTE format('
                CREATE TRIGGER trigger_updated_at_%I
                BEFORE UPDATE ON %I
                FOR EACH ROW
                EXECUTE FUNCTION atualizar_updated_at()
            ', tabela_nome, tabela_nome);
        END IF;
    END LOOP;
END $$;

-- Função para calcular minutos automaticamente
CREATE OR REPLACE FUNCTION calcular_minutos_professor()
RETURNS TRIGGER AS $$
BEGIN
    -- Quando um descritor é atualizado/criado
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Remover entrada antiga se existir (para updates)
        DELETE FROM minutos_professores 
        WHERE descritor_id = NEW.id;
        
        -- Criar nova entrada apenas se descritor estiver preenchido
        IF NEW.descricao_livre IS NOT NULL AND NEW.descricao_livre != '' THEN
            INSERT INTO minutos_professores (
                professor_id,
                descritor_id,
                data,
                minutos_trabalhados,
                valor_por_minuto,
                mes_referencia
            )
            SELECT 
                NEW.professor_id,
                NEW.id,
                NEW.data,
                NEW.minutos_aula,
                COALESCE(p.valor_por_minuto, 1.85),
                DATE_TRUNC('month', NEW.data)::DATE
            FROM professores p
            WHERE p.id = NEW.professor_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- Para DELETE
    IF TG_OP = 'DELETE' THEN
        DELETE FROM minutos_professores 
        WHERE descritor_id = OLD.id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de cálculo de minutos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_calcular_minutos'
    ) THEN
        CREATE TRIGGER trigger_calcular_minutos
        AFTER INSERT OR UPDATE OR DELETE ON descritores
        FOR EACH ROW
        EXECUTE FUNCTION calcular_minutos_professor();
    END IF;
END $$;

-- Função para log de auditoria
CREATE OR REPLACE FUNCTION log_mudancas_descritor()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO descritor_logs (descritor_id, acao, dados_novos, usuario_tipo)
        VALUES (NEW.id, 'criacao', to_jsonb(NEW), 'sistema');
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO descritor_logs (descritor_id, acao, dados_anteriores, dados_novos, usuario_tipo)
        VALUES (NEW.id, 'edicao', to_jsonb(OLD), to_jsonb(NEW), 
                CASE WHEN NEW.editado_admin THEN 'admin' ELSE 'professor' END);
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        INSERT INTO descritor_logs (descritor_id, acao, dados_anteriores, usuario_tipo)
        VALUES (OLD.id, 'exclusao', to_jsonb(OLD), 'sistema');
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de auditoria
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_log_descritores'
    ) THEN
        CREATE TRIGGER trigger_log_descritores
        AFTER INSERT OR UPDATE OR DELETE ON descritores
        FOR EACH ROW
        EXECUTE FUNCTION log_mudancas_descritor();
    END IF;
END $$;

-- ====================================================================
-- 16. FUNÇÕES AUXILIARES
-- ====================================================================

-- Função para obter dia da semana em português
CREATE OR REPLACE FUNCTION obter_dia_semana(data_input DATE)
RETURNS dia_semana_enum AS $$
BEGIN
    CASE EXTRACT(DOW FROM data_input)
        WHEN 0 THEN RETURN 'domingo';
        WHEN 1 THEN RETURN 'segunda';
        WHEN 2 THEN RETURN 'terca';
        WHEN 3 THEN RETURN 'quarta';
        WHEN 4 THEN RETURN 'quinta';
        WHEN 5 THEN RETURN 'sexta';
        WHEN 6 THEN RETURN 'sabado';
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para gerar descritores automaticamente
CREATE OR REPLACE FUNCTION gerar_descritores_automaticos(data_aula DATE)
RETURNS INTEGER AS $$
DECLARE
    contador INTEGER := 0;
    horario_record RECORD;
    dia_semana_aula dia_semana_enum;
BEGIN
    -- Obter dia da semana
    dia_semana_aula := obter_dia_semana(data_aula);
    
    -- Verificar se auto-geração está ativa
    IF NOT EXISTS (
        SELECT 1 FROM configuracoes_sistema 
        WHERE chave = 'auto_gerar_descritores' AND valor = 'true'
    ) THEN
        RETURN 0;
    END IF;
    
    -- Gerar descritores para todos os horários do dia
    FOR horario_record IN 
        SELECT * FROM vw_grade_completa 
        WHERE dia_semana = dia_semana_aula 
        AND professor_id IS NOT NULL
    LOOP
        -- Verificar se já existe
        IF NOT EXISTS (
            SELECT 1 FROM descritores 
            WHERE horario_id = horario_record.horario_id 
            AND data = data_aula
        ) THEN
            INSERT INTO descritores (
                horario_id,
                professor_id,
                data,
                minutos_aula
            ) VALUES (
                horario_record.horario_id,
                horario_record.professor_id,
                data_aula,
                (SELECT valor::INTEGER FROM configuracoes_sistema WHERE chave = 'minutos_padrao_aula')
            );
            contador := contador + 1;
        END IF;
    END LOOP;
    
    RETURN contador;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 17. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ====================================================================

-- Reabilitar RLS
SET session_replication_role = DEFAULT;

-- Ativar RLS nas tabelas principais
ALTER TABLE descritores ENABLE ROW LEVEL SECURITY;
ALTER TABLE professor_presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE minutos_professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes_professores ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se existirem para recriar
DO $$
BEGIN
    -- Remover políticas existentes
    DROP POLICY IF EXISTS pol_descritores_professor ON descritores;
    DROP POLICY IF EXISTS pol_descritores_admin ON descritores;
    DROP POLICY IF EXISTS pol_presencas_professor ON professor_presencas;
    DROP POLICY IF EXISTS pol_minutos_professor ON minutos_professores;
END $$;

-- Política para professores verem apenas seus dados
CREATE POLICY pol_descritores_professor ON descritores
    FOR ALL TO public
    USING (
        professor_id IN (
            SELECT id FROM professores 
            WHERE cpf = current_setting('app.current_user_cpf', true)
        )
    )
    WITH CHECK (
        professor_id IN (
            SELECT id FROM professores 
            WHERE cpf = current_setting('app.current_user_cpf', true)
        )
    );

-- Política para admin ver tudo
CREATE POLICY pol_descritores_admin ON descritores
    FOR ALL TO public
    USING (current_setting('app.user_role', true) = 'admin')
    WITH CHECK (current_setting('app.user_role', true) = 'admin');

-- Políticas similares para outras tabelas
CREATE POLICY pol_presencas_professor ON professor_presencas
    FOR ALL TO public
    USING (
        professor_id IN (
            SELECT id FROM professores 
            WHERE cpf = current_setting('app.current_user_cpf', true)
        )
        OR current_setting('app.user_role', true) = 'admin'
    );

CREATE POLICY pol_minutos_professor ON minutos_professores
    FOR ALL TO public
    USING (
        professor_id IN (
            SELECT id FROM professores 
            WHERE cpf = current_setting('app.current_user_cpf', true)
        )
        OR current_setting('app.user_role', true) = 'admin'
    );

-- ====================================================================
-- 18. INSERIR DADOS DE EXEMPLO (OPCIONAL)
-- ====================================================================

-- Tópicos de exemplo para cada matéria
DO $$
DECLARE
    materia_record RECORD;
BEGIN
    -- Inserir alguns tópicos de exemplo
    FOR materia_record IN SELECT id, nome FROM materias WHERE ativo = true LOOP
        -- Tópicos gerais aplicáveis a qualquer matéria
        INSERT INTO topicos (materia_id, nome, ordem) VALUES
        (materia_record.id, 'Revisão da aula anterior', 1),
        (materia_record.id, 'Exercícios práticos', 2),
        (materia_record.id, 'Conteúdo novo', 3),
        (materia_record.id, 'Simulado e questões', 4),
        (materia_record.id, 'Dúvidas dos alunos', 5)
        ON CONFLICT (materia_id, nome) DO NOTHING;
        
        -- Tópicos específicos por matéria
        CASE materia_record.nome
            WHEN 'Matemática' THEN
                INSERT INTO topicos (materia_id, nome, ordem) VALUES
                (materia_record.id, 'Funções', 10),
                (materia_record.id, 'Geometria', 11),
                (materia_record.id, 'Probabilidade', 12),
                (materia_record.id, 'Estatística', 13)
                ON CONFLICT (materia_id, nome) DO NOTHING;
            
            WHEN 'Português' THEN
                INSERT INTO topicos (materia_id, nome, ordem) VALUES
                (materia_record.id, 'Gramática', 10),
                (materia_record.id, 'Interpretação de texto', 11),
                (materia_record.id, 'Redação', 12),
                (materia_record.id, 'Literatura', 13)
                ON CONFLICT (materia_id, nome) DO NOTHING;
            
            WHEN 'Física' THEN
                INSERT INTO topicos (materia_id, nome, ordem) VALUES
                (materia_record.id, 'Mecânica', 10),
                (materia_record.id, 'Termodinâmica', 11),
                (materia_record.id, 'Eletromagnetismo', 12),
                (materia_record.id, 'Óptica', 13)
                ON CONFLICT (materia_id, nome) DO NOTHING;
            
            ELSE
                -- Para outras matérias, inserir tópicos genéricos
                NULL;
        END CASE;
    END LOOP;
END $$;

-- ====================================================================
-- 19. FINALIZAÇÃO
-- ====================================================================

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ SISTEMA DE DESCRITORES V2.0 INSTALADO COM SUCESSO!';
    RAISE NOTICE '🔧 CORREÇÕES APLICADAS:';
    RAISE NOTICE '   - Tipagem UUID consistente em todas as chaves estrangeiras';
    RAISE NOTICE '   - Conversão automática de tipos incompatíveis';
    RAISE NOTICE '   - Verificações de segurança para reexecução';
    RAISE NOTICE '📊 Estrutura completa criada com:';
    RAISE NOTICE '   - % tabelas principais', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('materias', 'professores', 'topicos', 'turmas_sistema', 'horarios_aulas', 'descritores', 'professor_presencas', 'minutos_professores', 'descritor_logs', 'notificacoes_professores', 'configuracoes_sistema'));
    RAISE NOTICE '   - % views de consulta', (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public' AND table_name LIKE 'vw_%');
    RAISE NOTICE '   - % funções e triggers', (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE '%descritor%' OR routine_name LIKE '%professor%');
    RAISE NOTICE '🔐 Políticas RLS ativadas para segurança';
    RAISE NOTICE '📱 Pronto para usar com os 3 módulos: Professor, Admin, Portaria';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Próximos passos:';
    RAISE NOTICE '1. Configurar APIs no Next.js';
    RAISE NOTICE '2. Testar autenticação de professores';
    RAISE NOTICE '3. Popular dados iniciais de professores e horários';
    RAISE NOTICE '4. Configurar sistema de notificações';
END $$;

-- ====================================================================
-- FIM DO SCRIPT
-- ====================================================================