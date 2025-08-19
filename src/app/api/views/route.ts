import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { NextRequest } from 'next/server';

const VIEWS_FILE = join(process.cwd(), 'data', 'views.json');

export async function GET() {
  try {
    const data = JSON.parse(readFileSync(VIEWS_FILE, 'utf8'));
    return Response.json({ 
      views: data.calculadora || 0,
      success: true 
    });
  } catch (error) {
    console.error('Erro ao ler views:', error);
    return Response.json({ 
      views: 0, 
      success: false,
      error: 'Falha ao carregar visualizações'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ler dados atuais
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
      message: 'Visualização registrada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar views:', error);
    return Response.json({ 
      error: 'Falha ao registrar visualização',
      success: false
    }, { status: 500 });
  }
}