import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth-api';
import { NextRequest } from 'next/server';

// In-memory storage (em produção, usar banco de dados)
let turmasData = {
  packageTitle: 'PACOTE DE PREPARAÇÃO',
  mainTitle: 'ACREDITE EM VOCÊ',
  subtitle: 'SEJA ENTROPIA',
  seriesOptions: [
    {
      serie: '1ª Série',
      turmaName: 'Turma Fundamentos',
      description: 'Construa uma base sólida para sua jornada acadêmica',
      price: 'R$79,90',
      benefits: [
        'Base sólida em todas as matérias',
        'Acompanhamento personalizado',
        'Material didático exclusivo',
        'Simulados mensais'
      ]
    },
    {
      serie: '2ª Série',
      turmaName: 'Turma Aprofundamento',
      description: 'Aprofunde seus conhecimentos e prepare-se para os desafios',
      price: 'R$89,90',
      benefits: [
        'Aprofundamento nas disciplinas',
        'Preparação para processos seriados',
        'Monitoria especializada',
        'Simulados quinzenais'
      ]
    },
    {
      serie: '3ª Série',
      turmaName: 'Turma Intensiva Vestibular',
      description: 'Foco total na aprovação dos seus sonhos',
      price: 'R$99,90',
      benefits: [
        'Foco total em vestibulares',
        'Revisão completa do ensino médio',
        'Simulados semanais',
        'Correção de redação ilimitada'
      ]
    },
    {
      serie: 'Formado',
      turmaName: 'Turma Medicina',
      description: 'Preparação especializada para os cursos mais concorridos',
      price: 'R$129,90',
      benefits: [
        'Foco 100% em Medicina',
        'Mentoria com aprovados',
        'Simulados específicos por universidade',
        'Redação médica especializada',
        'Material direcionado para alta performance'
      ]
    }
  ],
  ctaText: 'Matricule-se Agora',
  gradient: 'linear-gradient(135deg, rgb(25, 44, 38) 0%, rgb(92, 200, 133) 100%)'
};

export async function GET(request: NextRequest) {
  // Check authentication
  const authResult = await verifyAdminAuth(request);
  if (!authResult.isValid) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }
  
  return NextResponse.json(turmasData);
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    const data = await request.json();
    turmasData = { ...turmasData, ...data };
    return NextResponse.json({ success: true, data: turmasData });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao salvar dados' },
      { status: 400 }
    );
  }
}