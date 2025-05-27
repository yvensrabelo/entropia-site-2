-- Criar tabela de administradores
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_cpf ON admin_users(cpf);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE
  ON admin_users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Política para permitir que admins autenticados vejam todos os admins
CREATE POLICY "Admins podem ver todos os admins" ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.email()
    )
  );

-- Política para permitir que admins atualizem seus próprios dados
CREATE POLICY "Admins podem atualizar seus próprios dados" ON admin_users
  FOR UPDATE
  TO authenticated
  USING (email = auth.email())
  WITH CHECK (email = auth.email());

-- Inserir um admin de exemplo (REMOVA EM PRODUÇÃO)
-- Primeiro, crie um usuário no Supabase Auth com este email
-- Depois execute este insert
-- INSERT INTO admin_users (email, nome, cpf) VALUES 
-- ('admin@entropia.com', 'Administrador', '98660608291');