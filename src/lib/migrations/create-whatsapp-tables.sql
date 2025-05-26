-- Tabela de configuração do WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  server_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  instance_name TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'connecting', 'error')),
  qr_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de histórico de mensagens
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  to_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'text' CHECK (type IN ('text', 'notification', 'reminder', 'arrival')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de templates de mensagens
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  template TEXT NOT NULL,
  variables TEXT[], -- Array de variáveis disponíveis
  type VARCHAR(50) NOT NULL CHECK (type IN ('absence', 'arrival', 'reminder', 'custom')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de automações
CREATE TABLE IF NOT EXISTS whatsapp_automations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('absence_notification', 'arrival_notification', 'payment_reminder')),
  template_id UUID REFERENCES whatsapp_templates(id),
  is_active BOOLEAN DEFAULT false,
  schedule_time TIME, -- Para notificações agendadas (ex: 10:00)
  days_of_week INTEGER[], -- 0=domingo, 6=sábado
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de preferências de notificação por aluno
CREATE TABLE IF NOT EXISTS whatsapp_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE UNIQUE,
  notify_arrival BOOLEAN DEFAULT false,
  notify_absence BOOLEAN DEFAULT true,
  notify_payment BOOLEAN DEFAULT true,
  whatsapp_number VARCHAR(20), -- Número preferencial (pode ser diferente do cadastro)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_whatsapp_messages_aluno_id ON whatsapp_messages(aluno_id);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX idx_whatsapp_messages_created_at ON whatsapp_messages(created_at DESC);
CREATE INDEX idx_whatsapp_preferences_aluno_id ON whatsapp_preferences(aluno_id);

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_whatsapp_config_updated_at BEFORE UPDATE ON whatsapp_config
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_templates_updated_at BEFORE UPDATE ON whatsapp_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_automations_updated_at BEFORE UPDATE ON whatsapp_automations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_preferences_updated_at BEFORE UPDATE ON whatsapp_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir templates padrão
INSERT INTO whatsapp_templates (name, description, template, variables, type) VALUES
(
  'Notificação de Falta',
  'Enviada quando o aluno não comparece às aulas',
  'Olá {nome_responsavel}, {nome_aluno} não compareceu hoje às aulas do Entropia Cursinho. Em caso de dúvidas, entre em contato conosco.',
  ARRAY['nome_responsavel', 'nome_aluno', 'data'],
  'absence'
),
(
  'Confirmação de Chegada',
  'Enviada quando o aluno chega ao cursinho',
  '✅ {nome_aluno} chegou às {hora} - Entropia Cursinho',
  ARRAY['nome_aluno', 'hora'],
  'arrival'
),
(
  'Lembrete de Pagamento',
  'Lembrete para pagamentos pendentes',
  'Olá {nome_responsavel}, identificamos uma pendência financeira referente ao aluno {nome_aluno}. Por favor, regularize sua situação para manter o acesso às aulas. Valor: R$ {valor}',
  ARRAY['nome_responsavel', 'nome_aluno', 'valor', 'vencimento'],
  'reminder'
);

-- Comentários para documentação
COMMENT ON TABLE whatsapp_config IS 'Configurações da integração com Evolution API';
COMMENT ON TABLE whatsapp_messages IS 'Histórico de todas as mensagens enviadas via WhatsApp';
COMMENT ON TABLE whatsapp_templates IS 'Templates de mensagens reutilizáveis';
COMMENT ON TABLE whatsapp_automations IS 'Configurações de automações e notificações agendadas';
COMMENT ON TABLE whatsapp_preferences IS 'Preferências de notificação por aluno';