import { NextResponse } from 'next/server';

// Dados mockados para teste
const mockStudents = [
  "IANDRA LIVIA DE SOUZA CUNHA",
  "ANA CLARA BEZERRA RODRIGUES", 
  "PEDRO GABRIEL PINTO DIAS",
  "MARIA CLARA DE CARVALHO CALDAS",
  "YVENS RABELO"
];

const mockMessages = [
  "LIBERADO (FIN.EXTERNO)",
  "LIBERADO (MATRICULA ATIVA)",
  "LIBERADO",
  "BLOQUEADO (INADIMPLENTE)",
  "BLOQUEADO (SEM CADASTRO)"
];

export async function GET() {
  // Gera dados aleatórios
  const randomStudent = mockStudents[Math.floor(Math.random() * mockStudents.length)];
  const randomAccess = Math.random() > 0.2 ? 1 : 0; // 80% de chance de ser liberado
  const randomMessage = randomAccess === 1 
    ? mockMessages.filter(m => m.includes('LIBERADO'))[Math.floor(Math.random() * 3)]
    : mockMessages.filter(m => m.includes('BLOQUEADO'))[Math.floor(Math.random() * 2)];
  
  const mockData = {
    enrollid: Math.floor(Math.random() * 200) + 1,
    nome: randomStudent,
    time: new Date().toISOString().replace('T', ' ').slice(0, 19),
    access: randomAccess,
    message: randomMessage
  };
  
  try {
    // Faz a chamada para o webhook
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhook/catraca`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockData)
    });
    
    const result = await response.json();
    
    return NextResponse.json({
      testData: mockData,
      webhookResponse: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Erro ao testar webhook',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      testData: mockData
    }, { status: 500 });
  }
}

// POST para testar com dados específicos
export async function POST(request: Request) {
  try {
    const customData = await request.json();
    
    // Merge com dados padrão
    const testData = {
      enrollid: customData.enrollid || 99,
      nome: customData.nome || "TESTE MANUAL",
      time: customData.time || new Date().toISOString().replace('T', ' ').slice(0, 19),
      access: customData.access !== undefined ? customData.access : 1,
      message: customData.message || "TESTE MANUAL"
    };
    
    // Faz a chamada para o webhook
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhook/catraca`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    return NextResponse.json({
      testData,
      webhookResponse: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Erro ao testar webhook',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}