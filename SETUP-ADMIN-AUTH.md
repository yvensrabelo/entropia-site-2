# Configuração de Autenticação Admin

## 1. Criar a tabela de admin_users no Supabase

Execute o SQL disponível em `src/lib/create-admin-users-table.sql` no editor SQL do Supabase.

## 2. Criar um usuário admin no Supabase Auth

1. Vá para Authentication > Users no painel do Supabase
2. Clique em "Invite user" ou "Create user"
3. Insira o email do administrador (ex: admin@entropia.com)
4. Defina uma senha segura
5. Confirme a criação

## 3. Adicionar o usuário à tabela admin_users

Após criar o usuário no Auth, execute este SQL no Supabase:

```sql
INSERT INTO admin_users (email, nome, cpf) VALUES 
('admin@entropia.com', 'Nome do Administrador', '98660608291');
```

Substitua os valores com os dados reais do administrador.

## 4. Testar o login

1. Acesse `/admin/login`
2. Use o email e senha criados no passo 2
3. Você será redirecionado para o dashboard admin

## Estrutura de Proteção

- **Middleware** (`middleware.ts`): Protege todas as rotas `/admin/*` exceto `/admin/login`
- **Layout Admin** (`src/app/admin/layout.tsx`): Verifica autenticação em cada renderização
- **Dashboard Layout**: Gerencia logout e navegação
- **Redirect automático**: `/admin` redireciona para `/admin/dashboard`

## Segurança

- Todas as rotas admin são protegidas por middleware
- Verificação dupla: middleware + componente layout
- Sessões gerenciadas pelo Supabase Auth
- RLS (Row Level Security) habilitado na tabela admin_users