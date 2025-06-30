-- ====================================================================
-- VERIFICAÇÃO E CORREÇÃO DO RELACIONAMENTO DESCRITORES ⇄ TOPICOS
-- Execute este script no Supabase SQL Editor
-- ====================================================================

-- 1. Verificar se a coluna topico_id existe na tabela descritores
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'descritores' 
AND column_name = 'topico_id';

-- 2. Verificar se existe a FK constraint
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'descritores'
    AND kcu.column_name = 'topico_id';

-- 3. Se a coluna topico_id não existir, criar ela
-- (Descomente as linhas abaixo se necessário)
/*
ALTER TABLE descritores 
ADD COLUMN IF NOT EXISTS topico_id UUID;
*/

-- 4. Se a FK não existir, criar ela
-- (Descomente as linhas abaixo se necessário)
/*
ALTER TABLE descritores
ADD CONSTRAINT IF NOT EXISTS descritores_topico_id_fkey
FOREIGN KEY (topico_id)
REFERENCES topicos(id)
ON DELETE SET NULL;
*/

-- 5. Verificar quantos descritores têm tópicos associados
SELECT 
    COUNT(*) as total_descritores,
    COUNT(topico_id) as com_topico,
    COUNT(*) - COUNT(topico_id) as sem_topico
FROM descritores;

-- 6. Verificar se existem tópicos disponíveis
SELECT 
    COUNT(*) as total_topicos,
    COUNT(CASE WHEN ativo = true THEN 1 END) as topicos_ativos
FROM topicos;

-- 7. Testar a query que será usada na API
SELECT 
    d.id,
    d.data,
    d.descricao_livre,
    d.topico_id,
    t.nome as topico_nome
FROM descritores d
LEFT JOIN topicos t ON d.topico_id = t.id
WHERE d.created_at >= NOW() - INTERVAL '7 days'
ORDER BY d.created_at DESC
LIMIT 5;

-- ====================================================================
-- RESULTADO ESPERADO:
-- - Coluna topico_id deve existir (UUID, nullable)
-- - FK constraint deve existir apontando para topicos(id)
-- - Query de teste deve retornar dados sem erro
-- ====================================================================