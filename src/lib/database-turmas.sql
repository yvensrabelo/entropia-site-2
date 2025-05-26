-- Criar enum para tipos de turma
CREATE TYPE tipo_turma AS ENUM ('intensivo_psc', 'enem_total', 'sis_macro');

-- Criar tabela de turmas
CREATE TABLE IF NOT EXISTS turmas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  periodo VARCHAR(255),
  duracao VARCHAR(255),
  vagas_disponiveis INTEGER DEFAULT 0,
  tipo tipo_turma NOT NULL,
  diferenciais JSONB DEFAULT '[]'::jsonb,
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_turmas_ativo ON turmas(ativo);
CREATE INDEX idx_turmas_ordem ON turmas(ordem);
CREATE INDEX idx_turmas_tipo ON turmas(tipo);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_turmas_updated_at BEFORE UPDATE
    ON turmas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de exemplo (baseado nas turmas atuais)
INSERT INTO turmas (nome, descricao, periodo, duracao, vagas_disponiveis, tipo, diferenciais, ativo, ordem) VALUES
(
  'PSC Intensivo 2025',
  'Preparação completa para o PSC UFAM com foco em aprovação',
  'Janeiro a Novembro',
  '11 meses',
  30,
  'intensivo_psc',
  '["Material completo PSC", "Simulados semanais", "Monitoria diária", "Aulas de redação"]'::jsonb,
  true,
  1
),
(
  'ENEM Total',
  'Preparação completa para o ENEM com metodologia exclusiva',
  'Fevereiro a Novembro',
  '10 meses',
  40,
  'enem_total',
  '["Correção de redações", "Plataforma online", "Aulões especiais", "Material atualizado BNCC"]'::jsonb,
  true,
  2
),
(
  'SIS/MACRO Focado',
  'Curso direcionado para medicina UEA',
  'Março a Dezembro',
  '10 meses',
  25,
  'sis_macro',
  '["Professores especialistas", "Material específico UEA", "Simulados modelo SIS", "Acompanhamento individual"]'::jsonb,
  true,
  3
);

-- Políticas de segurança (RLS)
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (turmas ativas)
CREATE POLICY "Turmas ativas são visíveis publicamente" ON turmas
  FOR SELECT
  USING (ativo = true);

-- Política para admin (todas as operações)
CREATE POLICY "Admins podem fazer tudo com turmas" ON turmas
  FOR ALL
  USING (true)
  WITH CHECK (true);