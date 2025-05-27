-- Adicionar campo destaque na tabela turmas
ALTER TABLE turmas 
ADD COLUMN IF NOT EXISTS destaque VARCHAR(100);

-- Comentário explicativo
COMMENT ON COLUMN turmas.destaque IS 'Texto de destaque opcional para o card da turma (ex: Mais procurado, Vagas limitadas)';