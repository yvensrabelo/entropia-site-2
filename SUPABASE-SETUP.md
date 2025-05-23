# 🚀 Configuração do Supabase para Entropia

## 1. Criar Projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Clique em "New Project"
3. Preencha:
   - **Name**: entropia-cursinho
   - **Database Password**: (anote em local seguro)
   - **Region**: São Paulo (Brazil East)
   - **Plan**: Free tier

## 2. Configurar Variáveis de Ambiente

1. No dashboard do Supabase, vá em **Settings > API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

3. Crie o arquivo `.env.local`:
```bash
cp .env.local.example .env.local
```

4. Preencha com suas credenciais:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

## 3. Executar o Schema do Banco

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **New Query**
3. Cole o conteúdo de `src/lib/database-schema.sql`
4. Execute com **Run**

## 4. Configurar Autenticação

1. Vá em **Authentication > Providers**
2. Certifique-se que **Email** está habilitado
3. Em **Auth Settings**:
   - Enable email confirmations: OFF (para desenvolvimento)
   - Minimum password length: 6

## 5. Configurar Storage (Opcional)

Para armazenar materiais/arquivos:

1. Vá em **Storage**
2. Crie um bucket chamado `materials`
3. Em **Policies**, adicione:
   - Public read para materiais públicos
   - Authenticated read para materiais privados

## 6. Criar Usuário Admin Inicial

Execute no SQL Editor:

```sql
-- Criar usuário admin (substitua os valores)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@entropia.edu.br',
  crypt('senha_admin_123', gen_salt('bf')),
  now(),
  '{"cpf": "000.000.000-00", "full_name": "Administrador", "role": "admin"}'::jsonb,
  now(),
  now()
);
```

## 7. Testar a Conexão

1. Reinicie o servidor Next.js:
```bash
npm run dev
```

2. Verifique o console do navegador - não deve haver erros de Supabase

## 8. Próximos Passos

### Implementar:
- [ ] Página de cadastro com Supabase
- [ ] Login com email/CPF
- [ ] Dashboard integrado
- [ ] Upload de materiais
- [ ] Sistema de pagamentos

### Segurança:
- [ ] Habilitar RLS em produção
- [ ] Configurar CORS adequadamente
- [ ] Implementar rate limiting
- [ ] Adicionar 2FA para admins

## Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se o `.env.local` existe e tem as variáveis corretas
- Reinicie o servidor após criar o arquivo

### Erro: "Invalid API key"
- Confirme que copiou a chave `anon` correta
- Verifique se não há espaços extras

### Erro ao criar usuário
- Certifique-se que o email é único
- Verifique se a extensão pgcrypto está habilitada

## Links Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)