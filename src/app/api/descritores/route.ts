import { NextRequest } from 'next/server';
import { verifyAdminAuth, checkRateLimit, getClientIP } from '@/lib/auth-api';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return Response.json({ error: authResult.error }, { status: 401 });
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP, 30, 60000)) { // 30 requests per minute
      return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    
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