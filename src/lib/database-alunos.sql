-- SISTEMA DE GESTÃO DE ALUNOS - FASE 1
-- Estrutura base para gerenciamento de alunos, turmas e matrículas

-- Tabela de configuração das turmas
CREATE TABLE IF NOT EXISTS turmas_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(10) NOT NULL, -- Ex: T1, T2
  nome VARCHAR(100) NOT NULL, -- Ex: PREVEST, TURMA SEGUNDO ANO
  turno VARCHAR(20) NOT NULL CHECK (turno IN ('MATUTINO', 'VESPERTINO', 'NOTURNO')),
  capacidade_maxima INTEGER DEFAULT 45,
  vagas_ocupadas INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(codigo, nome, turno) -- Evita duplicatas de turma
);

-- Tabela de alunos
CREATE TABLE IF NOT EXISTS alunos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(255),
  data_nascimento DATE,
  endereco TEXT,
  nome_responsavel VARCHAR(255),
  telefone_responsavel VARCHAR(20),
  cpf_responsavel VARCHAR(14),
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de matrículas
CREATE TABLE IF NOT EXISTS matriculas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES turmas_config(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'confirmada', 'ativa', 'trancada', 'cancelada')),
  data_pre_matricula TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  data_matricula_confirmada TIMESTAMP WITH TIME ZONE,
  data_status_alterado TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  asaas_customer_id VARCHAR(100),
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(aluno_id, turma_id, status) -- Evita duplicatas
);

-- Tabela de presenças
CREATE TABLE IF NOT EXISTS presencas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  matricula_id UUID REFERENCES matriculas(id),
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  origem VARCHAR(20) DEFAULT 'catraca' CHECK (origem IN ('catraca', 'manual')),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_matriculas_status ON matriculas(status);
CREATE INDEX IF NOT EXISTS idx_matriculas_aluno ON matriculas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_turma ON matriculas(turma_id);
CREATE INDEX IF NOT EXISTS idx_presencas_aluno ON presencas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_presencas_data ON presencas(data_hora);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers apenas se não existirem
DROP TRIGGER IF EXISTS update_turmas_config_updated_at ON turmas_config;
CREATE TRIGGER update_turmas_config_updated_at BEFORE UPDATE ON turmas_config
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_alunos_updated_at ON alunos;
CREATE TRIGGER update_alunos_updated_at BEFORE UPDATE ON alunos
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_matriculas_updated_at ON matriculas;
CREATE TRIGGER update_matriculas_updated_at BEFORE UPDATE ON matriculas
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Inserir dados das turmas existentes (apenas se não existirem)
INSERT INTO turmas_config (codigo, nome, turno, vagas_ocupadas) VALUES
  ('T1', 'PREVEST', 'MATUTINO', 34),
  ('T1', 'PREVEST', 'VESPERTINO', 39),
  ('T1', 'PREVEST', 'NOTURNO', 36),
  ('T1', 'TURMA SEGUNDO ANO', 'VESPERTINO', 20),
  ('T1', 'TURMA PRIMEIRO ANO', 'VESPERTINO', 8),
  ('T2', 'PREVEST', 'MATUTINO', 27),
  ('T2', 'PREVEST', 'VESPERTINO', 29)
ON CONFLICT (codigo, nome, turno) DO UPDATE SET
  vagas_ocupadas = EXCLUDED.vagas_ocupadas,
  atualizado_em = TIMEZONE('utc', NOW());

-- RLS Policies
ALTER TABLE turmas_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE presencas ENABLE ROW LEVEL SECURITY;

-- Políticas de admin (temporárias, ajustar conforme necessário)
DROP POLICY IF EXISTS "Admins podem fazer tudo com turmas" ON turmas_config;
CREATE POLICY "Admins podem fazer tudo com turmas" ON turmas_config
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Admins podem fazer tudo com alunos" ON alunos;
CREATE POLICY "Admins podem fazer tudo com alunos" ON alunos
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Admins podem fazer tudo com matriculas" ON matriculas;
CREATE POLICY "Admins podem fazer tudo com matriculas" ON matriculas
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Admins podem fazer tudo com presencas" ON presencas;
CREATE POLICY "Admins podem fazer tudo com presencas" ON presencas
  FOR ALL USING (true);