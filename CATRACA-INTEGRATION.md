# 🚪 Integração com Sistema de Catraca

Este documento descreve a integração do sistema Entropia com a catraca para registro automático de presenças.

## 📡 Webhook Endpoint

### URL do Webhook
```
https://seu-dominio.com/api/webhook/catraca
```

### Método
```
POST
```

### Headers
```
Content-Type: application/json
```

## 📊 Estrutura dos Dados

### Request Body
```json
{
  "enrollid": 78,
  "nome": "IANDRA LIVIA DE SOUZA CUNHA",
  "time": "2025-05-24 12:14:56",
  "access": 1,
  "message": "LIBERADO (FIN.EXTERNO)"
}
```

### Campos
- **enrollid** (number): ID de enrollment na catraca
- **nome** (string): Nome completo do aluno
- **time** (string): Data e hora no formato "YYYY-MM-DD HH:MM:SS"
- **access** (number): 1 = Liberado, 0 = Bloqueado
- **message** (string): Mensagem da catraca

### Response
```json
{
  "success": true,
  "message": "Presença registrada com sucesso",
  "aluno": "IANDRA LIVIA DE SOUZA CUNHA",
  "data": "2025-05-24",
  "hora": "12:14:56"
}
```

## 🔧 Configuração da Catraca

Configure o sistema da catraca para enviar webhooks para:
```
https://seu-dominio.com/api/webhook/catraca
```

## 🧪 Teste do Webhook

### 1. Teste via GET (Verificar se está funcionando)
```bash
curl https://seu-dominio.com/api/webhook/catraca
```

### 2. Teste via POST (Simular entrada)
```bash
curl -X POST https://seu-dominio.com/api/webhook/catraca \
  -H "Content-Type: application/json" \
  -d '{
    "enrollid": 99,
    "nome": "TESTE MANUAL",
    "time": "2025-05-24 12:00:00",
    "access": 1,
    "message": "TESTE"
  }'
```

### 3. Teste Automático
```bash
# GET para teste com dados aleatórios
curl https://seu-dominio.com/api/test-catraca

# POST para teste com dados específicos
curl -X POST https://seu-dominio.com/api/test-catraca \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "YVENS RABELO",
    "access": 1
  }'
```

## 📋 Regras de Negócio

1. **Identificação do Aluno**: 
   - Busca pelo nome (case insensitive)
   - Se múltiplos resultados, tenta match exato
   - Se não encontrar, registra log mas retorna sucesso

2. **Registro de Presença**:
   - Apenas primeira entrada do dia é registrada
   - Múltiplas entradas no mesmo dia são ignoradas
   - Apenas access = 1 (liberado) gera presença

3. **Resposta Sempre Sucesso**:
   - SEMPRE retorna HTTP 200 com success: true
   - Evita travar a catraca em caso de erro
   - Todos os erros são logados internamente

## 🗄️ Estrutura do Banco de Dados

### Tabela: presencas
```sql
CREATE TABLE presencas (
  id UUID PRIMARY KEY,
  aluno_id UUID NOT NULL,
  data DATE NOT NULL,
  hora_entrada TIME,
  hora_saida TIME,
  tipo VARCHAR(50) DEFAULT 'catraca',
  enrollid_catraca INTEGER,
  observacoes TEXT,
  criado_em TIMESTAMP,
  UNIQUE(aluno_id, data)
);
```

## 📊 Visualização de Presenças

### Painel Admin
- Acesse: `/admin/dashboard/presencas`
- Filtros por data e turma
- Estatísticas de frequência
- Exportação para CSV

### Registro Manual
- Acesse: `/admin/dashboard/presencas/registrar`
- Para casos de falha na catraca
- Permite múltiplos alunos de uma vez

## 🐛 Debug e Logs

Todos os webhooks são logados no console com:
- Timestamp
- Status (RECEBIDO, SUCESSO, ERRO, etc.)
- Dados completos da requisição
- Detalhes do processamento

### Exemplo de Log
```
[2025-05-24T12:14:56.789Z] CATRACA WEBHOOK - SUCESSO
  Nome: IANDRA LIVIA DE SOUZA CUNHA
  EnrollID: 78
  Time: 2025-05-24 12:14:56
  Access: 1
  Message: LIBERADO (FIN.EXTERNO)
  Detalhes: Presença registrada para IANDRA LIVIA DE SOUZA CUNHA
---
```

## 🚨 Tratamento de Erros

1. **Aluno não encontrado**: Loga mas retorna sucesso
2. **Presença duplicada**: Ignora e retorna sucesso
3. **Erro no banco**: Loga erro mas retorna sucesso
4. **Dados inválidos**: Processa parcialmente e retorna sucesso

## 🔐 Segurança

- Endpoint público (catraca precisa acessar)
- Validação mínima para não bloquear
- Logs detalhados para auditoria
- Sem exposição de dados sensíveis na resposta

## 📈 Métricas

O sistema coleta:
- Total de presenças por dia
- Percentual de frequência por turma
- Horários de pico de entrada
- Alunos faltosos frequentes

## 🆘 Suporte

Em caso de problemas:
1. Verifique os logs do servidor
2. Teste com `/api/test-catraca`
3. Verifique se o aluno existe no sistema
4. Confirme o formato dos dados enviados