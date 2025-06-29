# 🔧 INSTRUÇÕES DE IMPLEMENTAÇÃO - SISTEMA DE DESCRITORES V2.0

## 📋 RESUMO DO QUE FOI CRIADO

✅ **Script SQL Completo** - `sistema-descritores-completo-v2.sql`  
✅ **3 APIs Principais** - Descritores, Portaria, Professor  
✅ **3 Interfaces** - Professor (mobile), Admin, Portaria  
✅ **Sistema de Notificações** - API para lembretes automáticos  
✅ **Configurações de Segurança** - RLS e auditoria  

---

## 🚀 ETAPAS DE IMPLEMENTAÇÃO

### **ETAPA 1: EXECUTAR O SQL NO SUPABASE**

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo de `sistema-descritores-completo-v2.sql`
4. Execute o script completo
5. Verifique se todas as tabelas foram criadas:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN (
     'materias', 'professores', 'topicos', 'turmas_sistema',
     'horarios_aulas', 'descritores', 'professor_presencas',
     'minutos_professores', 'descritor_logs', 'configuracoes_sistema'
   );
   ```

### **ETAPA 2: CONFIGURAR VARIÁVEIS DE AMBIENTE**

Adicione ao seu `.env.local`:
```env
# Supabase (já existentes)
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Webhooks e Notificações
WEBHOOK_PAIS_URL=https://webhook.cursoentropia.com/descritores
NOTIFICACAO_ANTECEDENCIA=60
EVOLUTION_API_URL=sua_url_evolution_api
EVOLUTION_API_KEY=sua_chave_evolution_api
```

### **ETAPA 3: TESTAR AS APIS**

#### **API de Professores** `/api/professor`
```bash
# Login do professor
curl -X POST http://localhost:3000/api/professor \
  -H "Content-Type: application/json" \
  -d '{"cpf": "12345678901", "action": "login"}'

# Buscar grade semanal
curl "http://localhost:3000/api/professor?cpf=12345678901&endpoint=grade"

# Buscar descritores do dia
curl "http://localhost:3000/api/professor?cpf=12345678901&endpoint=descritores&data=2024-01-15"
```

#### **API de Descritores** `/api/descritores-v2`
```bash
# Criar descritor
curl -X POST http://localhost:3000/api/descritores-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "horario_id": "uuid-do-horario",
    "professor_cpf": "12345678901",
    "data": "2024-01-15",
    "topico_id": "uuid-do-topico",
    "descricao_livre": "Aula sobre funções quadráticas"
  }'

# Buscar descritores (admin)
curl "http://localhost:3000/api/descritores-v2?admin=true&data=2024-01-15"
```

#### **API da Portaria** `/api/portaria`
```bash
# Status da portaria
curl "http://localhost:3000/api/portaria?turno=manha&data=2024-01-15"

# Registrar presença
curl -X POST http://localhost:3000/api/portaria \
  -H "Content-Type: application/json" \
  -d '{
    "professor_id": 1,
    "horario_id": "uuid-do-horario",
    "status_presenca": "presente",
    "data": "2024-01-15"
  }'
```

### **ETAPA 4: CONFIGURAR ROTAS NO NEXT.JS**

Adicione as rotas ao menu de navegação existente:

```tsx
// Em src/app/layout.tsx ou componente de navegação
const menuItems = [
  // ... items existentes
  { name: 'Professor', href: '/professor', icon: User },
  { name: 'Admin - Descritores', href: '/admin/descritores', icon: FileText },
  { name: 'Portaria', href: '/portaria-sistema', icon: Monitor },
];
```

### **ETAPA 5: POPULAR DADOS INICIAIS**

Execute estas queries para inserir dados de teste:

```sql
-- Inserir professores de exemplo
INSERT INTO professores (numero, nome, cpf, materia_id, telefone) 
SELECT 
    row_number() OVER (),
    nome,
    cpf,
    m.id,
    telefone
FROM (VALUES
    ('João Silva', '12345678901', 'Matemática', '(92) 99999-0001'),
    ('Maria Santos', '12345678902', 'Português', '(92) 99999-0002'),
    ('Pedro Oliveira', '12345678903', 'Física', '(92) 99999-0003')
) AS dados(nome, cpf, materia_nome, telefone)
JOIN materias m ON m.nome = dados.materia_nome;

-- Inserir horários de exemplo
INSERT INTO horarios_aulas (turma_id, dia_semana, tempo, hora_inicio, hora_fim, materia_id, professor_id, sala)
SELECT 
    ts.id,
    'segunda'::dia_semana_enum,
    1,
    '07:00'::TIME,
    '07:50'::TIME,
    m.id,
    p.id,
    'Sala 01'
FROM turmas_sistema ts
CROSS JOIN materias m
JOIN professores p ON p.materia_id = m.id
WHERE ts.codigo = 'PSC-M-01' AND m.nome = 'Matemática'
LIMIT 1;
```

### **ETAPA 6: CONFIGURAR AUTENTICAÇÃO ADMIN**

Para acessar `/admin/descritores`, configure o sistema de admin existente ou crie uma verificação simples:

```tsx
// Adicionar ao AuthContext existente ou criar novo
const verificarAcesso = () => {
  const isAdmin = localStorage.getItem('admin_access') === 'true';
  if (!isAdmin) {
    router.push('/admin/login');
  }
};
```

### **ETAPA 7: CONFIGURAR SISTEMA DE NOTIFICAÇÕES**

Para ativar lembretes automáticos, configure um cron job ou webhook:

```bash
# Exemplo com cron (Linux/Mac)
# Verificar professores a cada hora
0 * * * * curl -X GET http://localhost:3000/api/notificacoes?antecedencia=60

# Ou usar Vercel Cron Jobs
# Adicionar ao vercel.json:
{
  "crons": [
    {
      "path": "/api/notificacoes",
      "schedule": "0 * * * *"
    }
  ]
}
```

---

## 🔧 CONFIGURAÇÕES AVANÇADAS

### **Webhook para Pais (N8N)**

Configure o endpoint no N8N para receber descritores:
```json
{
  "action": "descritores_enviados",
  "turma_id": "uuid",
  "data": "2024-01-15",
  "descritores": [
    {
      "professor": "João Silva",
      "materia": "Matemática",
      "topico": "Funções",
      "descricao": "Aula sobre funções quadráticas",
      "tempo": 1,
      "horario": "07:00-07:50"
    }
  ]
}
```

### **Políticas RLS Personalizadas**

Para ajustar as políticas de segurança:
```sql
-- Permitir que professores vejam apenas seus dados
CREATE POLICY pol_professor_own_data ON descritores
    FOR ALL TO authenticated
    USING (
        professor_id = (
            SELECT id FROM professores 
            WHERE cpf = current_setting('app.current_user_cpf', true)
        )
    );
```

### **Personalização de Interface**

Para personalizar cores e temas, edite:
- `tailwind.config.cjs` - Cores principais
- `src/app/globals.css` - Estilos globais
- Components individuais para ajustes específicos

---

## 📊 MONITORAMENTO E LOGS

### **Verificar Logs de Sistema**
```sql
-- Logs de descritores
SELECT * FROM descritor_logs 
WHERE created_at >= CURRENT_DATE 
ORDER BY created_at DESC;

-- Presenças do dia
SELECT * FROM professor_presencas 
WHERE data = CURRENT_DATE;

-- Pagamentos do mês
SELECT * FROM vw_resumo_pagamentos 
WHERE mes_referencia = DATE_TRUNC('month', CURRENT_DATE);
```

### **Métricas Importantes**
- Total de descritores preenchidos por dia
- Taxa de presença dos professores
- Tempo médio de preenchimento
- Erros de envio de notificações

---

## 🚨 TROUBLESHOOTING

### **Problemas Comuns**

1. **Erro "Table doesn't exist"**
   - Execute o script SQL completo novamente
   - Verifique se está conectado ao banco correto

2. **Professor não consegue fazer login**
   - Verifique se o CPF está cadastrado na tabela `professores`
   - Confirme se o professor está ativo (`ativo = true`)

3. **Descritores não aparecem**
   - Verifique se existe horário cadastrado para o professor
   - Confirme se a data corresponde ao dia da semana

4. **Notificações não funcionam**
   - Verifique se a Evolution API está configurada
   - Confirme se os telefones estão corretos

5. **Portaria não carrega**
   - Verifique a senha no banco: `SELECT valor FROM configuracoes_sistema WHERE chave = 'portaria_senha'`
   - Confirme se há professores com horários para o dia

---

## 📞 PRÓXIMOS PASSOS

1. **Teste completo** em ambiente de desenvolvimento
2. **Migração de dados** existentes se necessário
3. **Treinamento** da equipe nos novos módulos
4. **Deploy em produção** com backup de segurança
5. **Monitoramento** dos primeiros dias de uso

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] SQL executado no Supabase
- [ ] Variáveis de ambiente configuradas  
- [ ] APIs testadas e funcionais
- [ ] Interfaces acessíveis via browser
- [ ] Dados iniciais inseridos
- [ ] Sistema de notificações ativo
- [ ] Políticas de segurança validadas
- [ ] Backup de dados existentes realizado
- [ ] Equipe treinada nos novos fluxos
- [ ] Monitoramento ativo em produção

**🎉 Parabéns! O Sistema de Descritores V2.0 está pronto para uso!**