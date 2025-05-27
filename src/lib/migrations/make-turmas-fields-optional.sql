-- Tornar campos periodo, duracao e vagas_disponiveis opcionais na tabela turmas
ALTER TABLE turmas 
ALTER COLUMN periodo DROP NOT NULL,
ALTER COLUMN duracao DROP NOT NULL,
ALTER COLUMN vagas_disponiveis DROP NOT NULL;

-- Comentários explicativos
COMMENT ON COLUMN turmas.periodo IS 'Período opcional da turma (ex: Janeiro a Novembro)';
COMMENT ON COLUMN turmas.duracao IS 'Duração opcional da turma (ex: 11 meses)';
COMMENT ON COLUMN turmas.vagas_disponiveis IS 'Número de vagas disponíveis (opcional)';