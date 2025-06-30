import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cpf = searchParams.get('cpf');

  if (!cpf) {
    return NextResponse.json({ error: 'CPF não fornecido.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .rpc('minutos_do_mes', { cpf_input: cpf });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ minutos: data });
}
