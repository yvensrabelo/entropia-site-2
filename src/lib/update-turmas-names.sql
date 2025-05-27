-- Atualizar nomenclatura das turmas para padrão mais descritivo
-- Este script atualiza os nomes das turmas existentes e cria a nova turma INTENSIVA

-- Atualizar turmas PREVEST (Extensivo)
UPDATE turmas SET nome = 'EXTENSIVA MATUTINA 1' WHERE nome = 'T1' AND tipo = 'PREVEST' AND turno = 'Matutino';
UPDATE turmas SET nome = 'EXTENSIVA MATUTINA 2' WHERE nome = 'T2' AND tipo = 'PREVEST' AND turno = 'Matutino';
UPDATE turmas SET nome = 'EXTENSIVA VESPERTINA 1' WHERE nome = 'T1' AND tipo = 'PREVEST' AND turno = 'Vespertino';
UPDATE turmas SET nome = 'EXTENSIVA VESPERTINA 2' WHERE nome = 'T2' AND tipo = 'PREVEST' AND turno = 'Vespertino';
UPDATE turmas SET nome = 'EXTENSIVA NOTURNA 1' WHERE nome = 'T1' AND tipo = 'PREVEST' AND turno = 'Noturno';

-- Atualizar turmas PSC
UPDATE turmas SET nome = 'TURMA SIS/PSC 1' WHERE nome = 'TURMA PRIMEIRO ANO';
UPDATE turmas SET nome = 'TURMA SIS/PSC 2' WHERE nome = 'TURMA SEGUNDO ANO';

-- Criar nova turma INTENSIVA
INSERT INTO turmas (nome, tipo, capacidade, turno, status) 
VALUES ('INTENSIVA', 'INTENSIVO', 40, 'Integral', 'ATIVA')
ON CONFLICT (nome) DO NOTHING; -- Evita erro se a turma já existir

-- Verificar as mudanças
SELECT id, nome, tipo, turno, capacidade, status FROM turmas ORDER BY tipo, turno, nome;