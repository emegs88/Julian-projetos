import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { consultarPrecoFIPE, normalizarMesReferencia } from '@/lib/fipe/brasilapi';
import { parseBRLToNumber } from '@/lib/fipe/parseBRL';

// POST /api/internal/garantia/veiculo - Calcular garantia de veículo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { codigoFipe, multiplicador = 1.30 } = body;

    if (!codigoFipe) {
      return NextResponse.json(
        { error: 'codigoFipe é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar preço atual (usa histórico ou BrasilAPI)
    const response = await fetch(`${request.nextUrl.origin}/api/internal/fipe/price?codigoFipe=${codigoFipe}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar preço FIPE');
    }

    const { valor: fipeAtual, mesReferencia } = await response.json();

    // Calcular garantia
    const garantia = fipeAtual * multiplicador;

    return NextResponse.json({
      codigoFipe,
      fipeAtual,
      garantia,
      multiplicador,
      mesReferencia,
    });
  } catch (error: any) {
    console.error('Erro ao calcular garantia:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao calcular garantia' },
      { status: 500 }
    );
  }
}
