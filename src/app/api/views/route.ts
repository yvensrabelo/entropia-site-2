import { kv } from '@vercel/kv';
import { NextRequest } from 'next/server';

const KV_KEY = 'calculadora_views';
const INITIAL_VIEWS = 4692; // Valor base para somar

export async function GET() {
  try {
    // Buscar contador no Vercel KV
    const kvViews = await kv.get<number>(KV_KEY) ?? 0;
    const totalViews = INITIAL_VIEWS + kvViews;
    
    return Response.json({ 
      views: totalViews,
      success: true,
      source: 'vercel-kv',
      breakdown: {
        initial: INITIAL_VIEWS,
        kv: kvViews,
        total: totalViews
      }
    });
  } catch (error) {
    console.error('Erro ao ler views do KV:', error);
    
    // Fallback: tentar ler do arquivo local (desenvolvimento)
    try {
      const { readFileSync } = await import('fs');
      const { join } = await import('path');
      const VIEWS_FILE = join(process.cwd(), 'data', 'views.json');
      const data = JSON.parse(readFileSync(VIEWS_FILE, 'utf8'));
      
      const localViews = data.calculadora || 0;
      const totalViews = INITIAL_VIEWS + localViews;
      
      return Response.json({ 
        views: totalViews,
        success: true,
        source: 'local-fallback',
        breakdown: {
          initial: INITIAL_VIEWS,
          local: localViews,
          total: totalViews
        }
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
    const kvViews = await kv.incr(KV_KEY);
    const totalViews = INITIAL_VIEWS + kvViews;
    
    return Response.json({ 
      views: totalViews,
      success: true,
      message: 'Visualização registrada com sucesso',
      source: 'vercel-kv',
      breakdown: {
        initial: INITIAL_VIEWS,
        kv: kvViews,
        total: totalViews
      }
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
      
      const totalViews = INITIAL_VIEWS + data.calculadora;
      
      return Response.json({ 
        views: totalViews,
        success: true,
        message: 'Visualização registrada com sucesso (local)',
        source: 'local-fallback',
        breakdown: {
          initial: INITIAL_VIEWS,
          local: data.calculadora,
          total: totalViews
        }
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