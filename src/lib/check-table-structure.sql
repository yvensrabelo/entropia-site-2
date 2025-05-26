-- ===================================================
-- VERIFICAR ESTRUTURA COMPLETA DA TABELA ALUNOS
-- ===================================================

-- Ver todas as colunas da tabela alunos
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'alunos'
ORDER BY ordinal_position;

-- Ver constraints da tabela
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'alunos';

-- Ver indexes da tabela
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'alunos';

-- Exemplo de inserção para testar estrutura
/*
INSERT INTO alunos (
    nome, cpf, data_nascimento, telefone, email,
    endereco, bairro, cidade, estado, cep,
    nome_responsavel, telefone_responsavel, observacoes
) VALUES (
    'Teste Estrutura', '00000000000', '2000-01-01', '(00) 00000-0000', 'teste@estrutura.com',
    'Rua Teste', 'Bairro Teste', 'Manaus', 'AM', '00000000',
    'Responsavel Teste', '(00) 11111-1111', 'Teste de estrutura'
);
*/