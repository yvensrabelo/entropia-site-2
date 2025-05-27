-- Adicionar controles de visibilidade para campos das turmas
ALTER TABLE turmas
ADD COLUMN IF NOT EXISTS exibir_periodo BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS exibir_duracao BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS exibir_vagas BOOLEAN DEFAULT TRUE;

-- Comentários explicativos
COMMENT ON COLUMN turmas.exibir_periodo IS 'Controla se o período deve ser exibido no card da turma';
COMMENT ON COLUMN turmas.exibir_duracao IS 'Controla se a duração deve ser exibida no card da turma';
COMMENT ON COLUMN turmas.exibir_vagas IS 'Controla se o número de vagas deve ser exibido no card da turma';