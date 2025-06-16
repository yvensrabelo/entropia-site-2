-- Migration: Add robust description system fields to turmas table
-- This migration adds JSONB fields to support the new flexible turma description system

-- Add new JSONB fields for robust description system
ALTER TABLE turmas 
ADD COLUMN IF NOT EXISTS descricoes JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS beneficios JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS detalhes JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS informacoes JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS visibilidade JSONB DEFAULT '{}'::jsonb;

-- Add indexes for better performance on JSONB fields
CREATE INDEX IF NOT EXISTS idx_turmas_descricoes_gin ON turmas USING GIN (descricoes);
CREATE INDEX IF NOT EXISTS idx_turmas_beneficios_gin ON turmas USING GIN (beneficios);
CREATE INDEX IF NOT EXISTS idx_turmas_detalhes_gin ON turmas USING GIN (detalhes);
CREATE INDEX IF NOT EXISTS idx_turmas_visibilidade_gin ON turmas USING GIN (visibilidade);

-- Add specific indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_turmas_visibilidade_home 
ON turmas ((visibilidade->>'exibir_home')) 
WHERE visibilidade->>'exibir_home' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_turmas_visibilidade_destacar 
ON turmas ((visibilidade->>'destacar')) 
WHERE visibilidade->>'destacar' = 'true';

CREATE INDEX IF NOT EXISTS idx_turmas_detalhes_modalidade 
ON turmas ((detalhes->>'modalidade')) 
WHERE detalhes->>'modalidade' IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN turmas.descricoes IS 'JSONB field containing different description variants: card, resumo, completa, slogan';
COMMENT ON COLUMN turmas.beneficios IS 'JSONB field containing principais, secundarios, and icones arrays';
COMMENT ON COLUMN turmas.detalhes IS 'JSONB field containing educational metadata like carga_horaria, modalidade, nivel, etc.';
COMMENT ON COLUMN turmas.informacoes IS 'JSONB field containing dynamic information like proxima_turma, desconto_ativo, etc.';
COMMENT ON COLUMN turmas.seo IS 'JSONB field containing SEO metadata like meta_description, keywords, og_image, etc.';
COMMENT ON COLUMN turmas.visibilidade IS 'JSONB field containing visibility controls like exibir_home, destacar, date ranges, etc.';

-- Example of populating data for existing turmas (optional)
-- This migrates existing data to the new structure
UPDATE turmas 
SET 
  descricoes = jsonb_build_object(
    'card', CASE 
      WHEN LENGTH(descricao) <= 160 THEN descricao 
      ELSE LEFT(descricao, 157) || '...' 
    END,
    'resumo', CASE 
      WHEN LENGTH(descricao) <= 300 THEN descricao 
      ELSE LEFT(descricao, 297) || '...' 
    END,
    'completa', descricao
  ),
  beneficios = jsonb_build_object(
    'principais', diferenciais
  ),
  detalhes = jsonb_build_object(
    'carga_horaria', duracao,
    'modalidade', 'presencial'
  ),
  visibilidade = jsonb_build_object(
    'exibir_home', true,
    'exibir_catalogo', true,
    'destacar', CASE WHEN destaque IS NOT NULL THEN true ELSE false END
  ),
  seo = jsonb_build_object(
    'meta_description', CASE 
      WHEN LENGTH(descricao) <= 160 THEN descricao 
      ELSE LEFT(descricao, 157) || '...' 
    END,
    'schema_type', 'Course'
  )
WHERE 
  descricoes = '{}'::jsonb OR descricoes IS NULL;

-- Verify the migration by checking a sample record
-- SELECT id, nome, descricoes, beneficios, detalhes, informacoes, seo, visibilidade 
-- FROM turmas 
-- LIMIT 1;