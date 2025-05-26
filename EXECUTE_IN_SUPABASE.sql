-- =====================================================
-- SCRIPT COMPLETO PARA CORRIGIR ESTRUTURA HIERÁRQUICA
-- Execute este script inteiro no Supabase SQL Editor
-- =====================================================

-- 1. Adicionar colunas se não existirem
ALTER TABLE provas 
ADD COLUMN IF NOT EXISTS subcategoria TEXT,
ADD COLUMN IF NOT EXISTS area TEXT;

-- 2. Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_provas_subcategoria ON provas(subcategoria);
CREATE INDEX IF NOT EXISTS idx_provas_area ON provas(area);
CREATE INDEX IF NOT EXISTS idx_provas_tipo_subcategoria ON provas(tipo_prova, subcategoria);
CREATE INDEX IF NOT EXISTS idx_provas_tipo_subcategoria_area ON provas(tipo_prova, subcategoria, area);

-- 3. Remover constraints antigas se existirem
ALTER TABLE provas 
DROP CONSTRAINT IF EXISTS check_subcategoria_psc,
DROP CONSTRAINT IF EXISTS check_subcategoria_sis,
DROP CONSTRAINT IF EXISTS check_subcategoria_macro,
DROP CONSTRAINT IF EXISTS check_area_macro;

-- 4. Adicionar constraints de validação para garantir integridade dos dados

-- Constraint para PSC (apenas PSC 1, PSC 2, PSC 3 ou NULL)
ALTER TABLE provas 
ADD CONSTRAINT check_subcategoria_psc 
CHECK (
  tipo_prova != 'PSC' OR 
  subcategoria IS NULL OR 
  subcategoria IN ('PSC 1', 'PSC 2', 'PSC 3')
);

-- Constraint para SIS (apenas SIS 1, SIS 2, SIS 3 ou NULL)
ALTER TABLE provas 
ADD CONSTRAINT check_subcategoria_sis 
CHECK (
  tipo_prova != 'SIS' OR 
  subcategoria IS NULL OR 
  subcategoria IN ('SIS 1', 'SIS 2', 'SIS 3')
);

-- Constraint para MACRO (apenas DIA 1, DIA 2 ou NULL)
ALTER TABLE provas 
ADD CONSTRAINT check_subcategoria_macro 
CHECK (
  tipo_prova != 'MACRO' OR 
  subcategoria IS NULL OR 
  subcategoria IN ('DIA 1', 'DIA 2')
);

-- Constraint para área (apenas para MACRO DIA 2)
ALTER TABLE provas 
ADD CONSTRAINT check_area_macro 
CHECK (
  (tipo_prova != 'MACRO' OR subcategoria != 'DIA 2') OR 
  area IS NULL OR 
  area IN ('BIOLÓGICAS', 'HUMANAS', 'EXATAS')
);

-- 5. Adicionar comentários para documentação
COMMENT ON COLUMN provas.subcategoria IS 'Subcategoria da prova: PSC 1/2/3, SIS 1/2/3, DIA 1/2 para MACRO';
COMMENT ON COLUMN provas.area IS 'Área de conhecimento para MACRO DIA 2: BIOLÓGICAS, HUMANAS, EXATAS';

-- 6. Verificar se o bucket 'provas' existe no Storage
-- (Isso não pode ser feito via SQL, mas verifique no Supabase Dashboard)

-- 7. Inserir dados de exemplo para teste (OPCIONAL - remover se não quiser dados de teste)
INSERT INTO provas (
  instituicao, tipo_prova, subcategoria, area, ano, titulo, url_pdf, visualizacoes
) VALUES 
  ('UFAM', 'PSC', 'PSC 1', NULL, 2024, 'PSC 1 2024 - Exemplo', 'https://example.com/psc1.pdf', 0),
  ('UEA', 'SIS', 'SIS 2', NULL, 2024, 'SIS 2 2024 - Exemplo', 'https://example.com/sis2.pdf', 0),
  ('UEA', 'MACRO', 'DIA 2', 'HUMANAS', 2024, 'MACRO DIA 2 HUMANAS 2024 - Exemplo', 'https://example.com/macro.pdf', 0)
ON CONFLICT DO NOTHING;

-- 8. Verificar estrutura final da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'provas' 
  AND column_name IN ('subcategoria', 'area')
ORDER BY ordinal_position;

-- 9. Verificar constraints
SELECT 
  constraint_name, 
  constraint_type,
  check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'provas' 
  AND tc.constraint_type = 'CHECK'
  AND cc.constraint_name LIKE '%subcategoria%' OR cc.constraint_name LIKE '%area%';

-- 10. Contar registros por tipo e subcategoria (verificação)
SELECT 
  tipo_prova,
  subcategoria,
  area,
  COUNT(*) as total
FROM provas 
GROUP BY tipo_prova, subcategoria, area
ORDER BY tipo_prova, subcategoria, area;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Se tudo executou sem erros, a estrutura hierárquica está pronta!
-- Próximos passos:
-- 1. Verificar se o bucket 'provas' existe no Supabase Storage
-- 2. Testar upload de PDF na interface admin
-- 3. Testar filtros hierárquicos na página pública