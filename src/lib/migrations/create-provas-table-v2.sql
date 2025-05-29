-- REESTRUTURAÇÃO COMPLETA DO BANCO DE PROVAS
-- Drop tabela antiga e crie nova estrutura
DROP TABLE IF EXISTS provas CASCADE;

CREATE TABLE provas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Informações básicas
  instituicao TEXT NOT NULL,
  tipo_prova TEXT NOT NULL, -- PSC, SIS, MACRO, ENEM, etc
  ano INTEGER NOT NULL,
  
  -- Agrupamento
  grupo_id TEXT NOT NULL, -- Para agrupar PSC dia 1+2, MACRO 4 áreas, etc
  ordem INTEGER DEFAULT 1, -- Ordem dentro do grupo
  
  -- Detalhes
  titulo TEXT NOT NULL,
  subtitulo TEXT, -- Ex: "Dia 1", "Conhecimentos Gerais", "Biológicas"
  
  -- Arquivos
  url_prova TEXT,
  url_gabarito TEXT,
  
  -- Metadados
  visualizacoes INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_provas_tipo ON provas(tipo_prova);
CREATE INDEX idx_provas_ano ON provas(ano);
CREATE INDEX idx_provas_grupo ON provas(grupo_id);
CREATE INDEX idx_provas_ativo ON provas(ativo);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_provas_updated_at BEFORE UPDATE
  ON provas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de exemplo
INSERT INTO provas (instituicao, tipo_prova, ano, grupo_id, ordem, titulo, subtitulo, url_prova, url_gabarito) VALUES
-- PSC 2024
('UFAM', 'PSC', 2024, 'psc-2024', 1, 'PSC 2024', 'PSC 1', 'https://example.com/psc-2024-etapa1-prova.pdf', 'https://example.com/psc-2024-etapa1-gabarito.pdf'),
('UFAM', 'PSC', 2024, 'psc-2024', 2, 'PSC 2024', 'PSC 2', 'https://example.com/psc-2024-etapa2-prova.pdf', 'https://example.com/psc-2024-etapa2-gabarito.pdf'),
('UFAM', 'PSC', 2024, 'psc-2024', 3, 'PSC 2024', 'PSC 3', 'https://example.com/psc-2024-etapa3-prova.pdf', 'https://example.com/psc-2024-etapa3-gabarito.pdf'),

-- PSI 2024
('UFAM', 'PSI', 2024, 'psi-2024', 1, 'PSI 2024', 'Dia 1', 'https://example.com/psi-2024-dia1-prova.pdf', 'https://example.com/psi-2024-dia1-gabarito.pdf'),
('UFAM', 'PSI', 2024, 'psi-2024', 2, 'PSI 2024', 'Dia 2', 'https://example.com/psi-2024-dia2-prova.pdf', 'https://example.com/psi-2024-dia2-gabarito.pdf'),

-- MACRO 2024
('UEA', 'MACRO', 2024, 'macro-2024', 1, 'MACRO 2024', 'Conhecimentos Gerais', 'https://example.com/macro-2024-geral-prova.pdf', 'https://example.com/macro-2024-geral-gabarito.pdf'),
('UEA', 'MACRO', 2024, 'macro-2024', 2, 'MACRO 2024', 'Biológicas', 'https://example.com/macro-2024-biologicas-prova.pdf', 'https://example.com/macro-2024-biologicas-gabarito.pdf'),
('UEA', 'MACRO', 2024, 'macro-2024', 3, 'MACRO 2024', 'Exatas', 'https://example.com/macro-2024-exatas-prova.pdf', 'https://example.com/macro-2024-exatas-gabarito.pdf'),
('UEA', 'MACRO', 2024, 'macro-2024', 4, 'MACRO 2024', 'Humanas', 'https://example.com/macro-2024-humanas-prova.pdf', 'https://example.com/macro-2024-humanas-gabarito.pdf'),

-- SIS 2024
('UEA', 'SIS', 2024, 'sis-2024-1', 1, 'SIS 2024', 'Etapa 1', 'https://example.com/sis-2024-etapa1-prova.pdf', 'https://example.com/sis-2024-etapa1-gabarito.pdf'),
('UEA', 'SIS', 2024, 'sis-2024-2', 1, 'SIS 2024', 'Etapa 2', 'https://example.com/sis-2024-etapa2-prova.pdf', 'https://example.com/sis-2024-etapa2-gabarito.pdf'),
('UEA', 'SIS', 2024, 'sis-2024-3', 1, 'SIS 2024', 'Etapa 3', 'https://example.com/sis-2024-etapa3-prova.pdf', 'https://example.com/sis-2024-etapa3-gabarito.pdf'),

-- ENEM 2023
('MEC', 'ENEM', 2023, 'enem-2023', 1, 'ENEM 2023', 'Dia 1', 'https://example.com/enem-2023-dia1-prova.pdf', 'https://example.com/enem-2023-dia1-gabarito.pdf'),
('MEC', 'ENEM', 2023, 'enem-2023', 2, 'ENEM 2023', 'Dia 2', 'https://example.com/enem-2023-dia2-prova.pdf', 'https://example.com/enem-2023-dia2-gabarito.pdf');