-- ========================================
-- LIMPEZA DE DUPLICAÇÕES NO WHATSAPP CONFIG
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- 1. Verificar quantas configurações existem
SELECT 
  instance_name, 
  COUNT(*) as total,
  STRING_AGG(id::text, ', ') as ids,
  MAX(created_at) as ultima_criacao
FROM whatsapp_config
GROUP BY instance_name
HAVING COUNT(*) > 1;

-- 2. Manter apenas a configuração mais recente para cada instance_name
DELETE FROM whatsapp_config
WHERE id NOT IN (
  SELECT DISTINCT ON (instance_name) id
  FROM whatsapp_config
  ORDER BY instance_name, created_at DESC
);

-- 3. Criar índice único em instance_name para evitar futuras duplicações
ALTER TABLE whatsapp_config 
DROP CONSTRAINT IF EXISTS whatsapp_config_instance_name_key;

ALTER TABLE whatsapp_config 
ADD CONSTRAINT whatsapp_config_instance_name_key UNIQUE (instance_name);

-- 4. Verificar resultado final
SELECT 
  id,
  instance_name,
  server_url,
  CASE 
    WHEN api_key IS NOT NULL AND LENGTH(api_key) > 0 
    THEN SUBSTRING(api_key, 1, 10) || '...' 
    ELSE 'VAZIA' 
  END as api_key_preview,
  status,
  created_at,
  updated_at
FROM whatsapp_config
ORDER BY created_at DESC;

-- 5. Mostrar estatísticas
SELECT 
  COUNT(*) as total_configs,
  COUNT(DISTINCT instance_name) as instancias_unicas,
  COUNT(CASE WHEN api_key IS NOT NULL AND LENGTH(api_key) > 0 THEN 1 END) as configs_com_api_key,
  COUNT(CASE WHEN status = 'connected' THEN 1 END) as configs_conectadas
FROM whatsapp_config;