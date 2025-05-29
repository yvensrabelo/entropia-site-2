-- Migração para remover tipo VESTIBULAR e estabelecer estrutura definitiva
-- ATENÇÃO: Execute este script com cuidado no Supabase SQL Editor

-- 1. Primeiro, atualizar registros existentes com tipo VESTIBULAR
UPDATE provas 
SET tipo_prova = CASE 
    WHEN instituicao = 'UERR' THEN 'UERR'
    WHEN instituicao IN ('OUTRAS', 'OUTROS') THEN 'OUTROS'
    ELSE 'OUTROS'
END
WHERE tipo_prova = 'VESTIBULAR';

-- 2. Se estiver usando CHECK constraint, remover e recriar
ALTER TABLE provas DROP CONSTRAINT IF EXISTS provas_tipo_prova_check;

-- 3. Adicionar nova constraint com tipos válidos definitivos
ALTER TABLE provas ADD CONSTRAINT provas_tipo_prova_check 
CHECK (tipo_prova IN ('PSC', 'PSI', 'SIS', 'MACRO', 'PSS', 'UERR', 'ENEM', 'OUTROS'));

-- 4. Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_provas_tipo_instituicao ON provas(tipo_prova, instituicao);

-- 5. Atualizar subcategorias para UERR
UPDATE provas 
SET subcategoria = 'FASE ÚNICA'
WHERE tipo_prova = 'UERR' AND (subcategoria IS NULL OR subcategoria = '');

-- 6. Garantir que provas com tipo OUTROS tenham subcategoria GERAL
UPDATE provas 
SET subcategoria = 'GERAL'
WHERE tipo_prova = 'OUTROS' AND (subcategoria IS NULL OR subcategoria = '');

-- 7. Limpar subcategorias inválidas para MACRO
UPDATE provas 
SET subcategoria = 'CONHECIMENTOS GERAIS'
WHERE tipo_prova = 'MACRO' 
AND subcategoria IN ('GERAL', 'CG', 'Conhecimentos Gerais')
AND area IS NULL;

-- Verificar resultados
SELECT tipo_prova, instituicao, COUNT(*) as total
FROM provas
GROUP BY tipo_prova, instituicao
ORDER BY tipo_prova, instituicao;