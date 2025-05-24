import Link from 'next/link'

export default function SafePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Navbar simples */}
      <nav className="fixed top-0 w-full z-50 bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <Link href="/" className="text-white font-black text-3xl">
            ENTROPIA
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/sobre" className="text-white hover:text-green-200 transition">Sobre</Link>
            <Link href="/materiais" className="text-white hover:text-green-200 transition">Materiais</Link>
            <Link href="/calculadora" className="text-white hover:text-green-200 transition">Calculadora</Link>
            <Link href="/contato" className="text-white hover:text-green-200 transition">Contato</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8">
            <div>SUA</div>
            <div className="text-green-400">APROVAÇÃO</div>
            <div>COMEÇA AQUI</div>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto mb-12">
            O cursinho que mais aprova em Manaus. Prepare-se para{' '}
            <span className="text-green-400 font-semibold">PSC UFAM</span>,{' '}
            <span className="text-green-400 font-semibold">ENEM</span>,{' '}
            <span className="text-green-400 font-semibold">SIS UEA</span> e{' '}
            <span className="text-green-400 font-semibold">MACRO</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculadora">
              <button className="px-8 py-4 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                Calcular Nota de Corte
              </button>
            </Link>
            
            <Link href="/materiais">
              <button className="px-8 py-4 text-lg font-semibold border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all duration-300">
                Banco de Provas
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}