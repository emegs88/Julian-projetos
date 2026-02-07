import { NextRequest, NextResponse } from 'next/server';
import { ReservaCota } from '@/types/bidcon';

const BIDCON_API_URL = process.env.BIDCON_API_URL || 'https://bidcon.vercel.app';
const BIDCON_API_KEY = process.env.BIDCON_API_KEY || '';

/**
 * POST /api/bidcon/marketplace/reservar
 * Reserva uma cota no BidCon (requer chave interna)
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

    const body: ReservaCota = await request.json();
    const { cartaId, reservadoPor, ttlMinutos = 30 } = body;

    if (!cartaId || !reservadoPor) {
      return NextResponse.json(
        { error: 'cartaId e reservadoPor são obrigatórios' },
        { status: 400 }
      );
    }

    // Chamar endpoint interno do BidCon
    const response = await fetch(`${BIDCON_API_URL}/api/internal/marketplace/reservar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BIDCON_API_KEY}`,
      },
      body: JSON.stringify({
        cartaId,
        reservadoPor,
        ttlMinutos,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `Erro ao reservar cota: ${response.statusText}`);
    }

    const resultado = await response.json();

    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Erro ao reservar cota:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao reservar cota' },
      { status: 500 }
    );
  }
}
