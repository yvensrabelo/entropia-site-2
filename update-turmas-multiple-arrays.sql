-- Script para implementar múltiplos turnos e séries por turma
-- Execute no Supabase SQL Editor

-- 1. Remover coluna única de turno se existir
ALTER TABLE turmas DROP COLUMN IF EXISTS turno;

-- 2. Adicionar arrays para múltiplos turnos e séries
ALTER TABLE turmas
ADD COLUMN IF NOT EXISTS turnos TEXT[] DEFAULT ARRAY['matutino'],
ADD COLUMN IF NOT EXISTS series_atendidas TEXT[] DEFAULT ARRAY['1'];

-- 3. Atualizar registros existentes
-- Migrar dados da coluna ordem para series_atendidas
UPDATE turmas 
SET series_atendidas = ARRAY[ordem::text] 
WHERE series_atendidas IS NULL OR array_length(series_atendidas, 1) IS NULL;

-- Garantir que todos os registros tenham pelo menos um turno
UPDATE turmas 
SET turnos = ARRAY['matutino'] 
WHERE turnos IS NULL OR array_length(turnos, 1) IS NULL;

-- 4. Criar índices para performance com arrays
CREATE INDEX IF NOT EXISTS idx_turmas_turnos ON turmas USING GIN(turnos);
CREATE INDEX IF NOT EXISTS idx_turmas_series ON turmas USING GIN(series_atendidas);

-- 5. Adicionar constraints para validar valores válidos
ALTER TABLE turmas ADD CONSTRAINT check_turnos_valid 
CHECK (turnos <@ ARRAY['matutino', 'vespertino', 'noturno']);

ALTER TABLE turmas ADD CONSTRAINT check_series_valid 
CHECK (series_atendidas <@ ARRAY['1', '2', '3', 'formado']);

-- 6. Verificar resultados
SELECT 
  id, nome, turnos, series_atendidas, ordem, ativo 
FROM turmas 
ORDER BY ordem, nome
LIMIT 10;