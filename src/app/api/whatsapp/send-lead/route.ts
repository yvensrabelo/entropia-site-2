import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-singleton'
import { validateAndFormatPhone, formatPhoneForWhatsApp } from '@/lib/utils/phone'

export async function POST(request: NextRequest) {
  try {
    // Capturar variáveis de ambiente
    const API_URL = process.env.EVOLUTION_API_URL
    const API_KEY = process.env.EVOLUTION_API_KEY
    const INSTANCE = process.env.EVOLUTION_INSTANCE_NUMBER

    // Log das variáveis para debug
    console.log('=== DEBUG VARIÁVEIS DE AMBIENTE ===')
    console.log('API_URL:', API_URL)
    console.log('API_KEY:', API_KEY ? 'Definida' : 'Não definida')
    console.log('INSTANCE:', INSTANCE)
    console.log('===================================')

    // Verificar se as variáveis estão configuradas
    if (!API_URL || !API_KEY || !INSTANCE) {
      console.error('Erro: Variáveis de ambiente não configuradas')
      return NextResponse.json(
        { 
          error: 'Variáveis de ambiente não configuradas corretamente',
          details: {
            API_URL: !!API_URL,
            API_KEY: !!API_KEY,
            INSTANCE: !!INSTANCE
          }
        },
        { status: 500 }
      )
    }

    // Obter dados da requisição
    const { telefone, turma, periodo, duracao, vagas } = await request.json()

    console.log('=== DEBUG DADOS RECEBIDOS ===')
    console.log('Telefone:', telefone)
    console.log('Turma:', turma)
    console.log('Período:', periodo)
    console.log('Duração:', duracao)
    console.log('Vagas:', vagas)
    console.log('=============================')

    if (!telefone || !turma) {
      return NextResponse.json(
        { error: 'Dados incompletos - telefone e turma são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar telefone
    const phoneValidation = validateAndFormatPhone(telefone)
    console.log('=== VALIDAÇÃO DO TELEFONE ===')
    console.log('Telefone original:', telefone)
    console.log('Validação:', phoneValidation)
    console.log('============================')

    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { error: phoneValidation.error || 'Número de telefone inválido. Verifique o DDD e o número.' },
        { status: 400 }
      )
    }

    // Buscar dados completos da turma no banco incluindo mensagem e imagem
    let turmaData = null
    try {
      const { data, error } = await supabase
        .from('turmas')
        .select('mensagem_whatsapp, imagem_url')
        .eq('nome', turma)
        .single()
      
      if (!error && data) {
        turmaData = data
        console.log('Dados da turma encontrados:', turmaData)
      }
    } catch (err) {
      console.log('Erro ao buscar dados da turma:', err)
    }

    // Formatar telefone para WhatsApp
    const numeroWhatsApp = formatPhoneForWhatsApp(phoneValidation.formatted!)

    console.log('=== DEBUG NÚMERO FORMATADO ===')
    console.log('Número validado:', phoneValidation.formatted)
    console.log('Número WhatsApp:', numeroWhatsApp)
    console.log('DDD extraído:', phoneValidation.ddd)
    console.log('==============================')

    // Usar mensagem personalizada se existir, senão usar padrão
    let mensagem = ''
    if (turmaData?.mensagem_whatsapp && turmaData.mensagem_whatsapp.trim()) {
      mensagem = turmaData.mensagem_whatsapp
    } else {
      // Mensagem padrão
      mensagem = `👋 Olá! Aqui é da Entropia. Aqui estão as informações sobre a turma *${turma}*.`
      
      if (periodo && periodo.trim()) {
        mensagem += `\n✔️ Período: ${periodo}`
      }
      
      if (duracao && duracao.trim()) {
        mensagem += `\n✔️ Duração: ${duracao}`
      }
      
      if (vagas) {
        mensagem += `\n✔️ Vagas: ${typeof vagas === 'number' ? `${vagas} disponíveis` : vagas}`
      }
      
      mensagem += `\n\nPara saber mais, é só responder por aqui. 🚀`
    }

    const results = []

    // Se houver imagem, enviar primeiro
    if (turmaData?.imagem_url && turmaData.imagem_url.trim()) {
      const urlImagem = `${API_URL}/message/sendImage/${INSTANCE}`
      
      console.log('=== ENVIANDO IMAGEM ===')
      console.log('URL:', urlImagem)
      console.log('Imagem:', turmaData.imagem_url)
      console.log('======================')

      const responseImagem = await fetch(urlImagem, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
        body: JSON.stringify({
          number: numeroWhatsApp,
          url: turmaData.imagem_url,
          caption: mensagem
        })
      })

      const responseTextImagem = await responseImagem.text()
      console.log('Resposta imagem:', responseTextImagem)

      if (!responseImagem.ok) {
        console.error('Erro ao enviar imagem:', responseTextImagem)
        // Continuar e tentar enviar só texto
      } else {
        results.push({ tipo: 'imagem', success: true })
        
        // Se a imagem foi enviada com caption, não precisa enviar texto separado
        return NextResponse.json({ 
          success: true, 
          message: 'Mensagem com imagem enviada com sucesso',
          results
        })
      }
    }

    // Enviar mensagem de texto (se não enviou imagem ou se imagem falhou)
    const url = `${API_URL}/message/sendText/${INSTANCE}`

    console.log('=== DEBUG REQUISIÇÃO ===')
    console.log('URL:', url)
    console.log('Mensagem:', mensagem)
    console.log('========================')

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
      },
      body: JSON.stringify({
        number: numeroWhatsApp,
        text: mensagem
      })
    })

    const responseText = await response.text()
    console.log('=== DEBUG RESPOSTA ===')
    console.log('Status:', response.status)
    console.log('Response:', responseText)
    console.log('======================')

    if (!response.ok) {
      console.error('Erro na Evolution API:', responseText)
      return NextResponse.json(
        { 
          error: 'Falha ao enviar mensagem via WhatsApp',
          details: responseText,
          status: response.status
        },
        { status: 500 }
      )
    }

    // Tentar fazer parse do JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.log('Resposta não é JSON válido, mas requisição foi bem-sucedida')
      data = { success: true }
    }

    results.push({ tipo: 'texto', success: true })

    return NextResponse.json({ 
      success: true, 
      message: 'Mensagem enviada com sucesso',
      messageId: data.key?.id || data.id || 'sent',
      results
    })

  } catch (error) {
    console.error('=== ERRO GERAL ===')
    console.error('Erro ao enviar mensagem:', error)
    console.error('Tipo do erro:', typeof error)
    console.error('Mensagem do erro:', error instanceof Error ? error.message : 'Erro desconhecido')
    console.error('==================')
    
    return NextResponse.json(
      { 
        error: 'Erro ao processar solicitação',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}