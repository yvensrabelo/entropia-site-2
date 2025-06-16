import { NextRequest, NextResponse } from 'next/server'
import { validateAndFormatPhone, formatPhoneForWhatsApp } from '@/lib/utils/phone'
import { verifyAdminAuth, checkRateLimit, getClientIP } from '@/lib/auth-api'

export async function POST(request: NextRequest) {
  // Verificar autenticação
  const authResult = await verifyAdminAuth(request)
  if (!authResult.isValid) {
    return NextResponse.json({ error: authResult.error }, { status: 401 })
  }

  // Rate limiting
  const clientIP = getClientIP(request)
  if (!checkRateLimit(clientIP, 20, 60000)) { // 20 requests per minute
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  try {
    // Capturar variáveis de ambiente
    const API_URL = process.env.EVOLUTION_API_URL
    const API_KEY = process.env.EVOLUTION_API_KEY
    const INSTANCE = process.env.EVOLUTION_INSTANCE_NUMBER

    console.log('=== ENVIO MANUAL WHATSAPP ===')
    console.log('API_URL:', API_URL)
    console.log('API_KEY:', API_KEY ? 'Definida' : 'Não definida')
    console.log('INSTANCE:', INSTANCE)

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
    const { to, message, type = 'text', aluno_id } = await request.json()

    console.log('=== DADOS RECEBIDOS ===')
    console.log('Destinatário:', to)
    console.log('Mensagem:', message?.substring(0, 100) + '...')
    console.log('Tipo:', type)
    console.log('Aluno ID:', aluno_id)
    console.log('======================')

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Dados incompletos - destinatário e mensagem são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar telefone
    const phoneValidation = validateAndFormatPhone(to)
    console.log('=== VALIDAÇÃO DO TELEFONE ===')
    console.log('Telefone original:', to)
    console.log('Validação:', phoneValidation)
    console.log('============================')

    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { error: phoneValidation.error || 'Número de telefone inválido. Verifique o DDD e o número.' },
        { status: 400 }
      )
    }

    // Formatar telefone para WhatsApp
    const numeroWhatsApp = formatPhoneForWhatsApp(phoneValidation.formatted!)

    console.log('=== NÚMERO FORMATADO ===')
    console.log('Número validado:', phoneValidation.formatted)
    console.log('Número WhatsApp:', numeroWhatsApp)
    console.log('DDD extraído:', phoneValidation.ddd)
    console.log('=======================')

    // Construir URL da API
    const url = `${API_URL}/message/sendText/${INSTANCE}`

    console.log('=== ENVIANDO MENSAGEM ===')
    console.log('URL:', url)
    console.log('Número:', numeroWhatsApp)
    console.log('========================')

    // Enviar mensagem via Evolution API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
      },
      body: JSON.stringify({
        number: numeroWhatsApp,
        text: message
      })
    })

    const responseText = await response.text()
    console.log('=== RESPOSTA DA API ===')
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

    return NextResponse.json({ 
      success: true, 
      message: 'Mensagem enviada com sucesso',
      messageId: data.key?.id || data.id || 'sent'
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