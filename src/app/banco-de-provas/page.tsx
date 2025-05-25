import { Metadata } from 'next';
import ProvasList from '@/components/banco-provas/ProvasList';

export const metadata: Metadata = {
  title: 'Banco de Provas | Entropia Cursinho',
  description: 'Acesse provas anteriores de vestibulares da região'
};

export default function BancoDeProvasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Banco de Provas
        </h1>
        <p className="text-gray-600 mb-8">
          Acesse provas anteriores dos principais vestibulares
        </p>
        
        <ProvasList />
      </div>
    </div>
  );
}