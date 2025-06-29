-- ====================================================================
-- 🔧 MELHORIAS NA FUNÇÃO gerar_descritores_automaticos
-- Adicionar descrição padrão conforme solicitado
-- ====================================================================

-- Atualizar a função para incluir descrição padrão
CREATE OR REPLACE FUNCTION gerar_descritores_automaticos(data_aula DATE)
RETURNS INTEGER AS $$
DECLARE
    contador INTEGER := 0;
    horario_record RECORD;
    dia_semana_aula dia_semana_enum;
BEGIN
    -- Obter dia da semana
    dia_semana_aula := obter_dia_semana(data_aula);
    
    -- Verificar se auto-geração está ativa
    IF NOT EXISTS (
        SELECT 1 FROM configuracoes_sistema 
        WHERE chave = 'auto_gerar_descritores' AND valor = 'true'
    ) THEN
        RETURN 0;
    END IF;
    
    -- Gerar descritores para todos os horários do dia
    FOR horario_record IN 
        SELECT * FROM vw_grade_completa 
        WHERE dia_semana = dia_semana_aula 
        AND professor_id IS NOT NULL
        AND ativo = true
    LOOP
        -- Verificar se já existe
        IF NOT EXISTS (
            SELECT 1 FROM descritores 
            WHERE horario_id = horario_record.horario_id 
            AND data = data_aula
        ) THEN
            INSERT INTO descritores (
                horario_id,
                professor_id,
                data,
                descricao_livre,
                minutos_aula,
                editavel,
                created_at
            ) VALUES (
                horario_record.horario_id,
                horario_record.professor_id,
                data_aula,
                'Aula realizada conforme planejado.',
                COALESCE(
                    (SELECT valor::INTEGER FROM configuracoes_sistema WHERE chave = 'minutos_padrao_aula'),
                    50
                ),
                true,
                NOW()
            );
            contador := contador + 1;
        END IF;
    END LOOP;
    
    RETURN contador;
END;
$$ LANGUAGE plpgsql;

-- Testar a função melhorada
DO $$
DECLARE
    descritores_criados INTEGER;
BEGIN
    -- Limpar descritores de teste existentes
    DELETE FROM descritores WHERE data = CURRENT_DATE;
    
    -- Gerar novos descritores com a função melhorada
    SELECT gerar_descritores_automaticos(CURRENT_DATE) INTO descritores_criados;
    
    RAISE NOTICE '✅ Função melhorada executada com sucesso!';
    RAISE NOTICE '📝 Descritores criados para hoje: %', descritores_criados;
    
    -- Verificar se a descrição padrão foi inserida
    IF EXISTS (
        SELECT 1 FROM descritores 
        WHERE data = CURRENT_DATE 
        AND descricao_livre = 'Aula realizada conforme planejado.'
    ) THEN
        RAISE NOTICE '✅ Descrição padrão inserida corretamente!';
    ELSE
        RAISE NOTICE '⚠️ Descrição padrão não encontrada.';
    END IF;
END $$;

-- Verificar resultados
SELECT 
    d.data,
    p.nome as professor,
    m.nome as materia,
    h.tempo,
    d.descricao_livre,
    d.minutos_aula
FROM descritores d
JOIN professores p ON d.professor_id = p.id
JOIN horarios_aulas h ON d.horario_id = h.id
JOIN materias m ON h.materia_id = m.id
WHERE d.data = CURRENT_DATE
ORDER BY p.nome, h.tempo;