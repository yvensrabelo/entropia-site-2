# 🚀 Migração Definitiva - SUPER REGISTRO CLIENTES

Este documento descreve o processo de migração definitiva dos 197 alunos do arquivo CSV.

## 📋 Pré-requisitos

1. **Arquivo CSV**: Coloque o arquivo `SUPER REGISTRO - CLIENTES.csv` na raiz do projeto
2. **Variáveis de ambiente**: Certifique-se de ter no `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service (opcional, mas recomendado)
   ```

## 🔧 Estrutura do CSV Esperada

O script espera as seguintes colunas no CSV:
- `NOME ALUNO` (obrigatório)
- `TELEFONE ALUNO`
- `CPF ALUNO` 
- `NOME RESPONSÁVEL`
- `TELEFONE RESPONSÁVEL`
- `CPF RESPONSÁVEL`
- `TURMA`
- `ASAAS`

## 🚀 Como Executar

1. **Instale as dependências** (se ainda não instalou):
   ```bash
   npm install
   ```

2. **Coloque o CSV na raiz do projeto**:
   ```
   entropia-site-2/
   ├── SUPER REGISTRO - CLIENTES.csv  <-- Aqui (com hífen)
   ├── package.json
   └── ...
   ```

3. **Execute a migração**:
   ```bash
   npm run migrate:students
   ```

## 📊 O que o Script Faz

### Etapa 1: Limpeza 🧹
- Remove todos os registros mal importados:
  - Alunos com nomes numéricos
  - Alunos com CPFs começando com "TEMP"
  - Registros com dados corrompidos

### Etapa 2: Importação 📥
- Lê o arquivo CSV linha por linha
- Para cada aluno:
  - Valida e limpa os dados
  - Gera CPF temporário se necessário (formato: 00000XXX...)
  - Verifica duplicatas pelo CPF
  - Detecta a turma automaticamente
  - Cria o registro do aluno
  - Cria a matrícula se houver turma

## 🔍 Tratamento de Dados

- **CPFs vazios**: Gera temporário automático
- **Telefones**: Remove formatação, mantém apenas números
- **Nomes**: Remove espaços extras
- **Turmas**: Busca por nome similar no banco
- **Duplicatas**: Ignora se CPF já existe

## 📈 Relatório Final

Após a execução, você verá:
```
╔════════════════════════════════════════╗
║        RELATÓRIO FINAL DA MIGRAÇÃO     ║
╠════════════════════════════════════════╣
║ 🗑️  Registros deletados: XXX           ║
║ 📊 Total no CSV: 197                   ║
║ ✅ Importados com sucesso: XXX         ║
║ ⏭️  Ignorados (duplicados): XXX        ║
║ ❌ Erros: XXX                          ║
║ 🔄 CPFs temporários gerados: XXX       ║
╚════════════════════════════════════════╝
```

## ⚠️ Avisos Importantes

1. **CPFs Temporários**: Alunos sem CPF receberão um CPF temporário. Atualize assim que tiver os dados reais.

2. **Turmas não encontradas**: Se uma turma no CSV não for encontrada no banco, o aluno será importado mas sem matrícula.

3. **Backup**: Sempre faça backup do banco antes de executar migrações em produção.

## 🛠️ Solução de Problemas

### Erro: "Arquivo CSV não encontrado"
- Verifique se o arquivo está na raiz do projeto
- O nome deve ser exatamente: `SUPER REGISTRO - CLIENTES.csv` (com hífen)

### Erro: "Variáveis de ambiente não configuradas"
- Verifique o arquivo `.env.local`
- Certifique-se de ter as chaves do Supabase

### Muitos erros de importação
- Verifique se as turmas existem no banco
- Confirme se o formato do CSV está correto
- Revise os logs de erro para detalhes

## 🔄 Próximos Passos

Após a migração:
1. Revise os alunos com CPF temporário
2. Atualize os CPFs reais quando disponíveis
3. Complete dados faltantes (endereço, email, etc.)
4. Configure valores de mensalidade nas matrículas