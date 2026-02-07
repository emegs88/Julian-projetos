import { NextRequest, NextResponse } from 'next/server';
import { veiculosCliente } from '@/data/veiculosCliente';
import { buscarFipe } from '@/lib/fipe/buscarFipe';
import { buscarCodigoFipe } from '@/lib/fipe/buscarCodigoFipe';
import { clearAllCache } from '@/lib/fipe/cache';

/**
 * GET /api/fipe/veiculos
 * Retorna lista de veículos do cliente com FIPE atualizada
 * Busca automaticamente códigos FIPE se não existirem
 */
export async function GET(request: NextRequest) {
  try {
    const forcarAtualizacao = request.nextUrl.searchParams.get('atualizar') === 'true';
    const buscarCodigos = request.nextUrl.searchParams.get('buscar_codigos') === 'true';

    const resultados = await Promise.all(
      veiculosCliente.map(async (veiculo) => {
        let fipe: number;
        let mesReferencia: string = '';
        let fonte: 'brasilapi' | 'cache' | 'manual' = 'manual';
        let codigoFipeAtual = veiculo.codigoFipe;

        // Se não tem código FIPE e buscarCodigos está ativo, tentar buscar automaticamente
        if ((!codigoFipeAtual || codigoFipeAtual.trim() === '') && buscarCodigos && veiculo.tipo !== 'maquina') {
          try {
            // Extrair marca e modelo do nome
            const partes = veiculo.nome.split(' ');
            const marca = partes[0];
            const modelo = partes.slice(1).join(' ');
            
            // Determinar tipo
            const tipo: 'carros' | 'caminhoes' = veiculo.tipo === 'caminhao' ? 'caminhoes' : 'carros';
            
            // Buscar código FIPE
            const resultadoBusca = await buscarCodigoFipe(marca, modelo, veiculo.ano, tipo);
            
            if (resultadoBusca.codigoFipe) {
              codigoFipeAtual = resultadoBusca.codigoFipe;
              console.log(`✅ Código FIPE encontrado para ${veiculo.nome}: ${codigoFipeAtual}`);
            } else {
              console.warn(`⚠️ Código FIPE não encontrado para ${veiculo.nome}: ${resultadoBusca.erro}`);
            }
          } catch (error: any) {
            console.error(`Erro ao buscar código FIPE para ${veiculo.nome}:`, error);
          }
        }

        // Se tem código FIPE, buscar preço online
        if (codigoFipeAtual && codigoFipeAtual.trim() !== '') {
          try {
            if (forcarAtualizacao) {
              // Limpar cache para forçar atualização
              clearAllCache();
            }

            const resultado = await buscarFipe(codigoFipeAtual);
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
          codigoFipe: codigoFipeAtual || null,
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
