-- Migration: Corrigir estrutura hierárquica de provas
-- Data: 2025-01-25
-- Descrição: Adiciona campos subcategoria e area à tabela provas

-- 1. Adicionar colunas se não existirem
ALTER TABLE provas 
ADD COLUMN IF NOT EXISTS subcategoria TEXT,
ADD COLUMN IF NOT EXISTS area TEXT;

-- 2. Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_provas_subcategoria ON provas(subcategoria);
CREATE INDEX IF NOT EXISTS idx_provas_area ON provas(area);
CREATE INDEX IF NOT EXISTS idx_provas_tipo_subcategoria ON provas(tipo_prova, subcategoria);
CREATE INDEX IF NOT EXISTS idx_provas_tipo_subcategoria_area ON provas(tipo_prova, subcategoria, area);

-- 3. Adicionar constraints de validação para garantir integridade dos dados
ALTER TABLE provas 
DROP CONSTRAINT IF EXISTS check_subcategoria_psc,
DROP CONSTRAINT IF EXISTS check_subcategoria_sis,
DROP CONSTRAINT IF EXISTS check_subcategoria_macro,
DROP CONSTRAINT IF EXISTS check_area_macro;

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

-- 4. Adicionar comentários para documentação
COMMENT ON COLUMN provas.subcategoria IS 'Subcategoria da prova: PSC 1/2/3, SIS 1/2/3, DIA 1/2 para MACRO';
COMMENT ON COLUMN provas.area IS 'Área de conhecimento para MACRO DIA 2: BIOLÓGICAS, HUMANAS, EXATAS';

-- 5. Verificar estrutura final da tabela
-- Descomente para ver a estrutura:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'provas' 
-- ORDER BY ordinal_position;