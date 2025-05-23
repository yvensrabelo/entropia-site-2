import dynamic from 'next/dynamic'
import { SimpleHeroSkeleton } from '@/components/SimpleSkeleton'

const DiagonalPageClient = dynamic(
  () => import('./diagonal/DiagonalPageClient'),
  {
    ssr: false,
    loading: () => <SimpleHeroSkeleton />,
  }
)

export default function Home() {
  return <DiagonalPageClient />
}