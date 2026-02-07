import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { consultarPrecoFIPE, normalizarMesReferencia } from '@/lib/fipe/brasilapi';
import { parseBRLToNumber } from '@/lib/fipe/parseBRL';

// GET /api/internal/fipe/price?codigoFipe=XXX - Retorna preço atual
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const codigoFipe = searchParams.get('codigoFipe');

    if (!codigoFipe) {
      return NextResponse.json(
        { error: 'codigoFipe é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar veículo na watchlist pelo codigoFipe
    const veiculo = await prisma.vehicleWatchlist.findFirst({
      where: { codigoFipe },
      include: {
        priceHistory: {
          orderBy: { fetchedAt: 'desc' },
          take: 1,
        },
      },
    });

    // Se existe histórico recente (últimos 30 dias), usar ele
    if (veiculo && veiculo.priceHistory.length > 0) {
      const ultimoPreco = veiculo.priceHistory[0];
      const diasDesdeAtualizacao = Math.floor(
        (Date.now() - ultimoPreco.fetchedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Se foi atualizado há menos de 30 dias, usar histórico
      if (diasDesdeAtualizacao < 30) {
        return NextResponse.json({
          valor: ultimoPreco.valor,
          mesReferencia: ultimoPreco.mesReferencia,
          fonte: 'historico',
          fetchedAt: ultimoPreco.fetchedAt,
        });
      }
    }

    // Se não existe histórico ou está desatualizado, buscar na BrasilAPI
    try {
      const precoFIPE = await consultarPrecoFIPE(codigoFipe);
      const valor = parseBRLToNumber(precoFIPE.valor);
      const mesReferencia = normalizarMesReferencia(precoFIPE.mesReferencia);

      // Salvar no histórico se existe veículo na watchlist
      if (veiculo) {
        const historicoExistente = await prisma.fipePriceHistory.findUnique({
          where: {
            vehicleId_mesReferencia: {
              vehicleId: veiculo.id,
              mesReferencia,
            },
          },
        });

        if (!historicoExistente) {
          await prisma.fipePriceHistory.create({
            data: {
              vehicleId: veiculo.id,
              codigoFipe,
              mesReferencia,
              valor,
              raw: JSON.stringify(precoFIPE),
            },
          });
        }
      }

      return NextResponse.json({
        valor,
        mesReferencia,
        fonte: 'brasilapi',
        fetchedAt: new Date(),
      });
    } catch (error: any) {
      console.error('Erro ao buscar preço na BrasilAPI:', error);
      // Se falhar e tiver histórico, retornar histórico mesmo desatualizado
      if (veiculo && veiculo.priceHistory.length > 0) {
        const ultimoPreco = veiculo.priceHistory[0];
        return NextResponse.json({
          valor: ultimoPreco.valor,
          mesReferencia: ultimoPreco.mesReferencia,
          fonte: 'historico-desatualizado',
          fetchedAt: ultimoPreco.fetchedAt,
          aviso: 'Preço pode estar desatualizado',
        });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Erro ao buscar preço FIPE:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar preço FIPE' },
      { status: 500 }
    );
  }
}
