import { NextRequest, NextResponse } from 'next/server';
import { EvolutionAPIClient } from '@/lib/evolution-api';

export async function GET(request: NextRequest) {
  try {
    const client = await EvolutionAPIClient.fromDatabase();
    
    if (!client) {
      return NextResponse.json(
        { error: 'WhatsApp não configurado' },
        { status: 500 }
      );
    }

    const qrData = await client.getQRCode();
    
    return NextResponse.json({
      qrcode: qrData.qrcode?.base64 || qrData.qr || qrData.qrcode,
      instance: qrData.instance,
      message: 'QR Code gerado com sucesso'
    });

  } catch (error: any) {
    console.error('Erro ao obter QR Code:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao obter QR Code' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { server_url, api_key, instance_name } = body;

    if (!server_url || !api_key || !instance_name) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Criar cliente com as configurações fornecidas
    const client = new EvolutionAPIClient({
      server_url,
      api_key,
      instance_name
    });

    // Primeiro verificar o status
    try {
      const status = await client.checkStatus();
      
      if (status.connected) {
        return NextResponse.json({
          connected: true,
          message: 'WhatsApp já está conectado'
        });
      }
    } catch (err) {
      // Ignorar erro se a instância não existir
      console.log('Instância pode não existir ainda');
    }

    // Obter QR Code
    const qrData = await client.getQRCode();
    
    // Extrair o QR code e o pairing code dos dados retornados
    let qrcode = '';
    let pairingCode = '';
    
    if (qrData.qrcode) {
      qrcode = qrData.qrcode.base64 || qrData.qrcode;
    } else if (qrData.qr) {
      qrcode = qrData.qr;
    } else if (qrData.code) {
      qrcode = qrData.code;
    }
    
    if (qrData.pairingCode) {
      pairingCode = qrData.pairingCode;
    }
    
    return NextResponse.json({
      qrcode,
      pairingCode,
      instance: qrData.instance,
      connected: false,
      message: 'QR Code gerado com sucesso'
    });

  } catch (error: any) {
    console.error('Erro ao obter QR Code:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao obter QR Code' },
      { status: 500 }
    );
  }
}