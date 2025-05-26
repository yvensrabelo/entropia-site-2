-- ===================================================
-- ADICIONAR CAMPO CONTRATO_ENTREGUE NA TABELA ALUNOS
-- ===================================================

-- Adicionar campo contrato_entregue
ALTER TABLE alunos
ADD COLUMN IF NOT EXISTS contrato_entregue BOOLEAN DEFAULT FALSE;

-- Verificar estrutura atualizada
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'alunos'
ORDER BY ordinal_position;

-- Atualizar registros existentes se necessário
UPDATE alunos 
SET contrato_entregue = FALSE 
WHERE contrato_entregue IS NULL;

-- Verificar dados após alteração
SELECT 
    COUNT(*) as total_alunos,
    COUNT(CASE WHEN contrato_entregue = true THEN 1 END) as contratos_entregues,
    COUNT(CASE WHEN contrato_entregue = false THEN 1 END) as contratos_pendentes
FROM alunos;