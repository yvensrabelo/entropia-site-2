# 📝 Como Editar as Notas de Corte

As notas de corte estão armazenadas no arquivo `notas-corte.json` para facilitar a manutenção.

## Estrutura do Arquivo

```json
{
  "PROCESSO": {
    "COTA": {
      "Curso": nota
    }
  }
}
```

## Como Editar

1. Abra o arquivo `notas-corte.json`
2. Encontre o processo seletivo (PSC, MACRO, SIS, ENEM)
3. Localize a cota específica
4. Altere o valor da nota do curso desejado
5. Salve o arquivo

## Exemplo

Para alterar a nota de corte de Medicina no PSC para Ampla Concorrência:

```json
{
  "PSC": {
    "AC": {
      "Medicina": 750,  // ← Altere este valor
      "Direito": 650,
      ...
    }
  }
}
```

## Adicionar Novo Curso

Para adicionar um novo curso, basta incluí-lo em todas as cotas:

```json
{
  "PSC": {
    "AC": {
      "Medicina": 720,
      "Direito": 650,
      "Odontologia": 640,  // ← Novo curso
      ...
    },
    "PP1": {
      "Medicina": 700,
      "Direito": 630,
      "Odontologia": 620,  // ← Adicionar em todas as cotas
      ...
    }
  }
}
```

## Adicionar Nova Cota

Para adicionar uma nova cota:

```json
{
  "PSC": {
    "AC": { ... },
    "NOVA_COTA": {  // ← Nova cota
      "Medicina": 680,
      "Direito": 610,
      "Engenharia": 590,
      ...
    }
  }
}
```

## ⚠️ Importante

- Mantenha a estrutura JSON válida (vírgulas, aspas, etc.)
- Todos os cursos devem ter notas em todas as cotas
- As notas devem ser números inteiros
- Após editar, teste a calculadora para garantir que funciona

## 🔄 Atualizações Frequentes

Recomenda-se atualizar as notas de corte:
- Após cada processo seletivo
- Quando houver mudanças nas políticas de cotas
- Anualmente para refletir as tendências

## 📊 Fonte dos Dados

Sempre use fontes oficiais:
- UFAM: [comvest.ufam.edu.br](https://comvest.ufam.edu.br)
- UEA: [www.uea.edu.br](https://www.uea.edu.br)
- INEP/ENEM: [enem.inep.gov.br](https://enem.inep.gov.br)