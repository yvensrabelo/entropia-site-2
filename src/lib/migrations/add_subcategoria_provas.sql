-- Migration: Adicionar subcategoria e área às provas
-- Data: 2025-01-25

-- Adicionar coluna subcategoria
ALTER TABLE provas 
ADD COLUMN IF NOT EXISTS subcategoria VARCHAR(50);

-- Adicionar coluna area (apenas para MACRO DIA 2)
ALTER TABLE provas 
ADD COLUMN IF NOT EXISTS area VARCHAR(50);

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_provas_subcategoria ON provas(subcategoria);
CREATE INDEX IF NOT EXISTS idx_provas_area ON provas(area);
CREATE INDEX IF NOT EXISTS idx_provas_tipo_subcategoria ON provas(tipo_prova, subcategoria);

-- Adicionar constraints de validação
ALTER TABLE provas 
ADD CONSTRAINT check_subcategoria_psc 
CHECK (
  (tipo_prova != 'PSC' OR subcategoria IN ('PSC 1', 'PSC 2', 'PSC 3', NULL))
);

ALTER TABLE provas 
ADD CONSTRAINT check_subcategoria_sis 
CHECK (
  (tipo_prova != 'SIS' OR subcategoria IN ('SIS 1', 'SIS 2', 'SIS 3', NULL))
);

ALTER TABLE provas 
ADD CONSTRAINT check_subcategoria_macro 
CHECK (
  (tipo_prova != 'MACRO' OR subcategoria IN ('DIA 1', 'DIA 2', NULL))
);

ALTER TABLE provas 
ADD CONSTRAINT check_area_macro 
CHECK (
  (tipo_prova != 'MACRO' OR subcategoria != 'DIA 2' OR area IN ('BIOLÓGICAS', 'HUMANAS', 'EXATAS', NULL))
);

-- Comentário para documentação
COMMENT ON COLUMN provas.subcategoria IS 'Subcategoria da prova: PSC 1/2/3, SIS 1/2/3, DIA 1/2';
COMMENT ON COLUMN provas.area IS 'Área de conhecimento para MACRO DIA 2: BIOLÓGICAS, HUMANAS, EXATAS';

-- Dados de exemplo para migração (OPCIONAL - ajustar conforme dados existentes)
-- UPDATE provas SET subcategoria = 'PSC 1' WHERE tipo_prova = 'PSC' AND ano = 2023;
-- UPDATE provas SET subcategoria = 'PSC 2' WHERE tipo_prova = 'PSC' AND ano = 2024;