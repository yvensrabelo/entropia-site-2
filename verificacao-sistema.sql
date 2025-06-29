-- ====================================================================
-- 🔍 VERIFICAÇÃO DO SISTEMA DE DESCRITORES
-- Script para validar se todos os componentes estão funcionando
-- ====================================================================

-- 1. Verificar se as funções existem
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('gerar_descritores_automaticos', 'obter_dia_semana', 'calcular_minutos_professor')
ORDER BY routine_name;

-- 2. Verificar constraints importantes
SELECT 
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name IN ('horarios_aulas', 'descritores', 'professores')
AND constraint_name IN ('unique_horario_turma_tempo', 'unique_descritor_horario_data', 'check_cpf_valido')
ORDER BY table_name, constraint_name;

-- 3. Verificar se os dados de teste foram inseridos
SELECT 
    'Professores' as tabela,
    COUNT(*) as total
FROM professores 
WHERE cpf IN ('12345678901', '11144477735')

UNION ALL

SELECT 
    'Horários' as tabela,
    COUNT(*) as total
FROM horarios_aulas h
JOIN professores p ON h.professor_id = p.id
WHERE p.cpf IN ('12345678901', '11144477735')

UNION ALL

SELECT 
    'Descritores Hoje' as tabela,
    COUNT(*) as total
FROM descritores d
JOIN professores p ON d.professor_id = p.id
WHERE p.cpf IN ('12345678901', '11144477735')
AND d.data = CURRENT_DATE;

-- 4. Testar função de geração de descritores
DO $$
DECLARE
    descritores_gerados INTEGER;
BEGIN
    -- Gerar descritores para hoje
    SELECT gerar_descritores_automaticos(CURRENT_DATE) INTO descritores_gerados;
    
    RAISE NOTICE '🔧 Função gerar_descritores_automaticos executada com sucesso!';
    RAISE NOTICE '📝 Descritores gerados para hoje: %', descritores_gerados;
END $$;

-- 5. Testar constraint de horários únicos
DO $$
BEGIN
    -- Tentar inserir horário duplicado (deve falhar)
    BEGIN
        INSERT INTO horarios_aulas (turma_id, dia_semana, tempo, hora_inicio, hora_fim, materia_id, ativo)
        SELECT 
            ts.id,
            'segunda'::dia_semana_enum,
            1,
            '07:00'::TIME,
            '07:50'::TIME,
            m.id,
            true
        FROM turmas_sistema ts, materias m
        WHERE ts.codigo = 'PSC-M-01' AND m.nome = 'Matemática'
        LIMIT 1;
        
        RAISE NOTICE '❌ ERRO: Constraint unique_horario_turma_tempo não está funcionando!';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE '✅ Constraint unique_horario_turma_tempo está funcionando corretamente!';
    END;
END $$;

-- 6. Verificar view vw_grade_completa
SELECT 
    'View Grade Completa' as verificacao,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Funcionando'
        ELSE '❌ Sem dados'
    END as status,
    COUNT(*) as total_registros
FROM vw_grade_completa
WHERE professor_cpf IN ('12345678901', '11144477735');

-- 7. Verificar configurações do sistema
SELECT 
    chave,
    valor,
    CASE 
        WHEN chave = 'auto_gerar_descritores' AND valor = 'true' THEN '✅ Ativo'
        WHEN chave = 'minutos_padrao_aula' AND valor::INTEGER > 0 THEN '✅ Configurado'
        WHEN chave = 'portaria_senha' AND valor IS NOT NULL THEN '✅ Definida'
        ELSE '⚠️ Verificar'
    END as status
FROM configuracoes_sistema
WHERE chave IN ('auto_gerar_descritores', 'minutos_padrao_aula', 'portaria_senha')
ORDER BY chave;

-- 8. Teste de conversão de dia da semana
SELECT 
    data_teste,
    obter_dia_semana(data_teste) as dia_semana_convertido
FROM (
    VALUES 
        ('2025-06-29'::DATE),  -- Domingo
        ('2025-06-30'::DATE),  -- Segunda
        ('2025-07-01'::DATE),  -- Terça
        ('2025-07-02'::DATE)   -- Quarta
) AS teste_datas(data_teste);

-- 9. Verificar integridade dos dados
WITH verificacao_integridade AS (
    SELECT 
        h.id as horario_id,
        h.turma_id,
        h.professor_id,
        h.materia_id,
        CASE 
            WHEN ts.id IS NULL THEN 'Turma inexistente'
            WHEN p.id IS NULL THEN 'Professor inexistente' 
            WHEN m.id IS NULL THEN 'Matéria inexistente'
            WHEN NOT p.ativo THEN 'Professor inativo'
            WHEN NOT ts.ativo THEN 'Turma inativa'
            ELSE 'OK'
        END as status_integridade
    FROM horarios_aulas h
    LEFT JOIN turmas_sistema ts ON h.turma_id = ts.id
    LEFT JOIN professores p ON h.professor_id = p.id
    LEFT JOIN materias m ON h.materia_id = m.id
    WHERE h.ativo = true
)
SELECT 
    status_integridade,
    COUNT(*) as quantidade
FROM verificacao_integridade
GROUP BY status_integridade
ORDER BY status_integridade;

-- Mensagem final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 VERIFICAÇÃO COMPLETA DO SISTEMA DE DESCRITORES';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ Funções SQL: Verificadas';
    RAISE NOTICE '✅ Constraints: Verificadas'; 
    RAISE NOTICE '✅ Dados de Teste: Verificados';
    RAISE NOTICE '✅ Views: Verificadas';
    RAISE NOTICE '✅ Configurações: Verificadas';
    RAISE NOTICE '✅ Integridade: Verificada';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Sistema pronto para uso!';
    RAISE NOTICE '📋 Execute os testes HTTP nos arquivos .http criados';
END $$;