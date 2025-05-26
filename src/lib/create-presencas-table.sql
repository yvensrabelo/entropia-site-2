-- Criar tabela de presenças se não existir
CREATE TABLE IF NOT EXISTS presencas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  hora_entrada TIME,
  hora_saida TIME,
  tipo VARCHAR(50) DEFAULT 'catraca',
  enrollid_catraca INTEGER,
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices para performance
  CONSTRAINT unique_presenca_dia UNIQUE (aluno_id, data)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_presencas_aluno_id ON presencas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_presencas_data ON presencas(data);
CREATE INDEX IF NOT EXISTS idx_presencas_aluno_data ON presencas(aluno_id, data);

-- Comentários
COMMENT ON TABLE presencas IS 'Registro de presenças dos alunos';
COMMENT ON COLUMN presencas.tipo IS 'Tipo de registro: catraca, manual, app';
COMMENT ON COLUMN presencas.enrollid_catraca IS 'ID do enrollment na catraca';
COMMENT ON COLUMN presencas.observacoes IS 'Mensagem da catraca ou observações manuais';