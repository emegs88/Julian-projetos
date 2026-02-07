import { NextRequest, NextResponse } from 'next/server';
import { veiculosCliente } from '@/data/veiculosCliente';
import { buscarFipe } from '@/lib/fipe/buscarFipe';
import { clearAllCache } from '@/lib/fipe/cache';

/**
 * GET /api/fipe/cron
 * CRON job para atualizar FIPE 1x por dia
 * Limpa cache e busca valores atualizados
 */
export async function GET(request: NextRequest) {
  // Verificar se é uma chamada autorizada (Vercel Cron)
  const vercelCron = request.headers.get('x-vercel-cron');
  const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '');
  
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
    // Limpar cache para forçar atualização
    clearAllCache();

    let atualizados = 0;
    let erros = 0;
    const errosDetalhes: string[] = [];

    // Atualizar FIPE de cada veículo que tem código FIPE
    for (const veiculo of veiculosCliente) {
      if (veiculo.codigoFipe && veiculo.codigoFipe.trim() !== '') {
        try {
          await buscarFipe(veiculo.codigoFipe);
          atualizados++;
        } catch (error: any) {
          erros++;
          errosDetalhes.push(`${veiculo.nome}: ${error.message}`);
          console.error(`Erro ao atualizar FIPE de ${veiculo.nome}:`, error);
        }
      }
    }

    return NextResponse.json({
      message: 'Atualização de FIPE concluída',
      timestamp: new Date().toISOString(),
      total: veiculosCliente.filter((v) => v.codigoFipe && v.codigoFipe.trim() !== '').length,
      atualizados,
      erros,
      errosDetalhes: errosDetalhes.length > 0 ? errosDetalhes : undefined,
    });
  } catch (error: any) {
    console.error('Erro na atualização automática de FIPE:', error);
    return NextResponse.json(
      { error: error.message || 'Erro na atualização automática de FIPE' },
      { status: 500 }
    );
  }
}
