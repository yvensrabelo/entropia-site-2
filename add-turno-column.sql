-- Adicionar coluna turno à tabela turmas
ALTER TABLE turmas
ADD COLUMN IF NOT EXISTS turno VARCHAR(20) DEFAULT 'matutino' 
CHECK (turno IN ('matutino', 'vespertino', 'noturno'));

-- Atualizar registros existentes que não têm turno definido
UPDATE turmas 
SET turno = 'matutino' 
WHERE turno IS NULL;

-- Verificar se a coluna foi adicionada corretamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'turmas' AND column_name = 'turno';