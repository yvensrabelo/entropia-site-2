'use client'

import dynamic from 'next/dynamic'

const ScrollToTopButton = dynamic(() => import('./ScrollToTopButton'), {
  ssr: false
})

export default function ScrollToTopButtonWrapper() {
  return <ScrollToTopButton />
}