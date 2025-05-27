-- Adicionar campos para mensagem personalizada e imagem do WhatsApp
ALTER TABLE turmas 
ADD COLUMN IF NOT EXISTS mensagem_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS imagem_url TEXT;

-- Comentário sobre os campos
COMMENT ON COLUMN turmas.mensagem_whatsapp IS 'Mensagem personalizada para envio via WhatsApp quando alguém solicita informações sobre esta turma';
COMMENT ON COLUMN turmas.imagem_url IS 'URL da imagem a ser enviada junto com a mensagem do WhatsApp';