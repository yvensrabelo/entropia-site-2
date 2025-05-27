'use client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('🔍 Admin Layout - Renderizando')
  
  // Temporariamente desabilitado para debug
  return <>{children}</>;
}