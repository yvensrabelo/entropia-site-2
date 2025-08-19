import { kv } from '@vercel/kv';

const INITIAL_VALUE = 4692;
const KV_KEY = 'calculadora_views';

export async function POST() {
  try {
    console.log(`🚀 Inicializando contador com valor ${INITIAL_VALUE}...`);
    
    // Definir valor inicial no KV
    await kv.set(KV_KEY, INITIAL_VALUE);
    
    const verification = await kv.get<number>(KV_KEY);
    
    return Response.json({
      success: true,
      message: `Contador inicializado com ${INITIAL_VALUE} visualizações`,
      set: INITIAL_VALUE,
      verified: verification,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro ao inicializar contador:', error);
    
    // Fallback: arquivo local
    try {
      const { writeFileSync } = await import('fs');
      const { join } = await import('path');
      const VIEWS_FILE = join(process.cwd(), 'data', 'views.json');
      
      writeFileSync(VIEWS_FILE, JSON.stringify({ calculadora: INITIAL_VALUE }, null, 2));
      
      return Response.json({
        success: true,
        message: `Contador inicializado localmente com ${INITIAL_VALUE}`,
        source: 'local-fallback',
        value: INITIAL_VALUE
      });
      
    } catch (fallbackError) {
      return Response.json({
        success: false,
        error: 'Falha ao inicializar contador',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, { status: 500 });
    }
  }
}