export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Página de Teste</h1>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow mb-4">
          <h2 className="text-2xl font-semibold mb-2">Teste 1</h2>
          <p>Esta é uma página de teste simples para verificar se o Next.js está funcionando.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow mb-4">
          <h2 className="text-2xl font-semibold mb-2">Teste 2</h2>
          <p>Se você consegue ver esta página, o servidor está rodando corretamente.</p>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-2">Sucesso!</h2>
          <p>O Next.js está funcionando na porta 3000.</p>
        </div>
      </div>
    </div>
  )
}