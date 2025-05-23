import dynamic from 'next/dynamic'

const DiagonalPageClient = dynamic(
  () => import('./DiagonalPageClient'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 text-2xl animate-pulse">Carregando...</div>
      </div>
    ),
  }
)

export default function DiagonalPage() {
  return <DiagonalPageClient />
}