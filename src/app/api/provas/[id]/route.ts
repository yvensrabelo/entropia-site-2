import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-singleton';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log('PATCH /api/provas/[id] - ID:', params.id);
    console.log('Body recebido:', body);
    
    const { titulo, area, subcategoria, instituicao, tipo_prova, ano } = body;
    
    // Debug: verificar o que foi recebido
    console.log('Campos recebidos:', {
      titulo,
      area,
      subcategoria,
      instituicao,
      tipo_prova,
      ano,
      tipo_ano: typeof ano
    });
    
    // Validar ID (UUID string)
    const provaId = params.id;
    if (!provaId || typeof provaId !== 'string') {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    // Verificar se a prova existe primeiro
    const { data: provaExistente, error: checkError } = await supabase
      .from('provas')
      .select('id')
      .eq('id', provaId)
      .single();
    
    if (checkError || !provaExistente) {
      console.error('Prova não encontrada:', checkError);
      return NextResponse.json(
        { error: 'Prova não encontrada' },
        { status: 404 }
      );
    }
    
    // Preparar dados para atualização
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    // Adicionar campos se fornecidos (incluindo valores null)
    if (titulo !== undefined) updateData.titulo = titulo;
    if (area !== undefined) updateData.area = area;
    if (subcategoria !== undefined) updateData.subcategoria = subcategoria;
    if (instituicao !== undefined) updateData.instituicao = instituicao;
    if (tipo_prova !== undefined) updateData.tipo_prova = tipo_prova;
    if (ano !== undefined) {
      // Garantir que ano seja um número inteiro
      updateData.ano = typeof ano === 'string' ? parseInt(ano) : ano;
      console.log('Ano processado:', updateData.ano, 'tipo:', typeof updateData.ano);
    }
    if (body.subtitulo !== undefined) updateData.subtitulo = body.subtitulo;
    if (body.url_prova !== undefined) updateData.url_prova = body.url_prova;
    if (body.url_gabarito !== undefined) updateData.url_gabarito = body.url_gabarito;
    
    console.log('Atualizando prova ID:', provaId, 'com dados:', updateData);
    
    // MÉTODO 1: Update e depois Select separados
    const { error: updateError } = await supabase
      .from('provas')
      .update(updateData)
      .eq('id', provaId);
    
    if (updateError) {
      console.error('Erro ao atualizar:', updateError);
      return NextResponse.json(
        { error: `Erro ao atualizar: ${updateError.message}` },
        { status: 400 }
      );
    }
    
    // Buscar a prova atualizada
    const { data, error: selectError } = await supabase
      .from('provas')
      .select('*')
      .eq('id', provaId)
      .single();
    
    if (selectError) {
      console.error('Erro ao buscar prova atualizada:', selectError);
      return NextResponse.json(
        { error: `Erro ao buscar prova: ${selectError.message}` },
        { status: 400 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { error: 'Prova não encontrada após atualização' },
        { status: 404 }
      );
    }
    
    console.log('Prova atualizada com sucesso:', data);
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Erro na API de provas:', error);
    return NextResponse.json(
      { error: `Erro interno: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const provaId = parseInt(params.id);
    if (isNaN(provaId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('provas')
      .select('*')
      .eq('id', provaId)
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Erro ao buscar prova:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}