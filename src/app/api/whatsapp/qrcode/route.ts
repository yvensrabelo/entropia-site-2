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