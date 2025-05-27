'use client';

import React, { useEffect, useState } from 'react';
import { Clock, LogOut, RefreshCw, AlertTriangle } from 'lucide-react';

interface InactivityModalProps {
  isOpen: boolean;
  timeRemaining: number; // em segundos
  onContinue: () => void;
  onLogout: () => void;
}

export default function InactivityModal({ 
  isOpen, 
  timeRemaining, 
  onContinue, 
  onLogout 
}: InactivityModalProps) {
  const [countdown, setCountdown] = useState(timeRemaining);

  useEffect(() => {
    setCountdown(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onLogout(); // Auto-logout quando countdown chegar a 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onLogout]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-red-200">
        {/* Ícone de aviso */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Sessão Expirando
        </h2>

        {/* Mensagem */}
        <p className="text-gray-600 text-center mb-6">
          Sua sessão expirará em <span className="font-bold text-red-600">{formatTime(countdown)}</span> por inatividade.
        </p>

        {/* Contador visual */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-3">
            <Clock className="w-6 h-6 text-red-500" />
            <div className="text-3xl font-mono font-bold text-red-600">
              {formatTime(countdown)}
            </div>
          </div>
          
          {/* Barra de progresso */}
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ 
                width: `${(countdown / (5 * 60)) * 100}%` // Assumindo 5 minutos de aviso
              }}
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            onClick={onContinue}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Continuar Sessão
          </button>
          
          <button
            onClick={onLogout}
            className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Sair Agora
          </button>
        </div>

        {/* Texto de ajuda */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Para continuar trabalhando, clique em "Continuar Sessão" ou mova o mouse.
        </p>
      </div>
    </div>
  );
}