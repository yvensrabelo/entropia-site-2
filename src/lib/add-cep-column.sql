-- ===================================================
-- ADICIONAR COLUNA CEP FALTANTE
-- ===================================================

-- Adicionar coluna CEP que está faltando
ALTER TABLE alunos
ADD COLUMN IF NOT EXISTS cep VARCHAR(10);

-- Verificar todas as colunas da tabela
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'alunos'
ORDER BY ordinal_position;

-- Verificar se existe algum aluno para testar
SELECT COUNT(*) as total_alunos FROM alunos;

-- Exemplo de inserção para testar (não execute se não quiser dados de teste)
/*
INSERT INTO alunos (
    nome, cpf, data_nascimento, telefone, email, 
    endereco, bairro, cidade, estado, cep, 
    nome_responsavel, telefone_responsavel, observacoes, status
) VALUES (
    'Teste Silva', '12345678901', '2005-01-01', '(92) 99999-9999', 'teste@email.com',
    'Rua Teste 123', 'Centro', 'Manaus', 'AM', '69000000',
    'Responsavel Teste', '(92) 88888-8888', 'Teste de importação', 'ATIVO'
);
*/