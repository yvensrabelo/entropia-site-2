import type { Metadata } from 'next'
import { Inter, Playfair_Display, Cinzel } from 'next/font/google'
import './globals.css'
import './intro-globals.css'
import { ToastProvider } from '@/contexts/ToastContext'
import IntroPortal from '@/components/IntroPortal'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const cinzel = Cinzel({ 
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['400', '600', '700']
})

export const metadata: Metadata = {
  title: 'Portal do Vestibulando - Entropia',
  description: 'Calculadora de Notas | Banco de Provas',
  keywords: 'vestibular, psc, enem, calculadora de notas, banco de provas, manaus, cursinho, vestibulando',
  authors: [{ name: 'Entropia Cursinho' }],
  creator: 'Entropia',
  publisher: 'Entropia',
  openGraph: {
    title: 'Portal do Vestibulando - Entropia',
    description: 'Calculadora de Notas | Banco de Provas',
    url: 'https://souentropia.com.br',
    siteName: 'Entropia',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portal do Vestibulando - Entropia',
    description: 'Calculadora de Notas | Banco de Provas',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Entropia Cursinho",
  "alternateName": "Portal do Vestibulando - Entropia",
  "url": "https://souentropia.com.br",
  "description": "Calculadora de Notas | Banco de Provas",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Manaus",
    "addressRegion": "AM",
    "addressCountry": "BR"
  },
  "offers": {
    "@type": "Offer",
    "name": "Ferramentas para Vestibulando",
    "description": "Calculadora de Notas e Banco de Provas gratuitos"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;600;700&family=Inter:wght@300;500&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" />
        {/* Desabilitar modo escuro */}
        <meta name="color-scheme" content="only light" />
        <meta name="supported-color-schemes" content="light" />
        {/* Meta tags essenciais para iPhone */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Entropia" />
        {/* Previne zoom no iOS */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${inter.className} ${playfair.variable} ${cinzel.variable} antialiased`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}