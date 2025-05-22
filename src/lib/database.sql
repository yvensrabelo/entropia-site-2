-- Configuração inicial do Supabase para Entropia Cursinho

-- Tabela de usuários (estudantes)
CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  turma VARCHAR(100) NOT NULL,
  situacao VARCHAR(20) DEFAULT 'ativo' CHECK (situacao IN ('ativo', 'inativo', 'trancado')),
  data_matricula DATE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de presenças
CREATE TABLE presencas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  data_aula DATE NOT NULL,
  disciplina VARCHAR(100) NOT NULL,
  professor VARCHAR(255),
  presente BOOLEAN DEFAULT false,
  justificativa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de notas
CREATE TABLE notas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  disciplina VARCHAR(100) NOT NULL,
  tipo_avaliacao VARCHAR(50) CHECK (tipo_avaliacao IN ('simulado', 'prova', 'trabalho', 'exercicio')),
  nota DECIMAL(5,2) NOT NULL,
  nota_maxima DECIMAL(5,2) NOT NULL,
  data_aplicacao DATE NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela financeira
CREATE TABLE financeiro (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(50) CHECK (tipo IN ('mensalidade', 'material', 'taxa')),
  valor DECIMAL(10,2) NOT NULL,
  vencimento DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido')),
  descricao TEXT NOT NULL,
  data_pagamento DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de materiais
CREATE TABLE materiais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  disciplina VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) CHECK (tipo IN ('apostila', 'exercicio', 'simulado', 'video')),
  arquivo_url TEXT,
  descricao TEXT,
  disponivel_para_turma TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela usuarios
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_usuarios_cpf ON usuarios(cpf);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_presencas_usuario_id ON presencas(usuario_id);
CREATE INDEX idx_presencas_data_aula ON presencas(data_aula);
CREATE INDEX idx_notas_usuario_id ON notas(usuario_id);
CREATE INDEX idx_notas_disciplina ON notas(disciplina);
CREATE INDEX idx_financeiro_usuario_id ON financeiro(usuario_id);
CREATE INDEX idx_financeiro_status ON financeiro(status);
CREATE INDEX idx_materiais_disciplina ON materiais(disciplina);

-- RLS (Row Level Security) Policies
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiais ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários (estudantes podem ver apenas seus próprios dados)
CREATE POLICY "Usuários podem ver apenas seus próprios dados" ON usuarios
    FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY "Presenças podem ser vistas pelo próprio usuário" ON presencas
    FOR SELECT USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "Notas podem ser vistas pelo próprio usuário" ON notas
    FOR SELECT USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "Financeiro pode ser visto pelo próprio usuário" ON financeiro
    FOR SELECT USING (auth.uid()::text = usuario_id::text);

-- Materiais disponíveis conforme a turma do usuário
CREATE POLICY "Materiais disponíveis conforme turma" ON materiais
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE usuarios.id::text = auth.uid()::text 
            AND usuarios.turma = ANY(materiais.disponivel_para_turma)
        )
    );

-- Dados de exemplo (remover em produção)
INSERT INTO usuarios (nome, cpf, email, turma, data_matricula, senha_hash) VALUES
('Yvens Silva', '98660608291', 'yvens@exemplo.com', 'Extensivo 2025', '2024-01-15', '$2b$10$exemplo_hash_aqui'),
('Ana Costa', '12345678901', 'ana@exemplo.com', 'Extensivo 2025', '2024-01-20', '$2b$10$exemplo_hash_aqui'),
('João Santos', '98765432100', 'joao@exemplo.com', 'Intensivo 2025', '2024-02-01', '$2b$10$exemplo_hash_aqui');

-- Inserir algumas presenças de exemplo
INSERT INTO presencas (usuario_id, data_aula, disciplina, professor, presente) 
SELECT 
    usuarios.id,
    CURRENT_DATE - INTERVAL '5 days',
    'Matemática',
    'Prof. Silva',
    true
FROM usuarios WHERE cpf = '98660608291';

-- Inserir algumas notas de exemplo
INSERT INTO notas (usuario_id, disciplina, tipo_avaliacao, nota, nota_maxima, data_aplicacao)
SELECT 
    usuarios.id,
    'Matemática',
    'simulado',
    85.5,
    100.0,
    CURRENT_DATE - INTERVAL '7 days'
FROM usuarios WHERE cpf = '98660608291';

-- Inserir dados financeiros de exemplo
INSERT INTO financeiro (usuario_id, tipo, valor, vencimento, status, descricao)
SELECT 
    usuarios.id,
    'mensalidade',
    350.00,
    CURRENT_DATE + INTERVAL '5 days',
    'pendente',
    'Mensalidade Janeiro 2025'
FROM usuarios WHERE cpf = '98660608291';

-- Inserir materiais de exemplo
INSERT INTO materiais (titulo, disciplina, tipo, descricao, disponivel_para_turma) VALUES
('Apostila de Matemática - Módulo 1', 'Matemática', 'apostila', 'Funções e Logaritmos', ARRAY['Extensivo 2025', 'Intensivo 2025']),
('Simulado ENEM 2024', 'Geral', 'simulado', 'Simulado completo estilo ENEM', ARRAY['Extensivo 2025']),
('Lista de Exercícios - Física', 'Física', 'exercicio', 'Mecânica e Cinemática', ARRAY['Extensivo 2025', 'Intensivo 2025']);