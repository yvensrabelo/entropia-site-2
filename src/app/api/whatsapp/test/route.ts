import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('=== TESTE DE ENVIO WHATSAPP ===');
  
  try {
    // Configuração direta para teste
    const url = 'https://evolutionapi.cursoentropia.com/message/sendText/5592991144473';
    const apiKey = 'F4624A270E1E-4DDD-89F2-D3C26872631A';
    
    const messageData = {
      number: '5592981662806',
      text: '✅ Teste Entropia Cursinho - WhatsApp integrado com sucesso!',
      delay: 1200
    };
    
    console.log('Enviando para:', url);
    console.log('Dados da mensagem:', messageData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey // IMPORTANTE: minúsculo
      },
      body: JSON.stringify(messageData)
    });
    
    const responseText = await response.text();
    console.log('Resposta da API:', {
      status: response.status,
      ok: response.ok,
      text: responseText
    });
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${responseText}`);
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      // Se não for JSON, considera como sucesso se status 2xx
      data = { success: true, response: responseText };
    }
    
    console.log('✅ MENSAGEM ENVIADA COM SUCESSO!');
    
    return NextResponse.json({
      success: true,
      message: 'Mensagem de teste enviada com sucesso!',
      data,
      connected: true
    });
    
  } catch (error: any) {
    console.error('❌ ERRO AO ENVIAR MENSAGEM:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Erro ao enviar mensagem de teste',
        connected: false
      },
      { status: 500 }
    );
  }
}