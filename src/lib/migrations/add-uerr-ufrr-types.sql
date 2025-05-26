-- Script para adicionar UERR e UFRR como tipos de prova válidos
-- Este script assume que você está usando um enum ou constraint check

-- Se estiver usando enum (PostgreSQL):
-- Primeiro, verifique se os valores já existem
DO $$
BEGIN
    -- Adiciona UERR se não existir
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'UERR' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_prova_enum')
    ) THEN
        ALTER TYPE tipo_prova_enum ADD VALUE IF NOT EXISTS 'UERR';
    END IF;
    
    -- Adiciona UFRR se não existir
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'UFRR' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_prova_enum')
    ) THEN
        ALTER TYPE tipo_prova_enum ADD VALUE IF NOT EXISTS 'UFRR';
    END IF;
END $$;

-- Alternativa: Se estiver usando CHECK constraint ao invés de enum
-- Você precisará:
-- 1. Remover a constraint existente
-- 2. Adicionar uma nova constraint com os novos valores

-- Exemplo (ajuste conforme sua estrutura):
-- ALTER TABLE provas DROP CONSTRAINT IF EXISTS provas_tipo_prova_check;
-- ALTER TABLE provas ADD CONSTRAINT provas_tipo_prova_check 
-- CHECK (tipo_prova IN ('PSC', 'PSI', 'PSMV', 'VESTIBULAR', 'MACRO', 'SIS', 'ENEM', 'UERR', 'UFRR'));

-- Para Supabase, você também pode fazer isso via interface:
-- 1. Vá para o SQL Editor no dashboard do Supabase
-- 2. Execute este script
-- 3. Ou vá em Database > Tables > provas e edite as constraints