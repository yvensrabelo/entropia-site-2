/**
 * Exemplos de uso do componente MobileOptimized e seus hooks
 */

import React from 'react'
import MobileOptimized, { 
  useIsMobile, 
  useDeviceOrientation, 
  useVirtualKeyboard,
  MobileScrollArea 
} from './MobileOptimized'

// Exemplo 1: Uso básico no layout principal
export function LayoutExample() {
  return (
    <MobileOptimized 
      preventZoom={true}           // Previne zoom indesejado
      allowPullToRefresh={false}   // Desabilita pull-to-refresh
    >
      {/* Seu conteúdo aqui */}
      <div className="min-h-screen">
        <h1>Minha aplicação</h1>
      </div>
    </MobileOptimized>
  )
}

// Exemplo 2: Componente responsivo usando o hook
export function ResponsiveComponent() {
  const { isMobile, isIOS, isAndroid } = useIsMobile()
  
  return (
    <div>
      {isMobile ? (
        <div className="mobile-layout">
          <h2>Versão Mobile</h2>
          {isIOS && <p>Detectamos um dispositivo iOS</p>}
          {isAndroid && <p>Detectamos um dispositivo Android</p>}
        </div>
      ) : (
        <div className="desktop-layout">
          <h2>Versão Desktop</h2>
        </div>
      )}
    </div>
  )
}

// Exemplo 3: Formulário que se ajusta ao teclado virtual
export function AdaptiveForm() {
  const { isKeyboardOpen, keyboardHeight } = useVirtualKeyboard()
  
  return (
    <div 
      className="form-container"
      style={{
        paddingBottom: isKeyboardOpen ? `${keyboardHeight}px` : '0',
        transition: 'padding-bottom 0.3s ease'
      }}
    >
      <input 
        type="text" 
        placeholder="Digite seu nome"
        className="form-input"
      />
      {isKeyboardOpen && (
        <p className="text-sm text-gray-500">
          Teclado aberto ({keyboardHeight}px)
        </p>
      )}
    </div>
  )
}

// Exemplo 4: Modal com área scrollável otimizada
export function MobileModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Modal Title</h3>
          <button onClick={onClose} className="absolute top-4 right-4">
            ✕
          </button>
        </div>
        
        <MobileScrollArea height="50vh" className="p-4">
          {/* Conteúdo scrollável do modal */}
          {[...Array(50)].map((_, i) => (
            <p key={i} className="mb-4">
              Item {i + 1} - Conteúdo do modal que pode ser scrollado
            </p>
          ))}
        </MobileScrollArea>
      </div>
    </div>
  )
}

// Exemplo 5: Componente que muda com orientação
export function OrientationAwareGallery() {
  const orientation = useDeviceOrientation()
  
  return (
    <div className={`gallery ${orientation}`}>
      {orientation === 'portrait' ? (
        <div className="grid grid-cols-1 gap-4">
          {/* Layout vertical */}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {/* Layout horizontal */}
        </div>
      )}
    </div>
  )
}

// Exemplo 6: Uso no layout.tsx principal
export function RootLayoutExample({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <MobileOptimized 
          preventZoom={true}
          allowPullToRefresh={false}
        >
          {children}
        </MobileOptimized>
      </body>
    </html>
  )
}

// Exemplo 7: Página específica com pull-to-refresh habilitado
export function RefreshablePage() {
  return (
    <MobileOptimized 
      preventZoom={true}
      allowPullToRefresh={true}  // Permite pull-to-refresh nesta página
    >
      <div className="min-h-screen p-4">
        <h1>Página com Pull-to-Refresh</h1>
        <p>Puxe para baixo para atualizar</p>
      </div>
    </MobileOptimized>
  )
}