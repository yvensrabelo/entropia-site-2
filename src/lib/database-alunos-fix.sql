-- ===================================================
-- CORREÇÃO DA TABELA ALUNOS - ADICIONAR COLUNAS FALTANTES
-- ===================================================

-- Verificar estrutura atual da tabela
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'alunos';

-- Adicionar colunas faltantes na tabela alunos
ALTER TABLE alunos 
ADD COLUMN IF NOT EXISTS bairro VARCHAR(100),
ADD COLUMN IF NOT EXISTS cidade VARCHAR(100) DEFAULT 'Manaus',
ADD COLUMN IF NOT EXISTS estado VARCHAR(2) DEFAULT 'AM',
ADD COLUMN IF NOT EXISTS numero VARCHAR(20),
ADD COLUMN IF NOT EXISTS complemento VARCHAR(100);

-- Verificar se as colunas já existem e adicionar apenas as que faltam
DO $$ 
BEGIN 
    -- Verificar e adicionar coluna bairro
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'bairro') THEN
        ALTER TABLE alunos ADD COLUMN bairro VARCHAR(100);
        RAISE NOTICE 'Coluna bairro adicionada';
    ELSE
        RAISE NOTICE 'Coluna bairro já existe';
    END IF;
    
    -- Verificar e adicionar coluna cidade
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'cidade') THEN
        ALTER TABLE alunos ADD COLUMN cidade VARCHAR(100) DEFAULT 'Manaus';
        RAISE NOTICE 'Coluna cidade adicionada';
    ELSE
        RAISE NOTICE 'Coluna cidade já existe';
    END IF;
    
    -- Verificar e adicionar coluna estado
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'estado') THEN
        ALTER TABLE alunos ADD COLUMN estado VARCHAR(2) DEFAULT 'AM';
        RAISE NOTICE 'Coluna estado adicionada';
    ELSE
        RAISE NOTICE 'Coluna estado já existe';
    END IF;
    
    -- Verificar e adicionar coluna numero
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'numero') THEN
        ALTER TABLE alunos ADD COLUMN numero VARCHAR(20);
        RAISE NOTICE 'Coluna numero adicionada';
    ELSE
        RAISE NOTICE 'Coluna numero já existe';
    END IF;
    
    -- Verificar e adicionar coluna complemento
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'complemento') THEN
        ALTER TABLE alunos ADD COLUMN complemento VARCHAR(100);
        RAISE NOTICE 'Coluna complemento adicionada';
    ELSE
        RAISE NOTICE 'Coluna complemento já existe';
    END IF;
END $$;

-- Atualizar registros existentes com valores padrão se necessário
UPDATE alunos 
SET cidade = 'Manaus' 
WHERE cidade IS NULL;

UPDATE alunos 
SET estado = 'AM' 
WHERE estado IS NULL;

-- Verificar estrutura final da tabela
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'alunos' 
ORDER BY ordinal_position;

-- Verificar dados existentes
SELECT 
    COUNT(*) as total_alunos,
    COUNT(bairro) as com_bairro,
    COUNT(cidade) as com_cidade,
    COUNT(estado) as com_estado
FROM alunos;