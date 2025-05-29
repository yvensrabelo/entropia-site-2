-- Verificar se há IDs duplicados na tabela provas
SELECT id, COUNT(*) as total
FROM provas
GROUP BY id
HAVING COUNT(*) > 1;

-- Se houver duplicatas, listar detalhes
WITH duplicates AS (
  SELECT id
  FROM provas
  GROUP BY id
  HAVING COUNT(*) > 1
)
SELECT p.*
FROM provas p
JOIN duplicates d ON p.id = d.id
ORDER BY p.id, p.created_at;

-- Verificar total de provas
SELECT COUNT(*) as total_provas FROM provas;

-- Verificar se a coluna ID tem constraint UNIQUE
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
WHERE 
    tc.table_name = 'provas'
    AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE');