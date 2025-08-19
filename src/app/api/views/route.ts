import { kv } from '@vercel/kv';
import { NextRequest } from 'next/server';

const KV_KEY = 'calculadora_views';

export async function GET() {
  try {
    // Buscar contador no Vercel KV
    const views = await kv.get<number>(KV_KEY) ?? 0;
    
    return Response.json({ 
      views,
      success: true,
      source: 'vercel-kv'
    });
  } catch (error) {
    console.error('Erro ao ler views do KV:', error);
    
    // Fallback: tentar ler do arquivo local (desenvolvimento)
    try {
      const { readFileSync } = await import('fs');
      const { join } = await import('path');
      const VIEWS_FILE = join(process.cwd(), 'data', 'views.json');
      const data = JSON.parse(readFileSync(VIEWS_FILE, 'utf8'));
      
      return Response.json({ 
        views: data.calculadora || 0,
        success: true,
        source: 'local-fallback'
      });
    } catch (fallbackError) {
      console.error('Erro no fallback local:', fallbackError);
      return Response.json({ 
        views: 0, 
        success: false,
        error: 'Falha ao carregar visualizações',
        source: 'error'
      });
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Incrementar contador atomicamente no Vercel KV
    const newViews = await kv.incr(KV_KEY);
    
    return Response.json({ 
      views: newViews,
      success: true,
      message: 'Visualização registrada com sucesso',
      source: 'vercel-kv'
    });
  } catch (error) {
    console.error('Erro ao atualizar views no KV:', error);
    
    // Fallback: tentar salvar no arquivo local (desenvolvimento)
    try {
      const { readFileSync, writeFileSync } = await import('fs');
      const { join } = await import('path');
      const VIEWS_FILE = join(process.cwd(), 'data', 'views.json');
      
      let data = { calculadora: 0 };
      try {
        data = JSON.parse(readFileSync(VIEWS_FILE, 'utf8'));
      } catch {
        // Arquivo não existe, usar dados padrão
      }
      
      // Incrementar contador
      data.calculadora = (data.calculadora || 0) + 1;
      
      // Salvar arquivo
      writeFileSync(VIEWS_FILE, JSON.stringify(data, null, 2));
      
      return Response.json({ 
        views: data.calculadora,
        success: true,
        message: 'Visualização registrada com sucesso (local)',
        source: 'local-fallback'
      });
    } catch (fallbackError) {
      console.error('Erro no fallback local:', fallbackError);
      return Response.json({ 
        error: 'Falha ao registrar visualização',
        success: false,
        source: 'error'
      }, { status: 500 });
    }
  }
}