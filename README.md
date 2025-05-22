# Entropia Cursinho

Sistema web completo para o Entropia Cursinho, incluindo calculadora de notas para vestibulares, portal do aluno e painel administrativo com integração ao Supabase.

## 🚀 Funcionalidades

- **Calculadora de Notas**: Suporte para PSC, MACRO, SIS e ENEM
- **Portal do Aluno**: Dashboard completo com notas, presenças, financeiro e materiais
- **Painel Administrativo**: Gestão de usuários e sistema
- **Interface Responsiva**: Design moderno com Tailwind CSS
- **Animações**: Framer Motion para UX aprimorada
- **Banco de Dados**: Supabase para dados em tempo real

## 🛠️ Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Estilização**: Tailwind CSS
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **TypeScript**: Para tipagem estática
- **Deploy**: Vercel

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/yvensrabelo/entropia-site-2.git

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Execute em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Execute em produção
npm start
```

## 🔧 Configuração do Supabase

1. **Criar projeto no Supabase**:
   - Acesse [supabase.com](https://supabase.com)
   - Crie um novo projeto
   - Copie as credenciais (URL e anon key)

2. **Configurar banco de dados**:
   ```sql
   -- Execute o script em src/lib/database.sql no SQL Editor do Supabase
   ```

3. **Configurar variáveis de ambiente**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

## 🗄️ Estrutura do Banco de Dados

### Tabelas principais:
- **usuarios**: Dados dos estudantes
- **presencas**: Registro de frequência
- **notas**: Histórico de avaliações
- **financeiro**: Situação financeira
- **materiais**: Apostilas e recursos

### Recursos:
- ✅ Row Level Security (RLS)
- ✅ Políticas de acesso por usuário
- ✅ Índices otimizados
- ✅ Triggers automáticos

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento
- `npm run build` - Gera build de produção
- `npm start` - Executa build de produção
- `npm run lint` - Executa linting do código

## 🌐 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente no painel da Vercel
3. Deploy automático a cada push

### Variáveis de ambiente necessárias:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 Páginas

- `/` - Página inicial (Em breve)
- `/calculadora` - Calculadora de notas
- `/login` - Login do aluno
- `/admin/login` - Login administrativo
- `/aluno/dashboard` - Dashboard do aluno
- `/admin/dashboard` - Dashboard administrativo

## 🎯 Portal do Aluno

### Dashboard completo com:
- 📊 **Estatísticas**: Frequência, média geral, pendências
- 📝 **Notas**: Histórico completo de avaliações
- 📅 **Presenças**: Registro de frequência por disciplina
- 💰 **Financeiro**: Mensalidades e pendências
- 📚 **Materiais**: Download de apostilas e recursos

### Características:
- Interface responsiva e moderna
- Dados em tempo real via Supabase
- Navegação por abas intuitiva
- Gráficos e estatísticas visuais

## 🔐 Autenticação

### Sistema de login:
- Autenticação por CPF e senha
- Integração com Supabase
- Proteção de rotas automática
- Sessão persistente

### Usuário de teste:
- **CPF**: 986.606.082-91
- **Senha**: yvens123

## 🎨 Características do Design

### Portal do Aluno:
- Design limpo e profissional
- Cards informativos com estatísticas
- Tabelas responsivas
- Sistema de tabs para organização
- Animações suaves com Framer Motion

### Calculadora:
- Interface intuitiva
- Suporte a múltiplos processos seletivos
- Cálculo automático de cotas
- Comparativo de cursos em tempo real

## 🔄 Integração Supabase

### Funcionalidades implementadas:
- ✅ Autenticação de usuários
- ✅ Consultas em tempo real
- ✅ Políticas de segurança (RLS)
- ✅ Relacionamentos entre tabelas
- ✅ Dados de exemplo incluídos

### APIs utilizadas:
- `supabase.from('usuarios')` - Gerenciamento de usuários
- `supabase.from('notas')` - Histórico acadêmico
- `supabase.from('presencas')` - Controle de frequência
- `supabase.from('financeiro')` - Gestão financeira
- `supabase.from('materiais')` - Recursos educacionais

## 📈 Próximos Passos

- [ ] Sistema de notificações
- [ ] Upload de arquivos para materiais
- [ ] Relatórios em PDF
- [ ] Dashboard para professores
- [ ] App mobile (React Native)
- [ ] Integração com APIs de pagamento

## 📄 Licença

MIT © 2025 Yvens Rabelo

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request