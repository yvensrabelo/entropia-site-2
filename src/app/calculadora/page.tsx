import CalculadoraDinamica from '@/components/CalculadoraDinamica'
import Layout from '@/components/Layout'

export default function CalculadoraPage() {
  return (
    <Layout>
      <main className="min-h-screen bg-gray-50 pt-20 pb-8">
        <div className="container mx-auto px-4 py-8">
          <CalculadoraDinamica />
        </div>
      </main>
    </Layout>
  )
}