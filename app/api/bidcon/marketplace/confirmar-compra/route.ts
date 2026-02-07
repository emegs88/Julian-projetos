import { NextRequest, NextResponse } from 'next/server';
import { ConfirmarCompra } from '@/types/bidcon';

const BIDCON_API_URL = process.env.BIDCON_API_URL || 'https://bidcon.vercel.app';
const BIDCON_API_KEY = process.env.BIDCON_API_KEY || '';

/**
 * POST /api/bidcon/marketplace/confirmar-compra
 * Confirma compra de uma cota reservada no BidCon
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar chave de autenticação
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '') || request.headers.get('x-api-key');
    
    if (!apiKey || apiKey !== BIDCON_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized - Chave API inválida' },
        { status: 401 }
      );
    }

    const body: ConfirmarCompra = await request.json();
    const { reservaId, comprador, formaPagamento, comprovanteUrl } = body;

    if (!reservaId || !comprador || !formaPagamento) {
      return NextResponse.json(
        { error: 'reservaId, comprador e formaPagamento são obrigatórios' },
        { status: 400 }
      );
    }

    // Chamar endpoint interno do BidCon
    const response = await fetch(`${BIDCON_API_URL}/api/internal/marketplace/confirmar-compra`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BIDCON_API_KEY}`,
      },
      body: JSON.stringify({
        reservaId,
        comprador,
        formaPagamento,
        comprovanteUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `Erro ao confirmar compra: ${response.statusText}`);
    }

    const resultado = await response.json();

    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Erro ao confirmar compra:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao confirmar compra' },
      { status: 500 }
    );
  }
}
