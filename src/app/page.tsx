import dynamic from 'next/dynamic'
import { HeroSkeleton } from '@/components/Skeleton'

const DiagonalPageClient = dynamic(
  () => import('./diagonal/DiagonalPageClient'),
  {
    ssr: false,
    loading: () => <HeroSkeleton />,
  }
)

export default function Home() {
  return <DiagonalPageClient />
}