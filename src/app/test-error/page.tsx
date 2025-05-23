'use client'

export default function TestErrorPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Página de Teste</h1>
      <p>Se você vê esta página, o erro não está aqui.</p>
      
      <div className="mt-8 space-y-4">
        <a href="/" className="block p-4 bg-green-600 rounded-lg hover:bg-green-700">
          Voltar para Home
        </a>
        <a href="/calculadora" className="block p-4 bg-blue-600 rounded-lg hover:bg-blue-700">
          Ir para Calculadora
        </a>
        <a href="/materiais" className="block p-4 bg-purple-600 rounded-lg hover:bg-purple-700">
          Ir para Materiais
        </a>
      </div>
    </div>
  )
}