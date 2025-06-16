export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Por enquanto, apenas log
    console.log('Descritores recebidos:', body);
    
    // Aqui você pode adicionar a integração real com seu webhook
    // const webhookUrl = process.env.WEBHOOK_DESCRITORES_URL;
    // await fetch(webhookUrl, { ... });
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Erro ao processar' }, { status: 500 });
  }
}