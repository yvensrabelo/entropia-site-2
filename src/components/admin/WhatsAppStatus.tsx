'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function WhatsAppStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Verifica a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/status');
      const data = await response.json();
      setStatus(data.connected ? 'connected' : 'disconnected');
    } catch (error) {
      setStatus('disconnected');
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'WhatsApp Conectado';
      case 'disconnected':
        return 'WhatsApp Desconectado';
      default:
        return 'Verificando...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'disconnected':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Link
      href="/admin/dashboard/whatsapp/configuracao"
      className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      title={getStatusText()}
    >
      <MessageSquare className="w-4 h-4 text-gray-600" />
      {getIcon()}
      <span className={`text-sm font-medium hidden md:inline ${getStatusColor()}`}>
        {status === 'connected' ? 'Conectado' : status === 'disconnected' ? 'Desconectado' : '...'}
      </span>
    </Link>
  );
}