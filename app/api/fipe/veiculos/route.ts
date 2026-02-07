import { NextRequest, NextResponse } from 'next/server';
import { veiculosCliente } from '@/data/veiculosCliente';
import { buscarFipe } from '@/lib/fipe/buscarFipe';
import { clearAllCache } from '@/lib/fipe/cache';

/**
 * GET /api/fipe/veiculos
 * Retorna lista de veículos do cliente com FIPE atualizada
 */
export async function GET(request: NextRequest) {
  try {
    const forcarAtualizacao = request.nextUrl.searchParams.get('atualizar') === 'true';

    const resultados = await Promise.all(
      veiculosCliente.map(async (veiculo) => {
        let fipe: number;
        let mesReferencia: string = '';
        let fonte: 'brasilapi' | 'cache' | 'manual' = 'manual';

        // Se tem código FIPE, buscar online
        if (veiculo.codigoFipe && veiculo.codigoFipe.trim() !== '') {
          try {
            if (forcarAtualizacao) {
              // Limpar cache para forçar atualização
              clearAllCache();
            }

            const resultado = await buscarFipe(veiculo.codigoFipe);
            fipe = resultado.fipe;
            mesReferencia = resultado.mesReferencia;
            fonte = resultado.fonte;
          } catch (error: any) {
            console.error(`Erro ao buscar FIPE para ${veiculo.nome}:`, error);
            // Se falhar e tiver fipeManual, usar ele
            if (veiculo.fipeManual) {
              fipe = veiculo.fipeManual;
              fonte = 'manual';
            } else {
              fipe = 0; // Erro: não conseguiu buscar e não tem manual
            }
          }
        } else if (veiculo.fipeManual) {
          // Usar FIPE manual (máquinas, etc)
          fipe = veiculo.fipeManual;
          fonte = 'manual';
        } else {
          // Sem FIPE disponível
          fipe = 0;
          fonte = 'manual';
        }

        // Calcular garantia
        const garantia = fipe * veiculo.multiplicador;

        return {
          id: veiculo.id,
          nome: veiculo.nome,
          tipo: veiculo.tipo,
          ano: veiculo.ano,
          fipe,
          garantia,
          mesReferencia,
          fonte,
          multiplicador: veiculo.multiplicador,
        };
      })
    );

    return NextResponse.json(resultados);
  } catch (error: any) {
    console.error('Erro ao buscar FIPE dos veículos:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar FIPE dos veículos' },
      { status: 500 }
    );
  }
}
