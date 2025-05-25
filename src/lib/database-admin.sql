-- Criar tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inserir admin inicial (senha: yvens123)
-- Nota: Em produção, use um hash bcrypt real
INSERT INTO admins (cpf, senha, nome, email) VALUES 
('98660608291', '$2a$10$X7qQjKBHLxQxGZ9Z9kLxF.GvH3FnL5ImVxL5hJLXKrMYr5XwQrNhC', 'Yvens Rabelo', 'yvens@entropia.com')
ON CONFLICT (cpf) DO NOTHING;

-- Habilitar RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Política para admins verem todos os dados (admin não precisa de restrição)
CREATE POLICY "Admins podem fazer tudo" ON admins
  FOR ALL USING (true);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_admins_updated_at();