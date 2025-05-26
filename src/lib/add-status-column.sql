-- ===================================================
-- ADICIONAR COLUNA STATUS NA TABELA ALUNOS
-- ===================================================

-- Opção 1: Adicionar coluna status com constraint
ALTER TABLE alunos
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ativo' 
CHECK (status IN ('ativo', 'inativo', 'suspenso'));

-- Verificar estrutura completa da tabela
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'alunos'
ORDER BY ordinal_position;

-- Atualizar registros existentes se necessário
UPDATE alunos 
SET status = 'ativo' 
WHERE status IS NULL;

-- Verificar dados após alteração
SELECT 
    COUNT(*) as total_alunos,
    COUNT(CASE WHEN status = 'ativo' THEN 1 END) as ativos,
    COUNT(CASE WHEN status = 'inativo' THEN 1 END) as inativos,
    COUNT(CASE WHEN status IS NULL THEN 1 END) as sem_status
FROM alunos;