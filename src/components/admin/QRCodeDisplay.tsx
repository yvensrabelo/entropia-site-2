'use client';

import { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { WifiOff, RefreshCw, Check, Copy, Loader2 } from 'lucide-react';

interface QRCodeDisplayProps {
  instanceName: string;
  serverUrl: string;
  apiKey: string;
  onConnected?: () => void;
}

export function QRCodeDisplay({ instanceName, serverUrl, apiKey, onConnected }: QRCodeDisplayProps) {
  const [qrCode, setQrCode] = useState<string>('');
  const [pairingCode, setPairingCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const fetchQRCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/whatsapp/qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceName,
          serverUrl,
          apiKey
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar QR Code');
      }

      if (data.connected) {
        onConnected?.();
        return;
      }

      // Log para debug
      console.log('QRCodeDisplay received:', {
        hasQrcode: !!data.qrcode,
        qrcodeLength: data.qrcode?.length,
        pairingCode: data.pairingCode
      });
      
      setQrCode(data.qrcode || '');
      setPairingCode(data.pairingCode || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar QR Code');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCode();
    // Atualizar QR Code a cada 5 segundos para verificar se conectou
    const interval = setInterval(fetchQRCode, 5000);
    return () => clearInterval(interval);
  }, [instanceName, serverUrl, apiKey]);

  const copyPairingCode = () => {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="mt-4 text-gray-600">Carregando QR Code...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 bg-red-50 border-red-200">
        <div className="flex flex-col items-center justify-center text-center">
          <WifiOff className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-700 font-medium mb-4">{error}</p>
          <Button onClick={fetchQRCode} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Escaneie o QR Code
          </h3>
          <p className="text-sm text-gray-600">
            Use o WhatsApp no seu celular para escanear este código
          </p>
        </div>

        {qrCode && (
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <img
                src={qrCode}
                alt="QR Code do WhatsApp"
                className="w-64 h-64"
              />
            </div>
          </div>
        )}

        {pairingCode && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Código de Pareamento</p>
                <p className="text-lg font-mono text-gray-900">{pairingCode}</p>
              </div>
              <Button
                onClick={copyPairingCode}
                variant="outline"
                size="sm"
                className="ml-4"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Como conectar:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Abra o WhatsApp no seu celular</li>
            <li>Toque em Mais opções (⋮) &gt; Dispositivos conectados</li>
            <li>Toque em Conectar dispositivo</li>
            <li>Escaneie este QR Code com seu celular</li>
          </ol>
        </div>

        <div className="flex justify-center">
          <Button onClick={fetchQRCode} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar QR Code
          </Button>
        </div>
      </div>
    </Card>
  );
}