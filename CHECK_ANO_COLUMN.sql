-- Verificar o tipo da coluna ano na tabela provas
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'provas' 
AND column_name = 'ano';

-- Verificar alguns registros para ver o formato dos dados
SELECT id, titulo, ano, tipo_prova, instituicao
FROM provas
LIMIT 10;

-- Se precisar converter de TEXT para INTEGER (execute apenas se necessário)
-- ALTER TABLE provas 
-- ALTER COLUMN ano TYPE INTEGER USING ano::INTEGER;

-- Verificar se há valores não numéricos no campo ano
SELECT DISTINCT ano 
FROM provas 
WHERE ano IS NOT NULL
ORDER BY ano DESC
LIMIT 20;