import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/contexts/ToastContext'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Entropia Cursinho | PSC UFAM, ENEM, SIS UEA, MACRO | +850 Aprovações',
  description: 'Cursinho pré-vestibular em Manaus com mais de 850 aprovações. Prepare-se para PSC UFAM, ENEM, SIS UEA e MACRO com o melhor material e professores.',
  keywords: 'cursinho manaus, psc ufam, enem, sis uea, macro, vestibular manaus, cursinho pré-vestibular',
  openGraph: {
    title: 'Entropia Cursinho - +850 Aprovações em Vestibulares',
    description: 'O cursinho que mais aprova em Manaus. PSC, ENEM, SIS, MACRO.',
    url: 'https://entropiacursinho.com.br',
    siteName: 'Entropia Cursinho',
    locale: 'pt_BR',
    type: 'website',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${inter.className} antialiased bg-black text-white`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}