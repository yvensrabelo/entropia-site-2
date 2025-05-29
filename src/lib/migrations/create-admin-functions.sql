-- Função para buscar usuário por email (necessária para adicionar admins)
CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS TABLE(id UUID, email TEXT) AS $$
BEGIN
  -- Apenas admins podem executar esta função
  IF NOT EXISTS (
    SELECT 1 FROM admins WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Acesso negado. Apenas admins podem executar esta função.';
  END IF;

  RETURN QUERY
  SELECT au.id, au.email::TEXT
  FROM auth.users au
  WHERE LOWER(au.email) = LOWER(user_email)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permissão para usuários autenticados executarem a função
GRANT EXECUTE ON FUNCTION get_user_by_email TO authenticated;

-- Função para verificar se um usuário é admin
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  -- Se não passar user_id, verifica o usuário atual
  IF check_user_id IS NULL THEN
    check_user_id := auth.uid();
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM admins WHERE user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permissão para usuários autenticados executarem a função
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;