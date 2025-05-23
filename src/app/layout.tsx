import './globals.css';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
// import SwipeNavigation from '@/app/components/SwipeNavigation';
// import MobileOptimized from '@/app/components/MobileOptimized';
import MobileOptimizedSimple from '@/app/components/MobileOptimizedSimple';
import SwipeNavigationSimple from '@/app/components/SwipeNavigationSimple';
// import Navbar from '@/components/Navbar';
// import ScrollToTopButton from '@/components/ScrollToTopButton';

// 🔤 Configuração da fonte Inter
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata = {
  title: {
    default: 'Entropia - Cursinho Pré-Vestibular',
    template: '%s | Entropia'
  },
  description: 'Seu cursinho pré-vestibular para a aprovação! Prepare-se para PSC, ENEM, SIS e MACRO com nossa metodologia exclusiva e comprovada.',
  keywords: [
    'cursinho pré-vestibular',
    'PSC UFAM',
    'ENEM',
    'SIS UEA', 
    'MACRO',
    'vestibular Amazonas',
    'preparação vestibular',
    'aprovação vestibular',
    'Entropia cursinho',
    'Manaus cursinho',
    'medicina UFAM',
    'engenharia UEA',
    'direito vestibular'
  ],
  authors: [{ name: 'Entropia Cursinho', url: 'https://entropia.edu.br' }],
  creator: 'Entropia Cursinho',
  publisher: 'Entropia Cursinho',
  category: 'education',
  classification: 'education',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://entropia.edu.br',
    title: 'Entropia - Cursinho Pré-Vestibular | #1 em Aprovações',
    description: 'O melhor cursinho pré-vestibular de Manaus. Mais de 850 aprovados em universidades como UFAM, UEA, FURG e UNEMAT. Metodologia exclusiva e comprovada.',
    siteName: 'Entropia Cursinho',
    images: [],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@entropiacursinho',
    creator: '@entropiacursinho',
    title: 'Entropia - Cursinho Pré-Vestibular | #1 em Aprovações',
    description: 'O melhor cursinho pré-vestibular de Manaus. Mais de 850 aprovados!',
    images: [],
  },
  facebook: {
    appId: '1234567890123456', // Substitua pelo seu App ID do Facebook
  },
  instagram: {
    site: '@entropiacursinho',
  },
  alternates: {
    canonical: 'https://entropia.edu.br',
    languages: {
      'pt-BR': 'https://entropia.edu.br',
    },
  },
  manifest: '/manifest.json',
  verification: {
    google: 'sua-chave-de-verificacao-google', // Substitua pela sua chave
    // yandex: 'sua-chave-yandex',
    // bing: 'sua-chave-bing',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  referrer: 'origin-when-cross-origin',
  generator: 'Next.js',
  applicationName: 'Entropia Cursinho',
  bookmarks: ['https://entropia.edu.br/calculadora'],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover', // Important for iPhone notch support
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#16a34a' },
    { media: '(prefers-color-scheme: dark)', color: '#22c55e' }
  ],
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} scroll-smooth`}>
      <head>
        {/* 🚀 Preload de recursos críticos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        
        {/* 🎨 Tema e cores para diferentes dispositivos */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Entropia" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Entropia" />
        
        {/* 🔍 SEO adicional */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="geo.region" content="BR-AM" />
        <meta name="geo.placename" content="Manaus" />
        <meta name="geo.position" content="-3.1190;-60.0217" />
        <meta name="ICBM" content="-3.1190, -60.0217" />
        
        {/* 📊 Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "Entropia Cursinho Pré-Vestibular",
              "description": "O melhor cursinho pré-vestibular de Manaus com mais de 850 aprovados",
              "url": "https://entropia.edu.br",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Rua Exemplo, 123",
                "addressLocality": "Manaus",
                "addressRegion": "AM",
                "postalCode": "69000-000",
                "addressCountry": "BR"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+55-92-99999-9999",
                "contactType": "customer service",
                "availableLanguage": "Portuguese"
              },
              "sameAs": [
                "https://facebook.com/entropiacursinho",
                "https://instagram.com/entropiacursinho",
                "https://youtube.com/entropiacursinho"
              ],
              "offers": {
                "@type": "Offer",
                "description": "Cursos preparatórios para vestibular",
                "category": "Education"
              }
            })
          }}
        />
        
        
      </head>
      
      <body className={`
        ${inter.className}
        bg-black text-white antialiased
        min-h-screen overflow-x-hidden
        selection:bg-green-500/20 selection:text-green-200
      `}>
        <MobileOptimizedSimple>
          <SwipeNavigationSimple>
          {/* 🌟 Background Pattern Sutil */}
          <div className="fixed inset-0 -z-10">
            {/* Gradiente base escuro */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
            
            {/* Grid pattern muito sutil */}
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px'
              }}
            />
            
            {/* Pontos de luz verde muito sutis */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/[0.05] rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/[0.05] rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-400/[0.03] rounded-full blur-3xl" />
          </div>
          
            {/* 🧭 Navegação */}
            {/* <Navbar /> */}
            
            {/* 📄 Conteúdo principal */}
            <main className="relative pt-20 min-h-screen">
              <div className="relative z-10">
                {children}
              </div>
            
            {/* 📊 Rodapé com informações adicionais */}
            <footer className="relative z-10 mt-20 bg-white border-t border-gray-200">
              <div className="container-center py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {/* Logo e descrição */}
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Entropia</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      O melhor cursinho pré-vestibular de Manaus. Mais de 850 aprovados em universidades como UFAM, UEA, FURG e UNEMAT.
                    </p>
                    <div className="flex space-x-4">
                      <a href="https://facebook.com/entropiacursinho" className="text-gray-400 hover:text-green-600 transition-colors">
                        <span className="sr-only">Facebook</span>
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                      <a href="https://instagram.com/entropiacursinho" className="text-gray-400 hover:text-green-600 transition-colors">
                        <span className="sr-only">Instagram</span>
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.897 3.72 13.746 3.72 12.449s.478-2.448 1.297-3.323C5.894 8.198 7.045 7.72 8.342 7.72s2.448.478 3.323 1.297c.877.875 1.297 2.026 1.297 3.323s-.42 2.448-1.297 3.323c-.875.877-2.026 1.297-3.323 1.297z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                  
                  {/* Links úteis */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Links Úteis</h4>
                    <ul className="space-y-2">
                      <li><a href="/sobre" className="text-gray-600 hover:text-green-600 transition-colors">Sobre</a></li>
                      <li><a href="/materiais" className="text-gray-600 hover:text-green-600 transition-colors">Materiais</a></li>
                      <li><a href="/calculadora" className="text-gray-600 hover:text-green-600 transition-colors">Calculadora</a></li>
                      <li><a href="/matricula" className="text-gray-600 hover:text-green-600 transition-colors">Matrícula</a></li>
                    </ul>
                  </div>
                  
                  {/* Contato */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Contato</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>(92) 99999-9999</li>
                      <li>contato@entropia.edu.br</li>
                      <li>Manaus - AM</li>
                    </ul>
                  </div>
                </div>
                
                {/* Copyright */}
                <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                  <p className="text-gray-500 text-sm">
                    © 2024 Entropia Cursinho. Todos os direitos reservados.
                  </p>
                </div>
              </div>
            </footer>
          </main>
          
          {/* 🔝 Botão de voltar ao topo */}
          {/* <ScrollToTopButton /> */}
        
        {/* 🎨 Estilos globais embutidos */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Remove highlight no mobile */
            * {
              -webkit-tap-highlight-color: transparent;
            }
            
            /* Seleção de texto personalizada */
            ::selection {
              background-color: rgba(22, 163, 74, 0.2);
              color: #0f172a;
            }
            
            ::-moz-selection {
              background-color: rgba(22, 163, 74, 0.2);
              color: #0f172a;
            }
            
            /* Scroll suave para âncoras */
            html {
              scroll-padding-top: 80px;
            }
            
            /* Loading state */
            .loading {
              opacity: 0;
              transform: translateY(20px);
              transition: all 0.3s ease;
            }
            
            .loaded {
              opacity: 1;
              transform: translateY(0);
            }
          `
        }} />
        
        
        {/* 🎯 Page Load Performance */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Marcar elementos como carregados
            window.addEventListener('load', function() {
              document.body.classList.add('loaded');
              
              // Lazy loading de imagens
              if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                  entries.forEach(entry => {
                    if (entry.isIntersecting) {
                      const img = entry.target;
                      img.src = img.dataset.src;
                      img.classList.remove('loading');
                      img.classList.add('loaded');
                      imageObserver.unobserve(img);
                    }
                  });
                });
                
                document.querySelectorAll('img[data-src]').forEach(img => {
                  imageObserver.observe(img);
                });
              }
            });
          `
        }} />
        
        {/* 🔍 NoScript fallback */}
        <noscript>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            flexDirection: 'column',
            textAlign: 'center',
            padding: '20px'
          }}>
            <h1 style={{ color: '#16a34a', fontSize: '2rem', marginBottom: '1rem' }}>
              Entropia Cursinho
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.125rem' }}>
              Para melhor experiência, por favor habilite o JavaScript em seu navegador.
            </p>
          </div>
        </noscript>
          </SwipeNavigationSimple>
        </MobileOptimizedSimple>
      </body>
    </html>
  );
}