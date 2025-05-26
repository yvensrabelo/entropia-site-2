-- ====================================================
-- Script para corrigir constraint de url_pdf e adicionar campo is_gabarito
-- ====================================================

-- 1. Remove a constraint NOT NULL de url_pdf para permitir valores nulos
ALTER TABLE provas 
ALTER COLUMN url_pdf DROP NOT NULL;

-- 2. Adiciona coluna is_gabarito para identificar tipo de arquivo
ALTER TABLE provas 
ADD COLUMN IF NOT EXISTS is_gabarito BOOLEAN DEFAULT FALSE;

-- 3. Cria índice para melhorar performance de queries por tipo
CREATE INDEX IF NOT EXISTS idx_provas_is_gabarito ON provas(is_gabarito);

-- 4. Atualiza registros existentes baseado na presença de dados
-- Marca como gabarito se tem url_gabarito mas não tem url_pdf
UPDATE provas 
SET is_gabarito = TRUE 
WHERE url_gabarito IS NOT NULL 
  AND url_pdf IS NULL;

-- 5. Para registros que têm ambas as URLs, mantém como prova (is_gabarito = FALSE)
UPDATE provas 
SET is_gabarito = FALSE 
WHERE url_pdf IS NOT NULL;

-- 6. Adiciona comentários às colunas para documentação
COMMENT ON COLUMN provas.url_pdf IS 'URL do arquivo PDF da prova (NULL quando é apenas gabarito)';
COMMENT ON COLUMN provas.url_gabarito IS 'URL do arquivo PDF do gabarito';
COMMENT ON COLUMN provas.is_gabarito IS 'Indica se o registro é apenas um gabarito (TRUE) ou uma prova (FALSE)';

-- 7. Verifica os dados após a migração
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN is_gabarito = TRUE THEN 1 END) as total_gabaritos,
  COUNT(CASE WHEN is_gabarito = FALSE THEN 1 END) as total_provas,
  COUNT(CASE WHEN url_pdf IS NULL AND url_gabarito IS NOT NULL THEN 1 END) as gabaritos_sem_prova,
  COUNT(CASE WHEN url_pdf IS NOT NULL AND url_gabarito IS NOT NULL THEN 1 END) as provas_com_gabarito,
  COUNT(CASE WHEN url_pdf IS NOT NULL AND url_gabarito IS NULL THEN 1 END) as provas_sem_gabarito
FROM provas;