# Entropia Cursinho - Sistema de Matrícula

Sistema completo de gestão e matrícula para o Cursinho Entropia, focado em preparação para ENEM, PSC UFAM, SIS UEA e MACRO.

## 🚀 Funcionalidades

- ✅ **Sistema de matrícula** com formulário multi-etapas otimizado
- ✅ **Painel administrativo** completo com gestão de turmas
- ✅ **Portal do professor** para gerenciamento de horários
- ✅ **Sistema de portaria** com catraca integrada
- ✅ **Calculadora de notas** para PSC, MACRO, SIS e ENEM
- ✅ **Banco de provas** com sistema de busca avançada
- ✅ **Interface responsiva** com design moderno
- ✅ **Animações** com Framer Motion

## 🛠️ Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Estilização**: Tailwind CSS
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **TypeScript**: Para tipagem estática
- **Storage**: localStorage (migração futura para Supabase)
- **Deploy**: Vercel

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/yvensrabelo/entropia-site-2.git

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Execute em produção
npm start
```

## 🌐 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório GitHub à Vercel
2. Deploy automático a cada push
3. Configuração zero para Next.js

O projeto está configurado para deploy direto no Vercel com o arquivo `vercel.json` incluído.

## 📱 Páginas Principais

- `/` - **Homepage** com seleção de turmas
- `/matricula` - **Formulário de matrícula** otimizado
- `/calculadora` - **Calculadora de notas** (PSC, ENEM, SIS, MACRO)
- `/banco-de-provas` - **Banco de provas** com sistema de busca
- `/admin/login` - **Login administrativo**
- `/admin/dashboard` - **Painel administrativo**
- `/portaria` - **Sistema de portaria** com catraca

## 🎯 Sistema de Matrícula

### Formulário otimizado com:
- 📋 **Multi-etapas**: Dados pessoais, responsável e revisão
- ✅ **Validações inteligentes**: CPF, telefone brasileiro, idade
- 🎨 **Interface moderna**: Design responsivo e animações
- 📱 **Mobile-first**: Experiência otimizada para celular
- 💾 **Persistência**: Dados salvos automaticamente

### Características técnicas:
- Validação de CPF real com algoritmo matemático
- Verificação automática de maioridade
- Formatação automática de telefone brasileiro (DDD)
- Sistema de webhook para integração externa
- localStorage para persistência de dados

## 🔐 Painel Administrativo

### Funcionalidades:
- 👥 **Gestão de turmas**: Criação e edição simplificada
- 📊 **Dashboard**: Estatísticas e métricas
- 📋 **Sistema de provas**: Upload e gerenciamento
- 🕐 **Horários**: Mapeamento e configuração
- 👨‍🏫 **Professores**: Cadastro e alocação

## 🎨 Características do Design

### Homepage:
- Layout com glassmorphism no navbar
- Seleção de turmas por série
- Cards de estudantes aprovados
- Design responsivo mobile/desktop

### Calculadora:
- Interface intuitiva para múltiplos vestibulares
- Cálculo automático de cotas sociais
- Comparativo de cursos em tempo real
- Simulação de notas de corte

## 📈 Próximos Passos

- [ ] Integração com Supabase para dados em nuvem
- [ ] Sistema de pagamento online
- [ ] Notificações automáticas
- [ ] App mobile (React Native)
- [ ] Portal do professor completo
- [ ] Relatórios em PDF

## 📄 Licença

Propriedade do Cursinho Entropia.