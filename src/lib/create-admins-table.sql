-- Criar tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_cpf ON admins(cpf);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE
  ON admins FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Política para permitir que admins autenticados vejam todos os admins
CREATE POLICY "Admins podem ver todos os admins" ON admins
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.email = auth.email()
    )
  );

-- Política para permitir que admins atualizem seus próprios dados
CREATE POLICY "Admins podem atualizar seus próprios dados" ON admins
  FOR UPDATE
  TO authenticated
  USING (email = auth.email())
  WITH CHECK (email = auth.email());

-- Inserir um admin de exemplo (REMOVA EM PRODUÇÃO)
-- Primeiro, crie um usuário no Supabase Auth com este email
-- Depois execute este insert
-- INSERT INTO admins (email, nome, cpf) VALUES 
-- ('admin@entropia.com', 'Administrador', '98660608291');