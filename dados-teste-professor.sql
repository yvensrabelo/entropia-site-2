-- ====================================================================
-- 📊 DADOS DE TESTE PARA O SISTEMA DE DESCRITORES
-- Inserir professor, horários e dados básicos para testes
-- ====================================================================

-- 1. Inserir professor de teste
INSERT INTO professores (nome, cpf, materia_id, telefone, valor_por_minuto, ativo)
SELECT 
    'João Silva Santos',
    '12345678901',
    m.id,
    '(92) 99999-0001',
    1.85,
    true
FROM materias m 
WHERE m.nome = 'Matemática'
ON CONFLICT (cpf) DO UPDATE SET
    nome = EXCLUDED.nome,
    materia_id = EXCLUDED.materia_id,
    telefone = EXCLUDED.telefone,
    ativo = EXCLUDED.ativo;

-- 2. Inserir professor adicional para testes da portaria
INSERT INTO professores (nome, cpf, materia_id, telefone, valor_por_minuto, ativo) 
SELECT
    'Maria dos Santos',
    '11144477735',
    m.id,
    '(92) 99999-0002', 
    1.85,
    true
FROM materias m
WHERE m.nome = 'Português'
ON CONFLICT (cpf) DO UPDATE SET
    nome = EXCLUDED.nome,
    materia_id = EXCLUDED.materia_id,
    telefone = EXCLUDED.telefone,
    ativo = EXCLUDED.ativo;

-- 3. Inserir horários de exemplo
DO $$
DECLARE
    professor_mat UUID;
    professor_por UUID;
    turma_psc UUID;
    materia_mat UUID;
    materia_por UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO professor_mat FROM professores WHERE cpf = '12345678901';
    SELECT id INTO professor_por FROM professores WHERE cpf = '11144477735';
    SELECT id INTO turma_psc FROM turmas_sistema WHERE codigo = 'PSC-M-01';
    SELECT id INTO materia_mat FROM materias WHERE nome = 'Matemática';
    SELECT id INTO materia_por FROM materias WHERE nome = 'Português';
    
    -- Inserir horários de matemática (João)
    INSERT INTO horarios_aulas (
        turma_id, dia_semana, tempo, hora_inicio, hora_fim, 
        materia_id, professor_id, sala, ativo
    ) VALUES
    (turma_psc, 'segunda', 1, '07:00', '07:50', materia_mat, professor_mat, 'Sala 01', true),
    (turma_psc, 'terca', 1, '07:00', '07:50', materia_mat, professor_mat, 'Sala 01', true),
    (turma_psc, 'quarta', 1, '07:00', '07:50', materia_mat, professor_mat, 'Sala 01', true),
    (turma_psc, 'quinta', 1, '07:00', '07:50', materia_mat, professor_mat, 'Sala 01', true),
    (turma_psc, 'sexta', 1, '07:00', '07:50', materia_mat, professor_mat, 'Sala 01', true)
    ON CONFLICT (turma_id, dia_semana, tempo) DO UPDATE SET
        professor_id = EXCLUDED.professor_id,
        materia_id = EXCLUDED.materia_id;
    
    -- Inserir horários de português (Maria)
    INSERT INTO horarios_aulas (
        turma_id, dia_semana, tempo, hora_inicio, hora_fim, 
        materia_id, professor_id, sala, ativo
    ) VALUES
    (turma_psc, 'segunda', 2, '07:50', '08:40', materia_por, professor_por, 'Sala 01', true),
    (turma_psc, 'terca', 2, '07:50', '08:40', materia_por, professor_por, 'Sala 01', true),
    (turma_psc, 'quarta', 2, '07:50', '08:40', materia_por, professor_por, 'Sala 01', true),
    (turma_psc, 'quinta', 2, '07:50', '08:40', materia_por, professor_por, 'Sala 01', true),
    (turma_psc, 'sexta', 2, '07:50', '08:40', materia_por, professor_por, 'Sala 01', true)
    ON CONFLICT (turma_id, dia_semana, tempo) DO UPDATE SET
        professor_id = EXCLUDED.professor_id,
        materia_id = EXCLUDED.materia_id;
END $$;

-- 4. Gerar descritores automaticamente para hoje
SELECT gerar_descritores_automaticos(CURRENT_DATE);

-- 5. Verificar se os dados foram inseridos
SELECT 
    p.nome,
    p.cpf,
    m.nome as materia,
    COUNT(h.id) as total_horarios
FROM professores p
LEFT JOIN materias m ON p.materia_id = m.id
LEFT JOIN horarios_aulas h ON h.professor_id = p.id
WHERE p.cpf IN ('12345678901', '11144477735')
GROUP BY p.id, p.nome, p.cpf, m.nome
ORDER BY p.nome;

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Dados de teste inseridos com sucesso!';
    RAISE NOTICE '👨‍🏫 Professores: João Silva Santos (CPF: 12345678901) e Maria dos Santos (CPF: 11144477735)';
    RAISE NOTICE '📅 Horários: Segunda a sexta, 1º e 2º tempos na turma PSC-M-01';
    RAISE NOTICE '📝 Descritores gerados automaticamente para hoje';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Agora você pode testar as APIs com os CPFs válidos!';
END $$;