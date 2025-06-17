'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, User, Phone, CreditCard, Calendar, ArrowRight, Sparkles, Trophy, Zap, Scale, Sofa } from 'lucide-react';
import { turmasService } from '@/services/turmasService';

// SOLUÇÃO SIMPLES: Inputs HTML nativos sem complexidade

const FormularioMatricula = () => {
  const searchParams = useSearchParams();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [turmaInfo, setTurmaInfo] = useState({
    turma: '',
    serie: '',
    origem: ''
  });
  
  const [formData, setFormData] = useState({
    // Dados do Aluno
    nomeAluno: '',
    telefoneAluno: '',
    cpfAluno: '',
    diaNascimentoAluno: '',
    mesNascimentoAluno: '',
    anoNascimentoAluno: '',
    dataNascimentoAluno: '',
    // Dados do Responsável
    nomeResponsavel: '',
    telefoneResponsavel: '',
    cpfResponsavel: '',
    diaNascimentoResponsavel: '',
    mesNascimentoResponsavel: '',
    anoNascimentoResponsavel: '',
    dataNascimentoResponsavel: ''
  });

  const [erros, setErros] = useState<any>({});
  const [alunoEhResponsavel, setAlunoEhResponsavel] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState('');
  const [turmaSelecionada, setTurmaSelecionada] = useState<any>(null);

  // Capturar parâmetros da URL
  useEffect(() => {
    if (searchParams) {
      setTurmaInfo({
        turma: searchParams.get('turma') || '',
        serie: searchParams.get('serie') || '',
        origem: searchParams.get('origem') || ''
      });
    }
  }, [searchParams]);

  // Buscar turma selecionada pelos parâmetros da URL
  useEffect(() => {
    const buscarTurma = async () => {
      const turmaId = searchParams?.get('turmaId');
      const serie = searchParams?.get('serie');
      
      if (turmaId) {
        try {
          const turmasDisponiveis = await turmasService.listarTurmas(true);
          const turma = turmasDisponiveis.find((t: any) => t.id === turmaId);
          
          if (turma) {
            setTurmaSelecionada({
              ...turma,
              valorMensal: 180.00, // Valor padrão
              terminoAulas: '2024-12' // Fim do ano letivo
            });
          }
        } catch (error) {
          console.error('Erro ao buscar turma:', error);
        }
      } else if (serie) {
        // Se não tem turmaId mas tem serie, buscar por série
        try {
          const turmasDisponiveis = await turmasService.listarTurmas(true);
          const turma = turmasDisponiveis.find((t: any) => t.serie === serie);
          
          if (turma) {
            setTurmaSelecionada({
              ...turma,
              valorMensal: 180.00,
              terminoAulas: '2024-12'
            });
          }
        } catch (error) {
          console.error('Erro ao buscar turma por série:', error);
        }
      }
    };
    
    buscarTurma();
  }, [searchParams]);


  // Funções de cálculo para pagamento
  const calcularMesesAteTermino = () => {
    if (!turmaSelecionada?.terminoAulas) return 6;
    const hoje = new Date();
    const [ano, mes] = turmaSelecionada.terminoAulas.split('-');
    const termino = new Date(parseInt(ano), parseInt(mes) - 1);
    
    let meses = (termino.getFullYear() - hoje.getFullYear()) * 12;
    meses += termino.getMonth() - hoje.getMonth();
    return Math.max(1, meses + 1);
  };

  const calcularValorTotal = () => {
    if (!turmaSelecionada?.valorMensal) return 1080;
    return turmaSelecionada.valorMensal * calcularMesesAteTermino();
  };

  const formatarMesAno = (data: string) => {
    if (!data) return '';
    const [ano, mes] = data.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[parseInt(mes) - 1]}/${ano}`;
  };

  const formatarMesAnoMais2 = (data: string) => {
    if (!data) return '';
    const [ano, mes] = data.split('-');
    let novoMes = parseInt(mes) + 2;
    let novoAno = parseInt(ano);
    
    if (novoMes > 12) {
      novoMes -= 12;
      novoAno += 1;
    }
    
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[novoMes - 1]}/${novoAno}`;
  };

  // Mudar etapa de forma simples para evitar re-renders
  const mudarEtapa = useCallback((novaEtapa: number) => {
    setEtapaAtual(novaEtapa);
  }, []);

  // Formatadores (aplicados apenas no envio)
  const formatarCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatarTelefone = (value: string) => {
    const apenasNumeros = value.replace(/\D/g, '');
    
    if (apenasNumeros.length <= 2) {
      return apenasNumeros;
    } else if (apenasNumeros.length <= 3) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    } else if (apenasNumeros.length <= 7) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    } else if (apenasNumeros.length <= 11) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
    }
    
    // Limitar a 11 dígitos
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
  };

  const formatarData = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\/\d{4})\d+?$/, '$1');
  };

  // Função para lidar com mudanças nos campos de data separados
  const handleDataChange = (tipo: 'aluno' | 'responsavel', campo: 'dia' | 'mes' | 'ano', valor: string) => {
    const prefix = tipo === 'aluno' ? 'diaNascimentoAluno' : 'diaNascimentoResponsavel';
    const diaKey = tipo === 'aluno' ? 'diaNascimentoAluno' : 'diaNascimentoResponsavel';
    const mesKey = tipo === 'aluno' ? 'mesNascimentoAluno' : 'mesNascimentoResponsavel';
    const anoKey = tipo === 'aluno' ? 'anoNascimentoAluno' : 'anoNascimentoResponsavel';
    const dataKey = tipo === 'aluno' ? 'dataNascimentoAluno' : 'dataNascimentoResponsavel';
    
    // Atualizar o campo específico
    const campoKey = campo === 'dia' ? diaKey : campo === 'mes' ? mesKey : anoKey;
    
    setFormData(prev => {
      const newData = { ...prev, [campoKey]: valor };
      
      // Reconstruir a data completa quando todos os campos estiverem preenchidos
      const dia = campo === 'dia' ? valor : prev[diaKey];
      const mes = campo === 'mes' ? valor : prev[mesKey];
      const ano = campo === 'ano' ? valor : prev[anoKey];
      
      if (dia && mes && ano) {
        newData[dataKey] = `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
      } else {
        newData[dataKey] = '';
      }
      
      return newData;
    });
  };


  // Validações
  const validarTelefone = (telefone: string) => {
    const apenasNumeros = telefone.replace(/\D/g, '');
    
    // Celular brasileiro: DDD (2) + 9 + 8 dígitos = 11 total
    if (apenasNumeros.length !== 11) {
      return false;
    }
    
    // Verificar DDD válido (lista dos principais DDDs brasileiros)
    const ddd = parseInt(apenasNumeros.slice(0, 2));
    const dddsValidos = [
      11, 12, 13, 14, 15, 16, 17, 18, 19, // SP
      21, 22, 24, // RJ
      27, 28, // ES
      31, 32, 33, 34, 35, 37, 38, // MG
      41, 42, 43, 44, 45, 46, // PR
      47, 48, 49, // SC
      51, 53, 54, 55, // RS
      61, // DF
      62, 64, // GO
      63, // TO
      65, 66, // MT
      67, // MS
      68, // AC
      69, // RO
      71, 73, 74, 75, 77, // BA
      79, // SE
      81, 87, // PE
      82, // AL
      83, // PB
      84, // RN
      85, 88, // CE
      86, 89, // PI
      91, 93, 94, // PA
      92, 97, // AM (Manaus!)
      95, // RR
      96, // AP
      98, 99 // MA
    ];
    
    if (!dddsValidos.includes(ddd)) {
      return false;
    }
    
    // Verificar se tem o 9 após o DDD
    if (apenasNumeros[2] !== '9') {
      return false;
    }
    
    return true;
  };

  const validarCPF = (cpf: string) => {
    console.log('Validando CPF:', cpf);
    cpf = cpf.replace(/[^\d]+/g, '');
    console.log('CPF apenas números:', cpf);
    
    if (cpf.length !== 11) {
      console.log('CPF inválido: não tem 11 dígitos');
      return false;
    }
    
    if (/^(\d)\1{10}$/.test(cpf)) {
      console.log('CPF inválido: todos dígitos iguais');
      return false;
    }
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) {
      console.log('CPF inválido: primeiro dígito verificador');
      return false;
    }
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) {
      console.log('CPF inválido: segundo dígito verificador');
      return false;
    }
    
    console.log('CPF válido!');
    return true;
  };

  // Funções auxiliares para maioridade
  const calcularIdade = (dataNascimento: string) => {
    if (!dataNascimento || !dataNascimento.includes('/')) return 0;
    
    const [dia, mes, ano] = dataNascimento.split('/');
    const nascimento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    const hoje = new Date();
    
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  };
  
  const ehMaiorDeIdade = () => {
    if (!formData.dataNascimentoAluno) return false;
    return calcularIdade(formData.dataNascimentoAluno) >= 18;
  };

  const validarEtapa = () => {
    console.log('Iniciando validação da etapa:', etapaAtual);
    const novosErros: any = {};
    
    if (etapaAtual === 1) {
      // Nome - mínimo 3 caracteres
      if (!formData.nomeAluno || formData.nomeAluno.trim().length < 3) {
        novosErros.nomeAluno = 'Nome deve ter pelo menos 3 caracteres';
      }
      
      // Telefone - validação rigorosa para celular brasileiro
      if (!validarTelefone(formData.telefoneAluno)) {
        novosErros.telefoneAluno = 'Celular inválido. Use: (XX) 9XXXX-XXXX';
      }
      
      // CPF - validação real mas flexível
      if (!validarCPF(formData.cpfAluno)) {
        novosErros.cpfAluno = 'CPF inválido';
      }
      
      // Data - validar formato e existência
      if (!formData.dataNascimentoAluno) {
        novosErros.dataNascimentoAluno = 'Data de nascimento obrigatória';
      }
      
    } else if (etapaAtual === 2 && !alunoEhResponsavel) {
      // Validações do responsável (apenas se aluno não for responsável)
      if (!formData.nomeResponsavel || formData.nomeResponsavel.trim().length < 3) {
        novosErros.nomeResponsavel = 'Nome do responsável deve ter pelo menos 3 caracteres';
      }
      
      if (!validarTelefone(formData.telefoneResponsavel)) {
        novosErros.telefoneResponsavel = 'Celular inválido. Use: (XX) 9XXXX-XXXX';
      }
      
      if (!validarCPF(formData.cpfResponsavel)) {
        novosErros.cpfResponsavel = 'CPF do responsável inválido';
      }
      
      if (!formData.dataNascimentoResponsavel) {
        novosErros.dataNascimentoResponsavel = 'Data de nascimento do responsável obrigatória';
      }
      
      // Validar CPF duplicado para menores
      if (!ehMaiorDeIdade() && formData.cpfResponsavel === formData.cpfAluno) {
        novosErros.cpfResponsavel = 'CPF do responsável não pode ser igual ao do aluno menor de idade';
      }
    } else if (etapaAtual === 3) {
      // Validação da forma de pagamento
      if (!formaPagamento) {
        novosErros.formaPagamento = 'Selecione uma forma de pagamento';
      }
    }
    
    console.log('Erros encontrados:', novosErros);
    setErros(novosErros);
    const valido = Object.keys(novosErros).length === 0;
    console.log('Validação passou?', valido);
    return valido;
  };

  // Função simples para atualizar campos
  const updateField = (campo: string, valor: string) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
    // Limpar erro ao digitar
    if (erros[campo]) {
      setErros(prev => ({ ...prev, [campo]: '' }));
    }
  };

  const avancar = () => {
    console.log('Botão Continuar clicado');
    console.log('Dados do formulário:', formData);
    console.log('Etapa atual:', etapaAtual);
    
    if (validarEtapa()) {
      console.log('Validação passou! Avançando...');
      if (etapaAtual < 3) {
        mudarEtapa(etapaAtual + 1);
      } else {
        enviarFormulario();
      }
    } else {
      console.log('Validação falhou. Erros:', erros);
    }
  };

  const voltar = () => {
    if (etapaAtual > 1) {
      mudarEtapa(etapaAtual - 1);
    }
  };

  const enviarFormulario = async () => {
    setEnviando(true);
    
    try {
      // Aplicar formatação apenas no envio
      const dadosFormatados = {
        ...formData,
        cpfAluno: formatarCPF(formData.cpfAluno),
        telefoneAluno: formatarTelefone(formData.telefoneAluno),
        dataNascimentoAluno: formatarData(formData.dataNascimentoAluno),
        cpfResponsavel: formatarCPF(formData.cpfResponsavel),
        telefoneResponsavel: formatarTelefone(formData.telefoneResponsavel),
        dataNascimentoResponsavel: formatarData(formData.dataNascimentoResponsavel)
      };

      const response = await fetch('https://webhook.cursoentropia.com/webhook/siteentropiaoficial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...dadosFormatados,
          ...turmaInfo,
          turma: turmaSelecionada,
          formaPagamento: formaPagamento,
          valorPagamento: calcularValorTotal(),
          mesesPagamento: calcularMesesAteTermino(),
          dataEnvio: new Date().toISOString(),
          origem: turmaInfo.origem || 'site-entropia'
        }),
      });

      if (response.ok) {
        setSucesso(true);
      } else {
        alert('Erro ao enviar. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao enviar. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  // Componente de Input customizado
  const InputAnimado = ({ label, value, onChange, error, icon: Icon, ...props }: any) => (
    <div className="group">
      <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-green-600 transition-colors">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            block w-full pl-10 pr-3 py-3 border rounded-lg
            transition-all duration-200 
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 
                     'border-gray-300 focus:ring-green-500 focus:border-green-500'}
            focus:ring-2 focus:outline-none
            placeholder-gray-400
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 animate-pulse">{error}</p>
        )}
      </div>
    </div>
  );

  // Tela de sucesso
  if (sucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-600 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-bounce-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-12 h-12 text-green-600 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Parabéns! 🎉
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Sua vaga foi reservada com sucesso!
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Em breve, nossa equipe entrará em contato para finalizar sua matrícula.
          </p>
          <div className="flex flex-col gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <Zap className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-800">
                Prepare-se para uma jornada incrível rumo à aprovação!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-600 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header com Progress Bar */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-4 text-center">
            Reserve sua Vaga na Entropia! 🚀
          </h1>
          
          {/* Informações da turma selecionada */}
          {turmaInfo.turma && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-4">
              <p className="text-white/90 text-sm text-center">
                ✨ <strong>Turma selecionada:</strong> {turmaInfo.turma}
                {turmaInfo.serie && (
                  <span className="block text-white/70 text-xs mt-1">
                    Para {turmaInfo.serie === '1' ? '1ª série' : 
                          turmaInfo.serie === '2' ? '2ª série' : 
                          turmaInfo.serie === '3' ? '3ª série' : 
                          'formados'}
                  </span>
                )}
              </p>
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full
                    transition-all duration-300 transform
                    ${etapaAtual >= step ? 
                      'bg-white text-green-600 scale-110' : 
                      'bg-white/20 text-white/60'}
                  `}
                >
                  {etapaAtual > step ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="font-bold">{step}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/20 -z-10">
              <div 
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${((etapaAtual - 1) / 2) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          {/* Etapa 1 - Dados do Aluno */}
          {etapaAtual === 1 && (
            <div className="space-y-6 animate-fade-in">
              {/* Card como Imagem */}
              <div className="w-full rounded-lg overflow-hidden shadow-lg mb-6">
                <img 
                  src="/images/lucca-beulch.png" 
                  alt="Aluno aprovado"
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Dados do Aluno</h2>
                  <p className="text-sm text-gray-500">Preencha com seus dados pessoais</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.nomeAluno}
                  onChange={(e) => updateField('nomeAluno', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Digite seu nome completo"
                />
                {erros.nomeAluno && (
                  <p className="mt-1 text-sm text-red-600">{erros.nomeAluno}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.telefoneAluno}
                  onChange={(e) => updateField('telefoneAluno', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="(92) 99999-9999"
                  maxLength={15}
                />
                {erros.telefoneAluno && (
                  <p className="mt-1 text-sm text-red-600">{erros.telefoneAluno}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF
                </label>
                <input
                  type="text"
                  value={formData.cpfAluno}
                  onChange={(e) => updateField('cpfAluno', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="000.000.000-00"
                />
                {erros.cpfAluno && (
                  <p className="mt-1 text-sm text-red-600">{erros.cpfAluno}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <select
                      value={formData.diaNascimentoAluno}
                      onChange={(e) => handleDataChange('aluno', 'dia', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Dia</option>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={formData.mesNascimentoAluno}
                      onChange={(e) => handleDataChange('aluno', 'mes', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Mês</option>
                      <option value="1">Janeiro</option>
                      <option value="2">Fevereiro</option>
                      <option value="3">Março</option>
                      <option value="4">Abril</option>
                      <option value="5">Maio</option>
                      <option value="6">Junho</option>
                      <option value="7">Julho</option>
                      <option value="8">Agosto</option>
                      <option value="9">Setembro</option>
                      <option value="10">Outubro</option>
                      <option value="11">Novembro</option>
                      <option value="12">Dezembro</option>
                    </select>
                  </div>
                  <div>
                    <select
                      value={formData.anoNascimentoAluno}
                      onChange={(e) => handleDataChange('aluno', 'ano', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Ano</option>
                      {Array.from({ length: 50 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                {erros.dataNascimentoAluno && (
                  <p className="mt-1 text-sm text-red-600">{erros.dataNascimentoAluno}</p>
                )}
              </div>
            </div>
          )}

          {/* Etapa 2 - Dados do Responsável */}
          {etapaAtual === 2 && (
            <div className="space-y-6 animate-fade-in">
              {/* Card como Imagem */}
              <div className="w-full rounded-lg overflow-hidden shadow-lg mb-6">
                <img 
                  src="/images/eduarda-braga.png" 
                  alt="Aluna aprovada"
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Responsável Financeiro</h2>
                  <p className="text-sm text-gray-500">Quem será responsável pelo pagamento?</p>
                </div>
              </div>
              
              {/* Checkbox para aluno maior de idade ser responsável */}
              {ehMaiorDeIdade() && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alunoEhResponsavel}
                      onChange={(e) => {
                        setAlunoEhResponsavel(e.target.checked);
                        if (e.target.checked) {
                          // Copiar dados do aluno para responsável
                          setFormData(prev => ({
                            ...prev,
                            nomeResponsavel: prev.nomeAluno,
                            telefoneResponsavel: prev.telefoneAluno,
                            cpfResponsavel: prev.cpfAluno,
                            diaNascimentoResponsavel: prev.diaNascimentoAluno,
                            mesNascimentoResponsavel: prev.mesNascimentoAluno,
                            anoNascimentoResponsavel: prev.anoNascimentoAluno,
                            dataNascimentoResponsavel: prev.dataNascimentoAluno
                          }));
                        } else {
                          // Limpar dados do responsável
                          setFormData(prev => ({
                            ...prev,
                            nomeResponsavel: '',
                            telefoneResponsavel: '',
                            cpfResponsavel: '',
                            diaNascimentoResponsavel: '',
                            mesNascimentoResponsavel: '',
                            anoNascimentoResponsavel: '',
                            dataNascimentoResponsavel: ''
                          }));
                        }
                      }}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="text-base font-medium text-gray-700">
                      Sou maior de idade e serei o responsável financeiro
                    </span>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Marque esta opção se você mesmo(a) será responsável pelo pagamento
                  </p>
                </div>
              )}
              
              <div className={alunoEhResponsavel ? 'opacity-50 pointer-events-none' : ''}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo do Responsável
                </label>
                <input
                  type="text"
                  value={formData.nomeResponsavel}
                  onChange={(e) => updateField('nomeResponsavel', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Digite o nome completo"
                />
                {erros.nomeResponsavel && (
                  <p className="mt-1 text-sm text-red-600">{erros.nomeResponsavel}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp do Responsável
                </label>
                <input
                  type="text"
                  value={formData.telefoneResponsavel}
                  onChange={(e) => updateField('telefoneResponsavel', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="(92) 99999-9999"
                  maxLength={15}
                />
                {erros.telefoneResponsavel && (
                  <p className="mt-1 text-sm text-red-600">{erros.telefoneResponsavel}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF do Responsável
                </label>
                <input
                  type="text"
                  value={formData.cpfResponsavel}
                  onChange={(e) => updateField('cpfResponsavel', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="000.000.000-00"
                />
                {erros.cpfResponsavel && (
                  <p className="mt-1 text-sm text-red-600">{erros.cpfResponsavel}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento do Responsável
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <select
                      value={formData.diaNascimentoResponsavel}
                      onChange={(e) => handleDataChange('responsavel', 'dia', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Dia</option>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={formData.mesNascimentoResponsavel}
                      onChange={(e) => handleDataChange('responsavel', 'mes', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Mês</option>
                      <option value="1">Janeiro</option>
                      <option value="2">Fevereiro</option>
                      <option value="3">Março</option>
                      <option value="4">Abril</option>
                      <option value="5">Maio</option>
                      <option value="6">Junho</option>
                      <option value="7">Julho</option>
                      <option value="8">Agosto</option>
                      <option value="9">Setembro</option>
                      <option value="10">Outubro</option>
                      <option value="11">Novembro</option>
                      <option value="12">Dezembro</option>
                    </select>
                  </div>
                  <div>
                    <select
                      value={formData.anoNascimentoResponsavel}
                      onChange={(e) => handleDataChange('responsavel', 'ano', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Ano</option>
                      {Array.from({ length: 80 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                {erros.dataNascimentoResponsavel && (
                  <p className="mt-1 text-sm text-red-600">{erros.dataNascimentoResponsavel}</p>
                )}
              </div>
              </div>
            </div>
          )}

          {/* Etapa 3 - Revisão e Pagamento */}
          {etapaAtual === 3 && (
            <div className="space-y-6 animate-fade-in">
              {/* Card como Imagem */}
              <div className="w-full rounded-lg overflow-hidden shadow-lg mb-6">
                <img 
                  src="/images/gabriela-parente.png" 
                  alt="Aluna aprovada"
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Confirme seus Dados e Pagamento</h2>
                  <p className="text-sm text-gray-500">Revise as informações e escolha como pagar</p>
                </div>
              </div>
              
              {/* SEÇÃO 1 - Dados Pessoais */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">📚 Dados do Aluno</h3>
                  <div className="space-y-1 text-sm text-green-800">
                    <p><strong>Nome:</strong> {formData.nomeAluno}</p>
                    <p><strong>WhatsApp:</strong> {formatarTelefone(formData.telefoneAluno)}</p>
                    <p><strong>CPF:</strong> {formatarCPF(formData.cpfAluno)}</p>
                    <p><strong>Nascimento:</strong> {formData.dataNascimentoAluno}</p>
                  </div>
                </div>
                
                {(!ehMaiorDeIdade() || !alunoEhResponsavel) && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">💰 Responsável Financeiro</h3>
                    <div className="space-y-1 text-sm text-blue-800">
                      <p><strong>Nome:</strong> {formData.nomeResponsavel}</p>
                      <p><strong>WhatsApp:</strong> {formatarTelefone(formData.telefoneResponsavel)}</p>
                      <p><strong>CPF:</strong> {formatarCPF(formData.cpfResponsavel)}</p>
                      <p><strong>Nascimento:</strong> {formData.dataNascimentoResponsavel}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* SEÇÃO 2 - Turma Selecionada */}
              {turmaSelecionada && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2">{turmaSelecionada.nome}</h3>
                  <p className="text-sm text-gray-600 mb-2">{turmaSelecionada.foco}</p>
                  <div className="flex justify-between text-sm">
                    <span>Aulas até: <strong>{formatarMesAno(turmaSelecionada.terminoAulas)}</strong></span>
                    <span>Valor mensal: <strong>R$ {turmaSelecionada.valorMensal?.toFixed(2)}</strong></span>
                  </div>
                </div>
              )}
              
              {/* SEÇÃO 3 - Opções de Pagamento */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Escolha sua forma de pagamento:</h3>
                <div className="space-y-3">
                  {/* Opção À Vista */}
                  <label className={`
                    block p-4 border-2 rounded-lg cursor-pointer transition-all
                    ${formaPagamento === 'avista' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'}
                  `}>
                    <input
                      type="radio"
                      name="pagamento"
                      value="avista"
                      checked={formaPagamento === 'avista'}
                      onChange={(e) => setFormaPagamento(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-green-700 flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          Mais Econômico - À Vista
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          10% de desconto no valor total
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm line-through text-gray-400">
                          R$ {calcularValorTotal().toFixed(2)}
                        </p>
                        <p className="text-lg font-bold text-green-700">
                          R$ {(calcularValorTotal() * 0.9).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </label>
                  
                  {/* Opção Equilibrado */}
                  <label className={`
                    block p-4 border-2 rounded-lg cursor-pointer transition-all
                    ${formaPagamento === 'equilibrado' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                  `}>
                    <input
                      type="radio"
                      name="pagamento"
                      value="equilibrado"
                      checked={formaPagamento === 'equilibrado'}
                      onChange={(e) => setFormaPagamento(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                          <Scale className="w-5 h-5" />
                          Mais Equilibrado
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {calcularMesesAteTermino()}x de R$ {turmaSelecionada?.valorMensal?.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Até {formatarMesAno(turmaSelecionada?.terminoAulas || '')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-700">
                          R$ {turmaSelecionada?.valorMensal?.toFixed(2)}/mês
                        </p>
                      </div>
                    </div>
                  </label>
                  
                  {/* Opção Confortável */}
                  <label className={`
                    block p-4 border-2 rounded-lg cursor-pointer transition-all
                    ${formaPagamento === 'confortavel' ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'}
                  `}>
                    <input
                      type="radio"
                      name="pagamento"
                      value="confortavel"
                      checked={formaPagamento === 'confortavel'}
                      onChange={(e) => setFormaPagamento(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-purple-700 flex items-center gap-2">
                          <Sofa className="w-5 h-5" />
                          Mais Confortável
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {calcularMesesAteTermino() + 2}x de R$ {(calcularValorTotal() / (calcularMesesAteTermino() + 2)).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Até {formatarMesAnoMais2(turmaSelecionada?.terminoAulas || '')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-700">
                          R$ {(calcularValorTotal() / (calcularMesesAteTermino() + 2)).toFixed(2)}/mês
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Erro se não selecionou pagamento */}
              {erros.formaPagamento && (
                <p className="text-sm text-red-600 animate-pulse">{erros.formaPagamento}</p>
              )}
            </div>
          )}


          {/* Botões de Navegação */}
          <div className="flex gap-4 mt-8">
            {etapaAtual > 1 && (
              <button
                onClick={voltar}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
            )}
            
            <button
              onClick={() => {
                console.log('Click detectado no botão!');
                avancar();
              }}
              disabled={enviando}
              className={`
                flex-1 px-6 py-3 rounded-lg font-semibold
                transition-all duration-200 transform
                ${enviando ? 
                  'bg-gray-400 cursor-not-allowed' : 
                  'bg-green-600 hover:bg-green-700 hover:scale-105 text-white'}
                flex items-center justify-center gap-2
              `}
            >
              {enviando ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Enviando...
                </>
              ) : (
                <>
                  {etapaAtual === 3 ? 'Confirmar Reserva' : 'Continuar'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default function MatriculaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-600 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Carregando formulário...</p>
        </div>
      </div>
    }>
      <FormularioMatricula />
    </Suspense>
  );
}