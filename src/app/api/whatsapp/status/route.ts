import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Capturar variáveis de ambiente
    const API_URL = process.env.EVOLUTION_API_URL
    const API_KEY = process.env.EVOLUTION_API_KEY
    const INSTANCE = process.env.EVOLUTION_INSTANCE_NUMBER

    console.log('=== VERIFICANDO STATUS WHATSAPP ===')
    console.log('API_URL:', API_URL)
    console.log('API_KEY:', API_KEY ? 'Definida' : 'Não definida')
    console.log('INSTANCE:', INSTANCE)

    // Verificar se as variáveis estão configuradas
    if (!API_URL || !API_KEY || !INSTANCE) {
      console.error('Variáveis de ambiente não configuradas para verificar status')
      return NextResponse.json(
        { 
          connected: false,
          error: 'Variáveis de ambiente não configuradas. Verifique EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE_NUMBER',
          details: {
            hasApiUrl: !!API_URL,
            hasApiKey: !!API_KEY,
            hasInstance: !!INSTANCE
          }
        }
      )
    }

    // Construir URL para verificar status
    const url = `${API_URL}/session/status/${INSTANCE}`
    
    console.log('URL de verificação:', url)

    // Fazer requisição para verificar status
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
      }
    })

    const responseText = await response.text()
    console.log('Status HTTP:', response.status)
    console.log('Resposta bruta:', responseText)

    if (!response.ok) {
      console.error('Erro ao verificar status - HTTP', response.status)
      console.error('Resposta:', responseText)
      
      // Tentar endpoint alternativo
      console.log('Tentando endpoint alternativo...')
      const altUrl = `${API_URL}/instance/connectionState/${INSTANCE}`
      
      const altResponse = await fetch(altUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        }
      })
      
      const altResponseText = await altResponse.text()
      console.log('Resposta alternativa:', altResponseText)
      
      if (altResponse.ok) {
        try {
          const altData = JSON.parse(altResponseText)
          const isConnected = altData.state === 'open' || altData.instance?.state === 'open'
          
          console.log('Status retornado pela API Evolution (alternativo):', altData.state || altData.instance?.state)
          
          return NextResponse.json({ 
            connected: isConnected,
            status: altData.state || altData.instance?.state || 'UNKNOWN',
            instance: INSTANCE,
            method: 'alternative'
          })
        } catch (e) {
          console.error('Erro ao processar resposta alternativa:', e)
        }
      }
      
      return NextResponse.json(
        { 
          connected: false,
          error: 'Falha ao obter status. Verifique as variáveis de ambiente ou a conexão com a Evolution API.',
          httpStatus: response.status,
          apiResponse: responseText
        }
      )
    }

    // Tentar fazer parse do JSON
    let data
    try {
      data = JSON.parse(responseText)
      console.log('Dados parseados:', data)
    } catch (e) {
      console.error('Erro ao fazer parse da resposta:', e)
      console.error('Resposta que causou erro:', responseText)
      return NextResponse.json(
        { 
          connected: false,
          error: 'Resposta inválida da API Evolution',
          rawResponse: responseText
        }
      )
    }

    // Verificar o status - múltiplas possibilidades de estrutura
    let status = data.status || data.state || data.instance?.status || data.instance?.state || 'UNKNOWN'
    const isConnected = status === 'CONNECTED' || status === 'open' || status === 'QRCODE_READY'
    
    console.log('Status retornado pela API Evolution:', status)
    console.log('Está conectado?', isConnected)
    
    return NextResponse.json({ 
      connected: isConnected,
      status: status,
      instance: INSTANCE,
      rawData: data
    })

  } catch (error) {
    console.error('=== ERRO AO VERIFICAR STATUS ===')
    console.error('Erro:', error)
    console.error('Tipo:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Mensagem:', error instanceof Error ? error.message : 'Erro desconhecido')
    
    return NextResponse.json(
      { 
        connected: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao verificar status',
        errorType: error instanceof Error ? error.constructor.name : typeof error
      }
    )
  }
}