-- Adicionar coluna area na tabela provas
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar a coluna area se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'provas' AND column_name = 'area'
  ) THEN
    ALTER TABLE provas ADD COLUMN area TEXT;
  END IF;
END $$;

-- 1.1 Adicionar a coluna subcategoria se não existir (para compatibilidade)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'provas' AND column_name = 'subcategoria'
  ) THEN
    ALTER TABLE provas ADD COLUMN subcategoria TEXT;
  END IF;
END $$;

-- 2. Migrar dados existentes baseado no titulo ou subcategoria
UPDATE provas 
SET area = CASE
  WHEN titulo ILIKE '%biolog%' OR titulo ILIKE '%bio%' THEN 'BIOLÓGICAS'
  WHEN titulo ILIKE '%humana%' OR titulo ILIKE '%hum%' THEN 'HUMANAS'  
  WHEN titulo ILIKE '%exata%' THEN 'EXATAS'
  WHEN subcategoria ILIKE '%biolog%' THEN 'BIOLÓGICAS'
  WHEN subcategoria ILIKE '%humana%' THEN 'HUMANAS'
  WHEN subcategoria ILIKE '%exata%' THEN 'EXATAS'
  ELSE NULL
END
WHERE tipo_prova = 'MACRO' AND area IS NULL;

-- 3. Corrigir subcategorias CG para consistência
UPDATE provas 
SET subcategoria = 'CG'
WHERE tipo_prova = 'MACRO' 
  AND (subcategoria = 'CONHECIMENTOS GERAIS' OR subcategoria ILIKE '%geral%')
  AND area IS NULL;

-- 4. Verificar resultados
SELECT 
  tipo_prova,
  subcategoria,
  area,
  titulo,
  COUNT(*) as total
FROM provas 
WHERE tipo_prova = 'MACRO'
GROUP BY tipo_prova, subcategoria, area, titulo
ORDER BY subcategoria, area;