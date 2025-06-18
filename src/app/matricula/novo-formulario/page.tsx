'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, User, UserCheck, CreditCard, Calendar, DollarSign, Gift } from 'lucide-react'
import { turmasService } from '@/services/turmasService'

// Tipos
type Etapa = 'dados-aluno' | 'responsavel' | 'pagamento'

interface DadosAluno {
  nomeCompleto: string
  whatsapp: string
  cpf: string
  dataNascimento: string
}

interface DadosResponsavel {
  souResponsavel?: boolean
  nome?: string
  cpf?: string
  whatsapp?: string
}

interface OpcaoPagamento {
  tipo: 'economico' | 'equilibrado' | 'confortavel'
  nome: string
  descricao: string
  parcelas: number
  valorParcela: number
  valorTotal: number
  economia?: number
  icon: any
  cor: string
}

// Imagens dos alunos para cada etapa
const imagensAlunos = [
  "/images/lucca-beulch.png",     // Etapa 1
  "/images/eduarda-braga.png",   // Etapa 2
  "/images/gabriela-parente.png" // Etapa 3
]

// Componente simplificado - apenas imagem
const CardAlunoSimples = ({ imagem, nome }: { imagem: string; nome: string }) => {
  return (
    <div className="md:hidden w-full mb-6">
      <img 
        src={imagem} 
        alt={`Depoimento de ${nome}`}
        className="w-full h-auto rounded-xl shadow-lg"
      />
    </div>
  );
}

// Componente da Etapa 1 - Dados do Aluno
const EtapaDadosAluno = ({ 
  dadosAluno, 
  setDadosAluno, 
  onAvancar,
  mascaraCPF,
  mascaraWhatsApp 
}: {
  dadosAluno: DadosAluno
  setDadosAluno: (dados: DadosAluno) => void
  onAvancar: () => void
  mascaraCPF: (valor: string) => string
  mascaraWhatsApp: (valor: string) => string
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    {/* Card do Lucca no mobile */}
    <CardAlunoSimples imagem={imagensAlunos[0]} nome="Lucca Beulch" />
    
    <div className="text-center mb-8">
      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <User className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">Dados do Aluno</h2>
      <p className="text-white/70">Preencha suas informações pessoais</p>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-white mb-2">Nome Completo *</label>
        <input
          type="text"
          value={dadosAluno.nomeCompleto}
          onChange={(e) => setDadosAluno({...dadosAluno, nomeCompleto: e.target.value})}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Digite seu nome completo"
        />
      </div>

      <div>
        <label className="block text-white mb-2">WhatsApp *</label>
        <input
          type="tel"
          value={dadosAluno.whatsapp}
          onChange={(e) => setDadosAluno({...dadosAluno, whatsapp: mascaraWhatsApp(e.target.value)})}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="(00) 90000-0000"
          maxLength={15}
        />
      </div>

      <div>
        <label className="block text-white mb-2">CPF *</label>
        <input
          type="text"
          value={dadosAluno.cpf}
          onChange={(e) => setDadosAluno({...dadosAluno, cpf: mascaraCPF(e.target.value)})}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="000.000.000-00"
          maxLength={14}
        />
      </div>

      <div>
        <label className="block text-white mb-2">Data de Nascimento *</label>
        <input
          type="date"
          value={dadosAluno.dataNascimento}
          onChange={(e) => setDadosAluno({...dadosAluno, dataNascimento: e.target.value})}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
    </div>

    <button
      onClick={onAvancar}
      className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2"
    >
      Continuar
      <ChevronRight className="w-5 h-5" />
    </button>
  </motion.div>
)

// Componente da Etapa 2 - Responsável
const EtapaResponsavel = ({
  dadosResponsavel,
  setDadosResponsavel,
  maiorIdade,
  onAvancar,
  onVoltar,
  mascaraCPF,
  mascaraWhatsApp
}: {
  dadosResponsavel: DadosResponsavel
  setDadosResponsavel: (dados: DadosResponsavel) => void
  maiorIdade: boolean
  onAvancar: () => void
  onVoltar: () => void
  mascaraCPF: (valor: string) => string
  mascaraWhatsApp: (valor: string) => string
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    {/* Card da Eduarda no mobile */}
    <CardAlunoSimples imagem={imagensAlunos[1]} nome="Eduarda Braga" />
    
    <div className="text-center mb-8">
      <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <UserCheck className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">Responsável Financeiro</h2>
      <p className="text-white/70">
        {maiorIdade ? 'Você pode ser seu próprio responsável' : 'Informe os dados do responsável'}
      </p>
    </div>

    {maiorIdade && (
      <div className="mb-6">
        <label className="flex items-center gap-3 p-4 bg-white/10 rounded-xl cursor-pointer hover:bg-white/20 transition-all">
          <input
            type="checkbox"
            checked={dadosResponsavel.souResponsavel}
            onChange={(e) => setDadosResponsavel({...dadosResponsavel, souResponsavel: e.target.checked})}
            className="w-5 h-5 text-green-500"
          />
          <span className="text-white font-medium">Sou meu próprio responsável financeiro</span>
        </label>
      </div>
    )}

    {(!dadosResponsavel.souResponsavel || !maiorIdade) && (
      <div className="space-y-4">
        <div>
          <label className="block text-white mb-2">Nome do Responsável *</label>
          <input
            type="text"
            value={dadosResponsavel.nome || ''}
            onChange={(e) => setDadosResponsavel({...dadosResponsavel, nome: e.target.value})}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Nome completo do responsável"
          />
        </div>

        <div>
          <label className="block text-white mb-2">CPF do Responsável *</label>
          <input
            type="text"
            value={dadosResponsavel.cpf || ''}
            onChange={(e) => setDadosResponsavel({...dadosResponsavel, cpf: mascaraCPF(e.target.value)})}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="000.000.000-00"
            maxLength={14}
          />
        </div>

        <div>
          <label className="block text-white mb-2">WhatsApp do Responsável *</label>
          <input
            type="tel"
            value={dadosResponsavel.whatsapp || ''}
            onChange={(e) => setDadosResponsavel({...dadosResponsavel, whatsapp: mascaraWhatsApp(e.target.value)})}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="(00) 90000-0000"
            maxLength={15}
          />
        </div>
      </div>
    )}

    <div className="flex gap-4">
      <button
        onClick={onVoltar}
        className="flex-1 bg-white/10 text-white font-bold py-4 rounded-xl hover:bg-white/20 transition-all"
      >
        Voltar
      </button>
      <button
        onClick={onAvancar}
        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
      >
        Continuar
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  </motion.div>
)

// Componente da Etapa 3 - Pagamento
const EtapaPagamento = ({
  opcoesPagamento,
  pagamentoSelecionado,
  setPagamentoSelecionado,
  dataPrimeiroPagamento,
  setDataPrimeiroPagamento,
  enviando,
  onVoltar,
  onFinalizar
}: {
  opcoesPagamento: OpcaoPagamento[]
  pagamentoSelecionado: string
  setPagamentoSelecionado: (tipo: string) => void
  dataPrimeiroPagamento: string
  setDataPrimeiroPagamento: (data: string) => void
  enviando: boolean
  onVoltar: () => void
  onFinalizar: () => void
}) => {
  // Calcular datas mínima (hoje) e máxima (15 dias)
  const hoje = new Date();
  const dataMinima = hoje.toISOString().split('T')[0];
  
  const dataMaxima = new Date();
  dataMaxima.setDate(dataMaxima.getDate() + 15);
  const dataMaximaStr = dataMaxima.toISOString().split('T')[0];

  return (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    {/* Card da Gabriela no mobile */}
    <CardAlunoSimples imagem={imagensAlunos[2]} nome="Gabriela Parente" />
    
    <div className="text-center mb-8">
      <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <CreditCard className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">Forma de Pagamento</h2>
      <p className="text-white/70">Escolha a melhor opção para você</p>
    </div>

    <div className="space-y-4">
      {opcoesPagamento.map((opcao) => {
        const Icon = opcao.icon
        const selecionado = pagamentoSelecionado === opcao.tipo
        
        return (
          <motion.button
            key={opcao.tipo}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPagamentoSelecionado(opcao.tipo)}
            className={`w-full p-6 rounded-2xl border-2 transition-all ${
              selecionado
                ? 'bg-white/20 border-white'
                : 'bg-white/5 border-white/20 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${opcao.cor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              
              <div className="flex-1 text-left">
                <h3 className="text-xl font-bold text-white mb-1">{opcao.nome}</h3>
                <p className="text-white/70 mb-3">{opcao.descricao}</p>
                
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-white">
                      R$ {opcao.valorParcela.toFixed(2)}
                      {opcao.parcelas > 1 && <span className="text-lg font-normal">/mês</span>}
                    </p>
                    <p className="text-sm text-white/50">
                      Total: R$ {opcao.valorTotal.toFixed(2)}
                    </p>
                  </div>
                  
                  {opcao.economia && (
                    <div className="bg-green-500/20 px-3 py-1 rounded-full">
                      <p className="text-green-300 text-sm font-bold">
                        Economia de R$ {opcao.economia.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {selecionado && (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </motion.button>
        )
      })}
    </div>

    {/* Campo de Data do Primeiro Pagamento */}
    {pagamentoSelecionado && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 p-4 bg-white/10 rounded-xl border border-white/20"
      >
        <label className="block text-white mb-3 font-medium">
          Data do Primeiro Pagamento
        </label>
        <input
          type="date"
          value={dataPrimeiroPagamento}
          onChange={(e) => setDataPrimeiroPagamento(e.target.value)}
          min={dataMinima}
          max={dataMaximaStr}
          required
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 [color-scheme:dark]"
        />
      </motion.div>
    )}

    <div className="flex gap-4">
      <button
        onClick={onVoltar}
        className="flex-1 bg-white/10 text-white font-bold py-4 rounded-xl hover:bg-white/20 transition-all"
      >
        Voltar
      </button>
      <button
        onClick={onFinalizar}
        disabled={!pagamentoSelecionado || !dataPrimeiroPagamento || enviando}
        className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {enviando ? 'Enviando...' : 'Finalizar Matrícula'}
      </button>
    </div>
  </motion.div>
  );
}

function FormularioMatriculaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Estados
  const [etapaAtual, setEtapaAtual] = useState<Etapa>('dados-aluno')
  const [dadosAluno, setDadosAluno] = useState<DadosAluno>({
    nomeCompleto: '',
    whatsapp: '',
    cpf: '',
    dataNascimento: ''
  })
  const [dadosResponsavel, setDadosResponsavel] = useState<DadosResponsavel>({})
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<string>('')
  const [dataPrimeiroPagamento, setDataPrimeiroPagamento] = useState<string>('')
  const [turmaInfo, setTurmaInfo] = useState<any>(null)
  const [maiorIdade, setMaiorIdade] = useState(false)
  const [enviando, setEnviando] = useState(false)

  // Buscar informações da turma
  useEffect(() => {
    const carregarTurma = async () => {
      const turmaId = searchParams?.get('turma_id')
      if (turmaId) {
        try {
          const turma = await turmasService.obterTurma(turmaId)
          setTurmaInfo(turma)
        } catch (error) {
          console.error('Erro ao carregar turma:', error)
        }
      }
    }
    carregarTurma()
  }, [searchParams])

  // Verificar maioridade
  useEffect(() => {
    if (dadosAluno.dataNascimento) {
      const nascimento = new Date(dadosAluno.dataNascimento)
      const hoje = new Date()
      const idade = hoje.getFullYear() - nascimento.getFullYear()
      const mesAniversario = nascimento.getMonth()
      const diaAniversario = nascimento.getDate()
      
      if (hoje.getMonth() < mesAniversario || 
          (hoje.getMonth() === mesAniversario && hoje.getDate() < diaAniversario)) {
        setMaiorIdade(idade - 1 >= 18)
      } else {
        setMaiorIdade(idade >= 18)
      }
    }
  }, [dadosAluno.dataNascimento])

  // Validações
  const validarCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/\D/g, '')
    if (cpf.length !== 11) return false
    
    // Validação básica de CPF
    let soma = 0
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpf.charAt(9))) return false
    
    soma = 0
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i)
    }
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpf.charAt(10))) return false
    
    return true
  }

  const validarWhatsApp = (tel: string): boolean => {
    const numeros = tel.replace(/\D/g, '')
    return numeros.length === 11 && numeros[2] === '9'
  }

  // Máscaras com useCallback para evitar re-renderização
  const mascaraCPF = useCallback((valor: string) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }, [])

  const mascaraWhatsApp = useCallback((valor: string) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }, [])

  // Calcular opções de pagamento
  const calcularOpcoesPagamento = (): OpcaoPagamento[] => {
    if (!turmaInfo) return []
    
    const valorTotal = (turmaInfo.precoMensal || 150) * (turmaInfo.duracaoMeses || 12)
    const mesesRestantes = turmaInfo.duracaoMeses || 12 // Aqui você pode calcular meses restantes reais
    
    return [
      {
        tipo: 'economico',
        nome: 'Econômico',
        descricao: 'À vista com 10% de desconto',
        parcelas: 1,
        valorParcela: valorTotal * 0.9,
        valorTotal: valorTotal * 0.9,
        economia: valorTotal * 0.1,
        icon: Gift,
        cor: 'from-green-500 to-emerald-600'
      },
      {
        tipo: 'equilibrado',
        nome: 'Equilibrado',
        descricao: `${mesesRestantes}x de R$ ${(valorTotal / mesesRestantes).toFixed(2)}`,
        parcelas: mesesRestantes,
        valorParcela: valorTotal / mesesRestantes,
        valorTotal: valorTotal,
        icon: Calendar,
        cor: 'from-blue-500 to-indigo-600'
      },
      {
        tipo: 'confortavel',
        nome: 'Mais Confortável',
        descricao: `${mesesRestantes + 2}x de R$ ${(valorTotal / (mesesRestantes + 2)).toFixed(2)}`,
        parcelas: mesesRestantes + 2,
        valorParcela: valorTotal / (mesesRestantes + 2),
        valorTotal: valorTotal,
        icon: DollarSign,
        cor: 'from-purple-500 to-pink-600'
      }
    ]
  }

  // Navegação com useCallback
  const avancarEtapa = useCallback(() => {
    if (etapaAtual === 'dados-aluno') {
      // Validar dados do aluno
      if (!dadosAluno.nomeCompleto || !validarCPF(dadosAluno.cpf) || 
          !validarWhatsApp(dadosAluno.whatsapp) || !dadosAluno.dataNascimento) {
        alert('Por favor, preencha todos os campos corretamente')
        return
      }
      setEtapaAtual('responsavel')
    } else if (etapaAtual === 'responsavel') {
      // Validar dados do responsável
      if (!maiorIdade || !dadosResponsavel.souResponsavel) {
        if (!dadosResponsavel.nome || 
            !validarCPF(dadosResponsavel.cpf || '') || 
            !validarWhatsApp(dadosResponsavel.whatsapp || '')) {
          alert('Por favor, preencha os dados do responsável')
          return
        }
      }
      setEtapaAtual('pagamento')
    }
  }, [etapaAtual, dadosAluno, dadosResponsavel, maiorIdade])

  const voltarEtapa = useCallback(() => {
    if (etapaAtual === 'responsavel') setEtapaAtual('dados-aluno')
    else if (etapaAtual === 'pagamento') setEtapaAtual('responsavel')
  }, [etapaAtual])

  // Calcular opções de pagamento memoizado
  const opcoesPagamento = calcularOpcoesPagamento()

  // Enviar formulário com useCallback
  const enviarFormulario = useCallback(async () => {
    if (!pagamentoSelecionado) {
      alert('Selecione uma forma de pagamento')
      return
    }

    if (!dataPrimeiroPagamento) {
      alert('Selecione a data do primeiro pagamento')
      return
    }

    setEnviando(true)
    
    try {
      // Calcular informações de pagamento
      const opcaoSelecionada = opcoesPagamento.find(opcao => opcao.tipo === pagamentoSelecionado)
      const infoPagamento = {
        plano: pagamentoSelecionado,
        numeroParcelas: opcaoSelecionada?.parcelas || 1,
        valorParcela: opcaoSelecionada?.valorParcela || 0,
        valorTotal: opcaoSelecionada?.valorTotal || 0,
        dataPrimeiroPagamento: dataPrimeiroPagamento
      }

      // Reformatar os dados para o formato esperado pelo webhook
      const dadosWebhook = {
        // Dados do aluno
        nome_aluno: dadosAluno.nomeCompleto,
        whatsapp_aluno: dadosAluno.whatsapp.replace(/\D/g, ''), // Remove formatação
        cpf_aluno: dadosAluno.cpf.replace(/\D/g, ''), // Remove formatação
        data_nascimento_aluno: dadosAluno.dataNascimento,
        
        // Dados do responsável
        nome_responsavel: dadosResponsavel.souResponsavel ? dadosAluno.nomeCompleto : (dadosResponsavel.nome || ''),
        whatsapp_responsavel: dadosResponsavel.souResponsavel ? dadosAluno.whatsapp.replace(/\D/g, '') : (dadosResponsavel.whatsapp?.replace(/\D/g, '') || ''),
        cpf_responsavel: dadosResponsavel.souResponsavel ? dadosAluno.cpf.replace(/\D/g, '') : (dadosResponsavel.cpf?.replace(/\D/g, '') || ''),
        
        // Dados da turma
        turma_id: turmaInfo?.id || '',
        turma_nome: turmaInfo?.nome || '',
        turma_foco: turmaInfo?.foco || '',
        turma_turnos: turmaInfo?.turnos?.join(', ') || '',
        turma_preco: turmaInfo?.precoMensal || 0,
        turma_duracao: turmaInfo?.duracaoMeses || 12,
        
        // Pagamento
        plano_pagamento: pagamentoSelecionado,
        numero_parcelas: infoPagamento.numeroParcelas,
        valor_parcela: infoPagamento.valorParcela.toFixed(2),
        valor_total: infoPagamento.valorTotal.toFixed(2),
        data_primeiro_pagamento: dataPrimeiroPagamento,
        
        // Metadata
        timestamp: new Date().toISOString(),
        origem: 'site_entropia'
      }

      console.log('=== DADOS FORMATADOS PARA WEBHOOK ===');
      console.log(JSON.stringify(dadosWebhook, null, 2));
      
      const response = await fetch('https://webhook.cursoentropia.com/webhook/siteentropiaoficial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(dadosWebhook),
      });

      const responseText = await response.text();
      console.log('Resposta:', response.status, responseText);
      
      if (!response.ok) {
        // Tentar envio alternativo com estrutura simplificada
        console.log('Tentando formato alternativo...');
        
        const dadosSimplificados = {
          aluno: dadosAluno.nomeCompleto,
          whatsapp: dadosAluno.whatsapp,
          cpf: dadosAluno.cpf,
          turma: turmaInfo?.nome || '',
          pagamento: pagamentoSelecionado,
          timestamp: new Date().toISOString()
        };
        
        const retryResponse = await fetch('https://webhook.cursoentropia.com/webhook/siteentropiaoficial', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dadosSimplificados),
        });
        
        if (!retryResponse.ok) {
          throw new Error(`Webhook falhou: ${responseText}`);
        }
      }
      
      console.log('✅ Formulário enviado com sucesso!');
      router.push('/matricula/sucesso')
    } catch (error) {
      console.error('=== ERRO DETALHADO ===');
      console.error('Tipo:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Mensagem:', error instanceof Error ? error.message : String(error));
      console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
      
      const mensagemErro = error instanceof Error && error.message.includes('500') 
        ? 'Erro no servidor. Por favor, tente novamente em alguns minutos.'
        : 'Erro ao enviar formulário. Verifique os dados e tente novamente.';
      
      alert(mensagemErro);
    } finally {
      setEnviando(false)
    }
  }, [pagamentoSelecionado, dataPrimeiroPagamento, dadosAluno, dadosResponsavel, turmaInfo, opcoesPagamento, router])

  // Indicador de progresso
  const ProgressBar = () => {
    const etapas = [
      { id: 'dados-aluno', nome: 'Dados Pessoais', icon: User },
      { id: 'responsavel', nome: 'Responsável', icon: UserCheck },
      { id: 'pagamento', nome: 'Pagamento', icon: CreditCard }
    ]
    
    const etapaIndex = etapas.findIndex(e => e.id === etapaAtual)
    
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between">
          {etapas.map((etapa, index) => {
            const Icon = etapa.icon
            const ativo = index === etapaIndex
            const completo = index < etapaIndex
            
            return (
              <div key={etapa.id} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all
                    ${ativo ? 'bg-white text-green-700 scale-110' : 
                      completo ? 'bg-green-500 text-white' : 
                      'bg-white/20 text-white/50'}
                  `}>
                    {completo ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                  </div>
                  <p className={`mt-2 text-sm font-medium ${ativo ? 'text-white' : 'text-white/50'}`}>
                    {etapa.nome}
                  </p>
                </div>
                
                {index < etapas.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded-full transition-all ${
                    completo ? 'bg-green-500' : 'bg-white/20'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-800 to-green-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl"
        >
          <ProgressBar />
          
          <AnimatePresence mode="wait">
            {etapaAtual === 'dados-aluno' && (
              <EtapaDadosAluno 
                key="aluno"
                dadosAluno={dadosAluno}
                setDadosAluno={setDadosAluno}
                onAvancar={avancarEtapa}
                mascaraCPF={mascaraCPF}
                mascaraWhatsApp={mascaraWhatsApp}
              />
            )}
            {etapaAtual === 'responsavel' && (
              <EtapaResponsavel 
                key="responsavel"
                dadosResponsavel={dadosResponsavel}
                setDadosResponsavel={setDadosResponsavel}
                maiorIdade={maiorIdade}
                onAvancar={avancarEtapa}
                onVoltar={voltarEtapa}
                mascaraCPF={mascaraCPF}
                mascaraWhatsApp={mascaraWhatsApp}
              />
            )}
            {etapaAtual === 'pagamento' && (
              <EtapaPagamento 
                key="pagamento"
                opcoesPagamento={opcoesPagamento}
                pagamentoSelecionado={pagamentoSelecionado}
                setPagamentoSelecionado={setPagamentoSelecionado}
                dataPrimeiroPagamento={dataPrimeiroPagamento}
                setDataPrimeiroPagamento={setDataPrimeiroPagamento}
                enviando={enviando}
                onVoltar={voltarEtapa}
                onFinalizar={enviarFormulario}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default function FormularioMatricula() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-800 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Carregando formulário...</p>
        </div>
      </div>
    }>
      <FormularioMatriculaContent />
    </Suspense>
  )
}