-- ====================================================================
-- FUNÇÃO OTIMIZADA: minutos_do_mes
-- Calcula os minutos acumulados de um professor no mês atual
-- ====================================================================

-- Primeiro, vamos verificar se a função existe
SELECT 
    routine_name,
    routine_definition,
    data_type,
    external_language
FROM information_schema.routines
WHERE routine_name = 'minutos_do_mes'
AND routine_schema = 'public';

-- ====================================================================
-- VERSÃO OTIMIZADA DA FUNÇÃO minutos_do_mes
-- ====================================================================

CREATE OR REPLACE FUNCTION minutos_do_mes(cpf_input TEXT)
RETURNS INTEGER AS $$
BEGIN
    -- Validação de entrada
    IF cpf_input IS NULL OR LENGTH(TRIM(cpf_input)) = 0 THEN
        RETURN 0;
    END IF;

    -- Soma os minutos do mês atual usando a tabela descritores
    -- (que é onde os minutos são realmente registrados)
    RETURN COALESCE(
        (
            SELECT SUM(d.minutos_aula)
            FROM descritores d
            JOIN professores p ON d.professor_id = p.id
            WHERE p.cpf = TRIM(cpf_input)
            AND d.data >= DATE_TRUNC('month', CURRENT_DATE)::DATE
            AND d.data < (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month')::DATE
            AND d.minutos_aula IS NOT NULL
            AND d.minutos_aula > 0
        ), 
        0
    )::INTEGER;
END;
$$ LANGUAGE plpgsql STABLE;

-- ====================================================================
-- VERSÃO ALTERNATIVA (mais performática) - SQL puro
-- ====================================================================

CREATE OR REPLACE FUNCTION minutos_do_mes_v2(cpf_input TEXT)
RETURNS INTEGER AS $$
    SELECT COALESCE(SUM(d.minutos_aula), 0)::INTEGER
    FROM descritores d
    JOIN professores p ON d.professor_id = p.id
    WHERE p.cpf = TRIM($1)
    AND d.data >= DATE_TRUNC('month', CURRENT_DATE)::DATE
    AND d.data < (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month')::DATE
    AND d.minutos_aula IS NOT NULL
    AND d.minutos_aula > 0;
$$ LANGUAGE sql STABLE;

-- ====================================================================
-- ÍNDICES PARA OTIMIZAÇÃO
-- ====================================================================

-- Índice para busca rápida por CPF
CREATE INDEX IF NOT EXISTS idx_professores_cpf 
ON professores(cpf) WHERE cpf IS NOT NULL;

-- Índice composto para filtros na tabela descritores
CREATE INDEX IF NOT EXISTS idx_descritores_professor_data_minutos 
ON descritores(professor_id, data, minutos_aula) 
WHERE minutos_aula IS NOT NULL AND minutos_aula > 0;

-- Índice para filtro por data (mês/ano)
CREATE INDEX IF NOT EXISTS idx_descritores_data_mes 
ON descritores(DATE_TRUNC('month', data), data) 
WHERE minutos_aula IS NOT NULL;

-- ====================================================================
-- TESTES DE VALIDAÇÃO
-- ====================================================================

-- Teste 1: Verificar se a função está funcionando
SELECT minutos_do_mes('12345678901') as teste_cpf_fake;

-- Teste 2: Ver dados de exemplo da tabela descritores
SELECT 
    p.nome,
    p.cpf,
    d.data,
    d.minutos_aula,
    COUNT(*) as total_aulas,
    SUM(d.minutos_aula) as total_minutos
FROM descritores d
JOIN professores p ON d.professor_id = p.id
WHERE d.data >= DATE_TRUNC('month', CURRENT_DATE)::DATE
GROUP BY p.nome, p.cpf, d.data, d.minutos_aula
ORDER BY d.data DESC
LIMIT 10;

-- Teste 3: Verificar performance da função
EXPLAIN ANALYZE 
SELECT minutos_do_mes(p.cpf) as minutos_mes
FROM professores p
WHERE p.ativo = true
LIMIT 5;

-- ====================================================================
-- OBSERVAÇÕES:
-- 1. A função usa a tabela 'descritores' (não 'minutos_professores')
-- 2. Filtra por 'minutos_aula IS NOT NULL AND > 0'
-- 3. Usa 'cpf_input' para encontrar o professor
-- 4. Filtra registros do mês atual corretamente
-- 5. Retorna 0 para casos inválidos
-- ====================================================================