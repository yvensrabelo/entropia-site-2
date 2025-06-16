# Sistema Robusto de Descrição de Turmas

Este documento explica como utilizar o novo sistema robusto de descrição de turmas implementado no Entropia.

## Visão Geral

O sistema foi atualizado para incluir campos opcionais mais detalhados e flexíveis, mantendo total compatibilidade com o sistema anterior. Todos os novos campos são opcionais e utilizam estruturas JSONB no banco de dados.

## Estrutura dos Tipos

### TurmaDescricoes
```typescript
interface TurmaDescricoes {
  card?: string;      // Descrição breve para cards (até 160 caracteres)
  resumo?: string;    // Resumo médio (até 300 caracteres)
  completa?: string;  // Descrição completa sem limite
  slogan?: string;    // Frase de impacto ou chamada
}
```

### TurmaBeneficios
```typescript
interface TurmaBeneficios {
  principais?: string[];   // Lista de benefícios principais
  secundarios?: string[];  // Benefícios adicionais
  icones?: Array<{        // Benefícios com ícones
    icone: string;
    texto: string;
    destaque?: boolean;
  }>;
}
```

### TurmaDetalhes
```typescript
interface TurmaDetalhes {
  carga_horaria?: string;
  modalidade?: 'presencial' | 'online' | 'hibrido';
  nivel?: 'iniciante' | 'intermediario' | 'avancado';
  prerequisitos?: string[];
  publico_alvo?: string;
  metodologia?: string;
  material_incluso?: string[];
  certificacao?: boolean;
}
```

### TurmaInformacoes
```typescript
interface TurmaInformacoes {
  proxima_turma?: Date;
  inscricoes_abertas?: boolean;
  desconto_ativo?: {
    percentual: number;
    valido_ate: Date;
    codigo?: string;
  };
  bonus?: string[];
  depoimentos?: Array<{
    nome: string;
    texto: string;
    nota?: number;
    data?: Date;
  }>;
}
```

### TurmaSEO
```typescript
interface TurmaSEO {
  meta_description?: string;
  keywords?: string[];
  og_image?: string;
  schema_type?: 'Course' | 'EducationalProgram';
  landing_page?: string;
}
```

### TurmaVisibilidade
```typescript
interface TurmaVisibilidade {
  exibir_home?: boolean;
  exibir_catalogo?: boolean;
  destacar?: boolean;
  ordem_destaque?: number;
  data_inicio_exibicao?: Date;
  data_fim_exibicao?: Date;
}
```

## Como Usar

### 1. Importar os Tipos
```typescript
import { 
  Turma, 
  TurmaDescricoes, 
  TurmaBeneficios 
} from '@/lib/types/turma';
```

### 2. Usar as Funções Helper
```typescript
import { 
  getTurmaDescricao,
  getTurmaBeneficios,
  isTurmaVisivel,
  formatTurmaParaCard
} from '@/lib/utils/turma-helpers';

// Obter descrição apropriada para o contexto
const descricaoCard = getTurmaDescricao(turma, 'card');
const descricaoCompleta = getTurmaDescricao(turma, 'completa');

// Obter todos os benefícios
const beneficios = getTurmaBeneficios(turma);

// Verificar visibilidade
const visivel = isTurmaVisivel(turma, 'home');

// Formatar para card (compatibilidade)
const cardData = formatTurmaParaCard(turma);
```

### 3. Exemplo de Criação de Turma
```typescript
const novaTurma: Partial<Turma> = {
  nome: 'PSC Intensivo 2025',
  descricao: 'Preparação completa para PSC', // Mantido para compatibilidade
  tipo: 'intensivo_psc',
  
  // Novo sistema robusto
  descricoes: {
    card: 'Preparação completa para o PSC UFAM com aprovação garantida',
    resumo: 'Curso intensivo focado na aprovação do PSC UFAM com material exclusivo, simulados semanais e acompanhamento individual.',
    completa: 'Preparação completa e especializada para o Processo Seletivo Contínuo da UFAM...',
    slogan: 'Sua aprovação na UFAM começa aqui'
  },
  
  beneficios: {
    principais: [
      'Material exclusivo PSC',
      'Simulados semanais',
      'Monitoria diária'
    ],
    icones: [
      { icone: 'BookOpen', texto: 'Material Completo', destaque: true },
      { icone: 'Clock', texto: '850h de Conteúdo' },
      { icone: 'Users', texto: 'Turmas Pequenas' }
    ]
  },
  
  detalhes: {
    carga_horaria: '850 horas',
    modalidade: 'presencial',
    nivel: 'intermediario',
    metodologia: 'Aulas expositivas + Resolução de exercícios',
    certificacao: true
  },
  
  visibilidade: {
    exibir_home: true,
    destacar: true,
    ordem_destaque: 1
  },
  
  seo: {
    meta_description: 'Prepare-se para o PSC UFAM com o melhor curso preparatório de Manaus',
    keywords: ['PSC', 'UFAM', 'vestibular', 'Manaus'],
    schema_type: 'Course'
  }
};
```

## Migração do Banco de Dados

Execute a migração para adicionar os novos campos:
```sql
-- Execute o arquivo:
-- src/lib/migrations/add-robust-turma-fields.sql
```

## Compatibilidade

- ✅ **100% compatível com código existente**
- ✅ **Todos os campos são opcionais**
- ✅ **Fallback automático para sistema antigo**
- ✅ **Migração automática de dados existentes**

## Benefícios

1. **Flexibilidade**: Diferentes descrições para diferentes contextos
2. **SEO**: Campos específicos para otimização
3. **Controle**: Visibilidade granular e programação de exibição
4. **Experiência**: Benefícios com ícones e destaques
5. **Marketing**: Descontos, bônus e depoimentos estruturados
6. **Escalabilidade**: Estrutura JSONB permite expansão futura

## Validação

Use a função `validarDadosTurma()` para garantir a integridade dos dados:
```typescript
import { validarDadosTurma } from '@/lib/utils/turma-helpers';

const erros = validarDadosTurma(turmaData);
if (erros.length > 0) {
  console.error('Erros de validação:', erros);
}
```