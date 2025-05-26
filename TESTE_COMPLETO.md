# 🧪 TESTE COMPLETO DO SISTEMA HIERÁRQUICO DE PROVAS

## ✅ Pré-requisitos Confirmados
- [x] Script SQL executado com sucesso no Supabase
- [x] Colunas `subcategoria` e `area` adicionadas à tabela `provas`
- [x] Constraints de validação criadas
- [x] Índices para performance adicionados

## 🔧 1. TESTE DO FORMULÁRIO DE CRIAÇÃO

### Acesse: `/admin/dashboard/provas/nova`

**Teste 1: PSC com Subcategoria**
1. Selecione Instituição: `UFAM`
2. Selecione Tipo: `PSC`
3. ✅ Deve aparecer dropdown "Subcategoria" com: PSC 1, PSC 2, PSC 3
4. Selecione `PSC 2`
5. Ano: `2024`
6. Título: `PSC 2 2024 - Teste`
7. Faça upload de um PDF
8. ✅ Deve salvar com sucesso

**Teste 2: MACRO DIA 2 HUMANAS**
1. Selecione Instituição: `UEA`
2. Selecione Tipo: `MACRO`
3. ✅ Deve aparecer dropdown "Subcategoria" com: DIA 1, DIA 2
4. Selecione `DIA 2`
5. ✅ Deve aparecer dropdown "Área" com: BIOLÓGICAS, HUMANAS, EXATAS
6. Selecione `HUMANAS`
7. Ano: `2024`
8. Título: `MACRO DIA 2 HUMANAS 2024 - Teste`
9. Faça upload de um PDF
10. ✅ Deve salvar com sucesso

**Teste 3: SIS com Subcategoria**
1. Selecione Tipo: `SIS`
2. ✅ Deve aparecer dropdown com: SIS 1, SIS 2, SIS 3
3. Selecione `SIS 1`
4. Complete e salve

## 🚀 2. TESTE DO UPLOAD EM MASSA

### Acesse: `/admin/dashboard/provas/upload-massa`

**Prepare arquivos de teste com estes nomes:**
- `PSC-2013-Etapa-I-Prova.pdf`
- `PSC-2014-Etapa-II-Gabarito.pdf`
- `SIS-2020-Etapa-1-Prova.pdf`
- `MACRO-2023-DIA-1-Prova.pdf`
- `MACRO-2024-DIA-2-HUMANAS.pdf`

**Processo de Teste:**
1. Arraste os arquivos para a área de upload
2. ✅ Sistema deve detectar automaticamente:
   - PSC-2013-Etapa-I → PSC 1, ano 2013
   - PSC-2014-Etapa-II → PSC 2, ano 2014, gabarito
   - SIS-2020-Etapa-1 → SIS 1, ano 2020
   - MACRO-2023-DIA-1 → MACRO DIA 1, ano 2023
   - MACRO-2024-DIA-2-HUMANAS → MACRO DIA 2 HUMANAS, ano 2024
3. ✅ Deve mostrar preview com metadados detectados
4. Clique no botão "🪄" para auto-detectar se necessário
5. Edite manualmente se algum campo estiver incorreto
6. ✅ Upload deve funcionar sem erros

## 🔍 3. TESTE DOS FILTROS HIERÁRQUICOS

### Acesse: `/banco-de-provas`

**Teste dos Accordions:**
1. ✅ Deve mostrar accordions para: PSC, MACRO, SIS, ENEM, PSI
2. Clique em `PSC`:
   - ✅ Deve expandir mostrando: PSC 1, PSC 2, PSC 3
   - ✅ Contadores devem aparecer
3. Clique em `PSC 2`:
   - ✅ Deve filtrar apenas provas PSC 2
   - ✅ Badge ativo deve aparecer no topo
4. Clique em `MACRO`:
   - ✅ Deve expandir mostrando: DIA 1, DIA 2
5. Clique em `DIA 2`:
   - ✅ Deve expandir mostrando: BIOLÓGICAS, HUMANAS, EXATAS
6. Clique em `HUMANAS`:
   - ✅ Deve filtrar apenas MACRO DIA 2 HUMANAS

**Teste de Limpeza:**
1. ✅ Botão "Limpar filtros" deve aparecer quando há filtros ativos
2. ✅ Deve limpar todos os filtros quando clicado

## 🗑️ 4. TESTE DA EXCLUSÃO EM MASSA

### Acesse: `/admin/dashboard/provas`

**Teste de Seleção:**
1. ✅ Checkbox no header da tabela deve existir
2. ✅ Checkboxes em cada linha devem existir
3. Selecione algumas provas:
   - ✅ Botão "Excluir X selecionadas" deve aparecer
   - ✅ Contador deve estar correto
4. Clique no checkbox do header:
   - ✅ Deve selecionar/desselecionar todas as provas visíveis

**Teste de Exclusão:**
1. Selecione 2-3 provas de teste
2. Clique "Excluir selecionadas"
3. ✅ Modal de confirmação deve aparecer com:
   - Título das provas que serão excluídas
   - Botões "Cancelar" e "Confirmar exclusão"
4. Confirme a exclusão:
   - ✅ Deve mostrar loading
   - ✅ Deve excluir PDFs do storage
   - ✅ Deve excluir registros do banco
   - ✅ Toast de sucesso deve aparecer

## 📊 5. VERIFICAÇÃO FINAL NO BANCO

Execute no Supabase SQL Editor:

```sql
-- Verificar se as provas foram salvas corretamente
SELECT 
  titulo,
  tipo_prova,
  subcategoria,
  area,
  ano,
  created_at
FROM provas 
WHERE titulo LIKE '%Teste%'
ORDER BY created_at DESC;

-- Verificar contadores por tipo e subcategoria
SELECT 
  tipo_prova,
  subcategoria,
  area,
  COUNT(*) as total
FROM provas 
GROUP BY tipo_prova, subcategoria, area
ORDER BY tipo_prova, subcategoria, area;
```

## 🎯 RESULTADOS ESPERADOS

### ✅ Todos os testes devem passar:
1. **Formulário de criação** funciona com campos condicionais
2. **Upload em massa** detecta padrões automaticamente
3. **Filtros hierárquicos** expandem corretamente em accordions
4. **Exclusão em massa** funciona com confirmação e feedback
5. **Dados no banco** estão estruturados corretamente

### ⚠️ Se algum teste falhar:
1. Verifique se o script SQL foi executado completamente
2. Confirme se o bucket 'provas' existe no Supabase Storage
3. Verifique se as variáveis de ambiente do Supabase estão corretas
4. Teste em modo desenvolvimento com console aberto para ver erros

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

**Problema: Upload falha**
- Solução: Verificar se bucket 'provas' existe no Supabase Storage

**Problema: Filtros não funcionam**
- Solução: Verificar se dados de exemplo foram inseridos

**Problema: Campos condicionais não aparecem**
- Solução: Verificar imports de SUBCATEGORIAS e AREAS_MACRO

**Problema: Exclusão em massa falha**
- Solução: Verificar permissões RLS no Supabase

---

## 🎉 SISTEMA COMPLETAMENTE FUNCIONAL!

Se todos os testes passarem, o sistema hierárquico de provas está 100% operacional com:
- ✅ Estrutura de dados robusta
- ✅ Interface intuitiva
- ✅ Detecção automática inteligente
- ✅ Filtros hierárquicos avançados
- ✅ Operações em lote eficientes