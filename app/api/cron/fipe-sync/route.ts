import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { consultarPrecoFIPE, normalizarMesReferencia } from '@/lib/fipe/brasilapi';
import { parseBRLToNumber } from '@/lib/fipe/parseBRL';

/**
 * CRON Job para sincronização automática de preços FIPE
 * Configurar no vercel.json para rodar 1x por mês
 */
export async function GET(request: NextRequest) {
  // Verificar se é uma chamada autorizada (Vercel Cron)
  // Vercel envia um header 'x-vercel-cron' ou podemos usar CRON_SECRET
  const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '');
  const vercelCron = request.headers.get('x-vercel-cron');
  
  // Permitir se for do Vercel ou se tiver o secret correto
  if (!vercelCron && cronSecret !== process.env.CRON_SECRET) {
    // Em desenvolvimento, permitir sem autenticação
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ CRON executado sem autenticação (modo desenvolvimento)');
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    // Buscar todos os veículos ativos na watchlist
    const veiculos = await prisma.vehicleWatchlist.findMany({
      where: { ativo: true },
    });

    if (veiculos.length === 0) {
      return NextResponse.json({
        message: 'Nenhum veículo ativo na watchlist',
        sincronizados: 0,
        erros: 0,
      });
    }

    let sincronizados = 0;
    let erros = 0;
    const errosDetalhes: string[] = [];

    // Sincronizar cada veículo
    for (const veiculo of veiculos) {
      try {
        // Consultar preço na BrasilAPI
        const precoFIPE = await consultarPrecoFIPE(veiculo.codigoFipe);

        // Normalizar valor
        const valor = parseBRLToNumber(precoFIPE.valor);
        if (valor === 0) {
          throw new Error(`Valor FIPE inválido: ${precoFIPE.valor}`);
        }

        // Normalizar mesReferencia
        const mesReferencia = normalizarMesReferencia(precoFIPE.mesReferencia);

        // Verificar se já existe histórico para este mês
        const historicoExistente = await prisma.fipePriceHistory.findUnique({
          where: {
            vehicleId_mesReferencia: {
              vehicleId: veiculo.id,
              mesReferencia,
            },
          },
        });

        if (historicoExistente) {
          // Atualizar se já existe
          await prisma.fipePriceHistory.update({
            where: { id: historicoExistente.id },
            data: {
              valor,
              raw: JSON.stringify(precoFIPE),
              fetchedAt: new Date(),
            },
          });
        } else {
          // Criar novo histórico
          await prisma.fipePriceHistory.create({
            data: {
              vehicleId: veiculo.id,
              codigoFipe: veiculo.codigoFipe,
              mesReferencia,
              valor,
              raw: JSON.stringify(precoFIPE),
            },
          });
        }

        sincronizados++;
      } catch (error: any) {
        erros++;
        const erroMsg = `Erro ao sincronizar ${veiculo.marca} ${veiculo.modelo} (${veiculo.codigoFipe}): ${error.message}`;
        errosDetalhes.push(erroMsg);
        console.error(erroMsg, error);
        // Continuar com os próximos veículos
      }
    }

    return NextResponse.json({
      message: 'Sincronização automática concluída',
      total: veiculos.length,
      sincronizados,
      erros,
      errosDetalhes: errosDetalhes.length > 0 ? errosDetalhes : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Erro na sincronização automática:', error);
    return NextResponse.json(
      { error: error.message || 'Erro na sincronização automática' },
      { status: 500 }
    );
  }
}
