import CalculadoraDinamica from '@/components/CalculadoraDinamica'
import Layout from '@/components/Layout'

export default function CalculadoraPage() {
  return (
    <Layout>
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-3 sm:p-4 pt-24">
        <CalculadoraDinamica />
      </main>
    </Layout>
  )
}