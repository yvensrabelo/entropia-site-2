'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, User, UserCheck, CreditCard, Calendar, DollarSign, Gift } from 'lucide-react'
import { turmasService } from '@/services/turmasService'

// Componente de Data Fluido Melhorado
const CampoDataFluido = ({ 
  label, 
  value, 
  onChange, 
  error
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
}) => {
  const [displayValue, setDisplayValue] = useState('')
  
  // Converter YYYY-MM-DD para DD/MM/YYYY para exibição
  useEffect(() => {
    if (value && value.includes('-')) {
      const [ano, mes, dia] = value.split('-')
      if (ano && mes && dia) {
        setDisplayValue(`${dia}/${mes}/${ano}`)
      }
    } else if (!value) {
      setDisplayValue('')
    }
  }, [value])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value
    
    // Remove tudo que não é número
    const numbers = input.replace(/\D/g, '')
    
    // Limita a 8 dígitos (DDMMYYYY)
    const limitedNumbers = numbers.slice(0, 8)
    
    // Aplica máscara conforme digita
    let formatted = ''
    if (limitedNumbers.length > 0) {
      formatted = limitedNumbers
      
      if (limitedNumbers.length > 2) {
        formatted = `${limitedNumbers.slice(0, 2)}/${limitedNumbers.slice(2)}`
      }
      if (limitedNumbers.length > 4) {
        formatted = `${limitedNumbers.slice(0, 2)}/${limitedNumbers.slice(2, 4)}/${limitedNumbers.slice(4)}`
      }
    }
    
    setDisplayValue(formatted)
    console.log('Data digitada:', formatted, 'números:', limitedNumbers)
    
    // Se tiver 8 dígitos, valida e converte para YYYY-MM-DD
    if (limitedNumbers.length === 8) {
      const dia = limitedNumbers.slice(0, 2)
      const mes = limitedNumbers.slice(2, 4)
      const ano = limitedNumbers.slice(4, 8)
      
      // Validação básica
      const diaNum = parseInt(dia)
      const mesNum = parseInt(mes)
      const anoNum = parseInt(ano)
      
      if (diaNum >= 1 && diaNum <= 31 && mesNum >= 1 && mesNum <= 12 && anoNum >= 1900 && anoNum <= new Date().getFullYear()) {
        // Formato YYYY-MM-DD para salvar
        const dataFormatada = `${ano}-${mes}-${dia}`
        
        // Verifica se é uma data válida
        const dataObj = new Date(dataFormatada)
        if (!isNaN(dataObj.getTime())) {
          onChange(dataFormatada)
          console.log('✅ Data válida salva:', dataFormatada)
        } else {
          console.log('❌ Data inválida:', dataFormatada)
        }
      } else {
        console.log('❌ Números fora do intervalo válido')
      }
    } else if (limitedNumbers.length === 0) {
      // Limpa o valor se campo estiver vazio
      onChange('')
    }
    // Não limpar enquanto usuário está digitando (menos de 8 dígitos)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permite apenas números, backspace, delete, tab, setas
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
    
    if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
      e.preventDefault()
    }
  }
  
  return (
    <div>
      <label className="block text-white mb-2">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="DD/MM/AAAA"
          maxLength={10}
          className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 ${error ? 'border-red-400' : ''}`}
          inputMode="numeric"
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
      <p className="text-xs text-white/60 mt-1">Digite apenas números: dia, mês e ano</p>
    </div>
  )
}

// Tipos
type Etapa = 'pagamento' | 'dados-aluno' | 'responsavel'

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
  tipo: 'economico' | 'equilibrado' | 'confortavel' | 'unico'
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

      <CampoDataFluido
        label="Data de Nascimento *"
        value={dadosAluno.dataNascimento}
        onChange={(value) => {
          console.log('Data fluida alterada:', value)
          setDadosAluno({...dadosAluno, dataNascimento: value})
        }}
      />
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
  mascaraWhatsApp,
  enviando = false
}: {
  dadosResponsavel: DadosResponsavel
  setDadosResponsavel: (dados: DadosResponsavel) => void
  maiorIdade: boolean
  onAvancar: () => void
  onVoltar: () => void
  mascaraCPF: (valor: string) => string
  mascaraWhatsApp: (valor: string) => string
  enviando?: boolean
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
        disabled={enviando}
        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {enviando ? 'Enviando...' : 'Finalizar Matrícula'}
        {!enviando && <ChevronRight className="w-5 h-5" />}
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
  parcelasSelecionadas,
  setParcelasSelecionadas,
  enviando,
  onVoltar,
  onFinalizar
}: {
  opcoesPagamento: OpcaoPagamento[]
  pagamentoSelecionado: string
  setPagamentoSelecionado: (tipo: string) => void
  dataPrimeiroPagamento: string
  setDataPrimeiroPagamento: (data: string) => void
  parcelasSelecionadas: number
  setParcelasSelecionadas: (parcelas: number) => void
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
      <p className="text-white/70">R$ 3.000 com material incluso</p>
    </div>

    {/* Valor Total */}
    <div className="bg-white/10 rounded-2xl p-6 border border-white/20 mb-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Curso Completo</h3>
        <p className="text-white/70 mb-4">Material didático incluso</p>
        
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-4">
          <p className="text-3xl font-bold text-white">R$ 3.000,00</p>
          <p className="text-white/80">Parcelável em até 6x no boleto ou cartão</p>
        </div>
      </div>
    </div>

    {/* Seletor de Parcelas */}
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white text-center">Escolha a forma de pagamento:</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((parcelas) => {
          const valorParcela = parcelas === 1 ? 2700 : 3000 / parcelas // 10% desconto à vista
          const selecionado = parcelasSelecionadas === parcelas
          
          return (
            <motion.button
              key={parcelas}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setParcelasSelecionadas(parcelas)
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                selecionado
                  ? 'bg-white/20 border-white text-white'
                  : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
              }`}
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {parcelas === 1 && <Gift className="w-5 h-5 mr-1 text-white" />}
                  {parcelas > 1 && <CreditCard className="w-5 h-5 mr-1 text-white" />}
                  <span className="font-bold text-white">{parcelas}x</span>
                </div>
                
                <p className="text-lg font-bold text-white">
                  R$ {valorParcela.toFixed(2)}
                </p>
                
                <p className="text-xs text-white font-medium">
                  Boleto ou Cartão
                </p>
                
                {parcelas === 1 && (
                  <div className="bg-green-500/20 px-2 py-1 rounded mt-2">
                    <p className="text-green-300 text-xs font-bold">
                      Economia R$ 300
                    </p>
                  </div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
      
      {/* Resumo do pagamento selecionado */}
      {parcelasSelecionadas && parcelasSelecionadas > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 rounded-xl p-4 border border-white/20"
        >
          <div className="text-center">
            <h4 className="text-white font-bold mb-2">Resumo do Pagamento</h4>
            <div className="space-y-1">
              <p className="text-white">
                <span className="font-bold">{parcelasSelecionadas}x</span> de 
                <span className="font-bold text-green-300 ml-1">
                  R$ {(parcelasSelecionadas === 1 ? 2700 : 3000 / parcelasSelecionadas).toFixed(2)}
                </span>
              </p>
              <p className="text-white/70 text-sm">
                Total: R$ {(parcelasSelecionadas === 1 ? 2700 : 3000).toFixed(2)}
                {parcelasSelecionadas === 1 && (
                  <span className="text-green-300 ml-2">(10% desconto)</span>
                )}
              </p>
              <p className="text-white/70 text-sm font-medium">
                Boleto ou Cartão de Crédito
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>

    {/* Campo de Data do Primeiro Pagamento */}
    {parcelasSelecionadas && parcelasSelecionadas > 0 && (
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
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:filter-invert [&::-webkit-calendar-picker-indicator]:opacity-80"
        />
        <p className="text-xs text-white/60 mt-2">Selecione uma data até 15 dias a partir de hoje</p>
      </motion.div>
    )}

    <div className="flex gap-4">
      <button
        onClick={onFinalizar}
        disabled={!parcelasSelecionadas || parcelasSelecionadas <= 0 || !dataPrimeiroPagamento || enviando}
        className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {enviando ? 'Enviando...' : 'Próximo'}
      </button>
    </div>
  </motion.div>
  );
}

function FormularioMatriculaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Estados
  const [etapaAtual, setEtapaAtual] = useState<Etapa>('pagamento')
  const [dadosAluno, setDadosAluno] = useState<DadosAluno>({
    nomeCompleto: '',
    whatsapp: '',
    cpf: '',
    dataNascimento: ''
  })
  const [dadosResponsavel, setDadosResponsavel] = useState<DadosResponsavel>({})
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<string>('')
  const [dataPrimeiroPagamento, setDataPrimeiroPagamento] = useState<string>('')
  const [parcelasSelecionadas, setParcelasSelecionadas] = useState<number>(0)
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

  // Debug: monitorar mudanças no formulário
  useEffect(() => {
    console.log('=== ESTADO DO FORMULÁRIO ATUALIZADO ===')
    console.log('Dados do Aluno:', dadosAluno)
    console.log('Etapa Atual:', etapaAtual)
  }, [dadosAluno, etapaAtual])

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
    
    // Verificar se todos os dígitos são iguais (CPF inválido)
    if (/^(\d)\1{10}$/.test(cpf)) return false
    
    // Validação dos dígitos verificadores
    let soma = 0
    let resto
    
    // Valida primeiro dígito
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i)
    }
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpf.substring(9, 10))) return false
    
    // Valida segundo dígito  
    soma = 0
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i)
    }
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpf.substring(10, 11))) return false
    
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

  // Calcular opções de pagamento (novo sistema com valor fixo)
  const calcularOpcoesPagamento = (): OpcaoPagamento[] => {
    const valorBase = 3000 // Valor fixo R$3000
    const valorComDesconto = valorBase * 0.9 // 10% desconto à vista
    
    // Proteção contra divisão por zero
    if (!parcelasSelecionadas || parcelasSelecionadas <= 0) {
      return [{
        tipo: 'unico',
        nome: 'Selecione uma opção',
        descricao: 'Escolha o número de parcelas',
        parcelas: 0,
        valorParcela: 0,
        valorTotal: 0,
        economia: undefined,
        icon: CreditCard,
        cor: 'from-gray-400 to-gray-500'
      }]
    }
    
    const valorParcela = valorBase / parcelasSelecionadas
    
    return [
      {
        tipo: 'unico', // Mantém tipo único para compatibilidade
        nome: 'Curso Completo',
        descricao: `Material incluso - ${parcelasSelecionadas}x no ${parcelasSelecionadas === 1 ? 'boleto ou cartão' : 'cartão'}`,
        parcelas: parcelasSelecionadas,
        valorParcela: parcelasSelecionadas === 1 ? valorComDesconto : valorParcela,
        valorTotal: parcelasSelecionadas === 1 ? valorComDesconto : valorBase,
        economia: parcelasSelecionadas === 1 ? 300 : undefined, // R$300 de desconto
        icon: parcelasSelecionadas === 1 ? Gift : CreditCard,
        cor: parcelasSelecionadas === 1 ? 'from-green-500 to-emerald-600' : 'from-blue-500 to-indigo-600'
      }
    ]
  }

  // Navegação com useCallback - NOVA ORDEM: pagamento -> dados-aluno -> responsavel
  const avancarEtapa = useCallback(() => {
    if (etapaAtual === 'pagamento') {
      // Validar seleção de pagamento
      if (!parcelasSelecionadas || parcelasSelecionadas <= 0) {
        alert('Por favor, selecione uma forma de pagamento')
        return
      }
      if (!dataPrimeiroPagamento) {
        alert('Por favor, selecione a data do primeiro pagamento')
        return
      }
      setEtapaAtual('dados-aluno')
    } else if (etapaAtual === 'dados-aluno') {
      // Debug - mostrar estado atual
      console.log('=== VALIDAÇÃO DADOS DO ALUNO ===')
      console.log('Nome completo:', `"${dadosAluno.nomeCompleto}"`, '→ Válido:', dadosAluno.nomeCompleto && dadosAluno.nomeCompleto.trim().length >= 3)
      console.log('CPF:', `"${dadosAluno.cpf}"`, '→ Válido:', validarCPF(dadosAluno.cpf))
      console.log('WhatsApp:', `"${dadosAluno.whatsapp}"`, '→ Válido:', validarWhatsApp(dadosAluno.whatsapp))
      console.log('Data Nascimento:', `"${dadosAluno.dataNascimento}"`, '→ Válido:', !!dadosAluno.dataNascimento)
      console.log('Dados completos:', dadosAluno)
      
      // Validar dados do aluno com mensagens específicas
      const erros: string[] = []
      
      if (!dadosAluno.nomeCompleto || dadosAluno.nomeCompleto.trim().length < 3) {
        erros.push('Nome deve ter pelo menos 3 caracteres')
      }
      
      if (!validarCPF(dadosAluno.cpf)) {
        erros.push('CPF inválido')
      }
      
      if (!validarWhatsApp(dadosAluno.whatsapp)) {
        erros.push('WhatsApp deve ter 11 dígitos (com DDD)')
      }
      
      if (!dadosAluno.dataNascimento) {
        erros.push('Data de nascimento é obrigatória')
      }
      
      if (erros.length > 0) {
        alert('Por favor, corrija:\n' + erros.join('\n'))
        return
      }
      
      setEtapaAtual('responsavel')
    }
  }, [etapaAtual, dadosAluno, dadosResponsavel, maiorIdade, parcelasSelecionadas, dataPrimeiroPagamento])

  const voltarEtapa = useCallback(() => {
    if (etapaAtual === 'dados-aluno') setEtapaAtual('pagamento')
    else if (etapaAtual === 'responsavel') setEtapaAtual('dados-aluno')
  }, [etapaAtual])

  // Calcular opções de pagamento memoizado
  const opcoesPagamento = calcularOpcoesPagamento()

  // Enviar formulário com useCallback
  const enviarFormulario = useCallback(async () => {
    if (!parcelasSelecionadas || parcelasSelecionadas <= 0) {
      alert('Selecione uma forma de pagamento')
      return
    }

    if (!dataPrimeiroPagamento) {
      alert('Selecione a data do primeiro pagamento')
      return
    }

    // Validar dados do responsável (se necessário)
    if (!maiorIdade || !dadosResponsavel.souResponsavel) {
      const errosResponsavel: string[] = []
      
      if (!dadosResponsavel.nome || dadosResponsavel.nome.trim().length < 3) {
        errosResponsavel.push('Nome do responsável deve ter pelo menos 3 caracteres')
      }
      
      if (!validarCPF(dadosResponsavel.cpf || '')) {
        errosResponsavel.push('CPF do responsável inválido')
      }
      
      if (!validarWhatsApp(dadosResponsavel.whatsapp || '')) {
        errosResponsavel.push('WhatsApp do responsável deve ter 11 dígitos (com DDD)')
      }
      
      if (errosResponsavel.length > 0) {
        alert('Por favor, corrija:\n' + errosResponsavel.join('\n'))
        return
      }
    }

    setEnviando(true)
    
    try {
      // Calcular informações de pagamento diretamente das parcelas selecionadas
      const valorBase = 3000
      const valorComDesconto = valorBase * 0.9 // 10% desconto à vista
      const valorParcela = parcelasSelecionadas === 1 ? valorComDesconto : valorBase / parcelasSelecionadas
      const valorTotal = parcelasSelecionadas === 1 ? valorComDesconto : valorBase
      
      const infoPagamento = {
        plano: 'curso_completo',
        numeroParcelas: parcelasSelecionadas,
        valorParcela: valorParcela,
        valorTotal: valorTotal,
        dataPrimeiroPagamento: dataPrimeiroPagamento
      }

      // Reformatar os dados para o formato esperado pelo webhook
      const dadosWebhook = {
        // Dados do aluno
        nome_aluno: dadosAluno.nomeCompleto || '',
        whatsapp_aluno: (dadosAluno.whatsapp || '').replace(/\D/g, ''), // Remove formatação
        cpf_aluno: (dadosAluno.cpf || '').replace(/\D/g, ''), // Remove formatação
        data_nascimento_aluno: dadosAluno.dataNascimento || '',
        
        // Dados do responsável
        nome_responsavel: dadosResponsavel.souResponsavel ? (dadosAluno.nomeCompleto || '') : (dadosResponsavel.nome || ''),
        whatsapp_responsavel: dadosResponsavel.souResponsavel ? ((dadosAluno.whatsapp || '').replace(/\D/g, '')) : ((dadosResponsavel.whatsapp || '').replace(/\D/g, '')),
        cpf_responsavel: dadosResponsavel.souResponsavel ? ((dadosAluno.cpf || '').replace(/\D/g, '')) : ((dadosResponsavel.cpf || '').replace(/\D/g, '')),
        
        // Dados da turma
        turma_id: turmaInfo?.id || '',
        turma_nome: turmaInfo?.nome || '',
        turma_foco: turmaInfo?.foco || '',
        turma_turnos: turmaInfo?.turnos?.join(', ') || '',
        turma_preco: turmaInfo?.precoMensal || 0,
        turma_duracao: turmaInfo?.duracaoMeses || 12,
        
        // Pagamento
        plano_pagamento: infoPagamento.plano,
        numero_parcelas: infoPagamento.numeroParcelas,
        valor_parcela: infoPagamento.valorParcela.toFixed(2),
        valor_total: infoPagamento.valorTotal.toFixed(2),
        data_primeiro_pagamento: dataPrimeiroPagamento,
        
        // Metadata
        timestamp: new Date().toISOString(),
        origem: 'site_entropia'
      }

      console.log('=== DADOS FORMATADOS PARA WEBHOOK ===');
      console.log('Dados do aluno:', dadosAluno);
      console.log('Dados do responsável:', dadosResponsavel);
      console.log('Parcelas selecionadas:', parcelasSelecionadas);
      console.log('Info pagamento:', infoPagamento);
      console.log('Webhook payload:', JSON.stringify(dadosWebhook, null, 2));
      
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
  }, [parcelasSelecionadas, dataPrimeiroPagamento, dadosAluno, dadosResponsavel, turmaInfo, router, maiorIdade, validarCPF, validarWhatsApp])

  // Indicador de progresso
  const ProgressBar = () => {
    const etapas = [
      { id: 'pagamento', nome: 'Valor dos Cursos', icon: CreditCard },
      { id: 'dados-aluno', nome: 'Dados do Aluno', icon: User },
      { id: 'responsavel', nome: 'Responsável Financeiro', icon: UserCheck }
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
            {etapaAtual === 'pagamento' && (
              <EtapaPagamento 
                key="pagamento"
                opcoesPagamento={opcoesPagamento}
                pagamentoSelecionado={pagamentoSelecionado}
                setPagamentoSelecionado={setPagamentoSelecionado}
                dataPrimeiroPagamento={dataPrimeiroPagamento}
                setDataPrimeiroPagamento={setDataPrimeiroPagamento}
                parcelasSelecionadas={parcelasSelecionadas}
                setParcelasSelecionadas={setParcelasSelecionadas}
                enviando={false}
                onVoltar={() => {}}
                onFinalizar={avancarEtapa}
              />
            )}
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
                onAvancar={enviarFormulario}
                onVoltar={voltarEtapa}
                mascaraCPF={mascaraCPF}
                mascaraWhatsApp={mascaraWhatsApp}
                enviando={enviando}
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