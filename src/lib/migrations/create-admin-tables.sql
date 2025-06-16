-- Estrutura Supabase para Admin Panel Simplificado

-- 1. Tabela de Professores
CREATE TABLE IF NOT EXISTS professores (
    id SERIAL PRIMARY KEY,
    numero INTEGER UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    cpf CHAR(11) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Horários das Aulas
CREATE TABLE IF NOT EXISTS horarios_aulas (
    id SERIAL PRIMARY KEY,
    dia_semana VARCHAR(20) NOT NULL CHECK (dia_semana IN ('Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado')),
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    materia VARCHAR(255) NOT NULL,
    turma VARCHAR(255) NOT NULL,
    sala VARCHAR(50),
    professor_id INTEGER REFERENCES professores(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Descritores
CREATE TABLE IF NOT EXISTS descritores (
    id SERIAL PRIMARY KEY,
    horario_id INTEGER REFERENCES horarios_aulas(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    descricao TEXT NOT NULL,
    preenchido_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(horario_id, data)
);

-- 4. Tabela de Turmas da Página Inicial
CREATE TABLE IF NOT EXISTS turmas_home (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    periodo VARCHAR(20) NOT NULL CHECK (periodo IN ('Manhã', 'Tarde', 'Noite')),
    vagas INTEGER NOT NULL CHECK (vagas > 0),
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_horarios_aulas_dia_semana ON horarios_aulas(dia_semana);
CREATE INDEX IF NOT EXISTS idx_horarios_aulas_professor_id ON horarios_aulas(professor_id);
CREATE INDEX IF NOT EXISTS idx_descritores_data ON descritores(data);
CREATE INDEX IF NOT EXISTS idx_descritores_horario_id ON descritores(horario_id);
CREATE INDEX IF NOT EXISTS idx_turmas_home_ativo ON turmas_home(ativo);
CREATE INDEX IF NOT EXISTS idx_turmas_home_ordem ON turmas_home(ordem);

-- RLS (Row Level Security) - Opcional se necessário
-- ALTER TABLE professores ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE horarios_aulas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE descritores ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE turmas_home ENABLE ROW LEVEL SECURITY;

-- Functions para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_professores_updated_at BEFORE UPDATE ON professores
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_horarios_aulas_updated_at BEFORE UPDATE ON horarios_aulas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_turmas_home_updated_at BEFORE UPDATE ON turmas_home
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Dados iniciais de exemplo (opcional)
INSERT INTO professores (numero, nome, cpf) VALUES
(1, 'Prof. João Silva', '12345678901'),
(2, 'Prof. Maria Santos', '12345678902'),
(3, 'Prof. Pedro Costa', '12345678903')
ON CONFLICT (numero) DO NOTHING;

INSERT INTO turmas_home (nome, descricao, periodo, vagas, ativo, ordem) VALUES
('1º Ano - Manhã', 'Turma preparatória para vestibular - período matutino', 'Manhã', 30, true, 1),
('1º Ano - Tarde', 'Turma preparatória para vestibular - período vespertino', 'Tarde', 25, true, 2),
('2º Ano - Noite', 'Turma intensiva para ENEM - período noturno', 'Noite', 20, true, 3)
ON CONFLICT DO NOTHING;