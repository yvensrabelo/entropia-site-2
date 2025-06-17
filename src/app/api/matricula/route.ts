export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Recebendo matrícula:', body);
    
    // URL do webhook usando variável de ambiente
    const webhookUrl = process.env.WEBHOOK_URL || 'https://webhook.cursoentropia.com/webhook/siteentropiaoficial';
    console.log('Enviando para webhook:', webhookUrl);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    console.log('Resposta do webhook:', response.status);
    
    if (!response.ok) {
      console.error('Erro do webhook:', response.statusText);
      throw new Error(`Webhook retornou status: ${response.status}`);
    }
    
    const result = await response.text();
    console.log('Resultado do webhook:', result);
    
    return Response.json({ 
      success: true, 
      message: 'Matrícula enviada com sucesso!' 
    });
    
  } catch (error) {
    console.error('Erro na API route:', error);
    return Response.json({ 
      error: 'Erro ao enviar matrícula',
      details: error.message 
    }, { status: 500 });
  }
}