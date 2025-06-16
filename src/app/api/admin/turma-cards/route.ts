import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch turma card data
export async function GET(request: Request) {
  try {
    // Check authentication
    const cookieStore = cookies();
    const adminData = cookieStore.get('entropia_admin')?.value;
    
    if (!adminData) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const turmaId = searchParams.get('turmaId');

    if (turmaId) {
      // Fetch specific turma card
      const { data, error } = await supabase
        .from('turma_cards')
        .select('*')
        .eq('turma_id', turmaId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return NextResponse.json({ data });
    } else {
      // Fetch all turma cards
      const { data, error } = await supabase
        .from('turma_cards')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        throw error;
      }

      return NextResponse.json({ data });
    }
  } catch (error) {
    console.error('Erro ao buscar turma cards:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados' },
      { status: 500 }
    );
  }
}

// POST - Save/update turma card data
export async function POST(request: Request) {
  try {
    // Check authentication
    const cookieStore = cookies();
    const adminData = cookieStore.get('entropia_admin')?.value;
    
    if (!adminData) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { turmaId, cardData } = body;

    if (!turmaId || !cardData) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Check if card exists
    const { data: existingCard } = await supabase
      .from('turma_cards')
      .select('id')
      .eq('turma_id', turmaId)
      .single();

    let result;
    if (existingCard) {
      // Update existing card
      result = await supabase
        .from('turma_cards')
        .update({
          ...cardData,
          updated_at: new Date().toISOString()
        })
        .eq('turma_id', turmaId)
        .select()
        .single();
    } else {
      // Insert new card
      result = await supabase
        .from('turma_cards')
        .insert({
          turma_id: turmaId,
          ...cardData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Erro ao salvar turma card:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar dados' },
      { status: 500 }
    );
  }
}

// DELETE - Remove turma card
export async function DELETE(request: Request) {
  try {
    // Check authentication
    const cookieStore = cookies();
    const adminData = cookieStore.get('entropia_admin')?.value;
    
    if (!adminData) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const turmaId = searchParams.get('turmaId');

    if (!turmaId) {
      return NextResponse.json(
        { error: 'ID da turma não fornecido' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('turma_cards')
      .delete()
      .eq('turma_id', turmaId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar turma card:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar dados' },
      { status: 500 }
    );
  }
}