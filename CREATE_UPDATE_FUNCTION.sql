-- Função para atualizar prova e retornar os dados atualizados
-- Execute isso no Supabase SQL Editor

CREATE OR REPLACE FUNCTION update_prova_and_return(
  prova_id UUID,
  new_titulo TEXT DEFAULT NULL,
  new_subtitulo TEXT DEFAULT NULL,
  new_area TEXT DEFAULT NULL,
  new_subcategoria TEXT DEFAULT NULL,
  new_instituicao TEXT DEFAULT NULL,
  new_tipo_prova TEXT DEFAULT NULL,
  new_ano INT DEFAULT NULL,
  new_url_prova TEXT DEFAULT NULL,
  new_url_gabarito TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  titulo TEXT,
  subtitulo TEXT,
  instituicao TEXT,
  tipo_prova TEXT,
  subcategoria TEXT,
  area TEXT,
  ano INT,
  url_prova TEXT,
  url_gabarito TEXT,
  grupo_id TEXT,
  ordem INT,
  etapa TEXT,
  visualizacoes INT,
  ativo BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Atualizar a prova
  UPDATE provas
  SET 
    titulo = COALESCE(new_titulo, provas.titulo),
    subtitulo = CASE 
      WHEN new_subtitulo IS NOT NULL THEN new_subtitulo 
      ELSE provas.subtitulo 
    END,
    area = CASE 
      WHEN new_area IS NOT NULL THEN new_area 
      ELSE provas.area 
    END,
    subcategoria = CASE 
      WHEN new_subcategoria IS NOT NULL THEN new_subcategoria 
      ELSE provas.subcategoria 
    END,
    instituicao = COALESCE(new_instituicao, provas.instituicao),
    tipo_prova = COALESCE(new_tipo_prova, provas.tipo_prova),
    ano = COALESCE(new_ano, provas.ano),
    url_prova = CASE 
      WHEN new_url_prova IS NOT NULL THEN new_url_prova 
      ELSE provas.url_prova 
    END,
    url_gabarito = CASE 
      WHEN new_url_gabarito IS NOT NULL THEN new_url_gabarito 
      ELSE provas.url_gabarito 
    END,
    updated_at = NOW()
  WHERE provas.id = prova_id;
  
  -- Retornar os dados atualizados
  RETURN QUERY
  SELECT 
    p.id,
    p.titulo,
    p.subtitulo,
    p.instituicao,
    p.tipo_prova,
    p.subcategoria,
    p.area,
    p.ano,
    p.url_prova,
    p.url_gabarito,
    p.grupo_id,
    p.ordem,
    p.etapa,
    p.visualizacoes,
    p.ativo,
    p.created_at,
    p.updated_at
  FROM provas p
  WHERE p.id = prova_id;
END;
$$ LANGUAGE plpgsql;

-- Garantir que a função tenha as permissões corretas
GRANT EXECUTE ON FUNCTION update_prova_and_return TO authenticated;
GRANT EXECUTE ON FUNCTION update_prova_and_return TO service_role;