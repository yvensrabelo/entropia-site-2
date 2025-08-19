import { kv } from '@vercel/kv';

export async function GET() {
  try {
    console.log('🧪 Testando conexão KV...')
    
    // Teste simples: setar e pegar uma chave
    const testKey = 'test_connection';
    const testValue = Date.now();
    
    await kv.set(testKey, testValue);
    const retrieved = await kv.get(testKey);
    
    // Limpar chave de teste
    await kv.del(testKey);
    
    const success = retrieved === testValue;
    
    return Response.json({
      success,
      message: success ? 'KV funcionando!' : 'KV com problema',
      test: {
        set: testValue,
        get: retrieved,
        match: success
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown'
    });
    
  } catch (error) {
    console.error('❌ Erro no teste KV:', error);
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      envVars: {
        hasUrl: !!process.env.KV_REST_API_URL,
        hasToken: !!process.env.KV_REST_API_TOKEN,
        hasUpstashUrl: !!process.env.UPSTASH_REDIS_REST_URL,
        hasUpstashToken: !!process.env.UPSTASH_REDIS_REST_TOKEN
      }
    }, { status: 500 });
  }
}