import { NextRequest, NextResponse } from 'next/server';
import { veiculosCliente } from '@/data/veiculosCliente';
import { getCodigoFipeById } from '@/data/fipeMap';
import { parseBRLToNumber } from '@/lib/fipe/parseBRL';

const BRASIL_API_BASE = 'https://brasilapi.com.br/api/fipe';

interface FipePrecoResponse {
  valor: string; // "R$ 75.000,00"
  marca: string;
  modelo: string;
  anoModelo: number;
  combustivel: string;
  codigoFipe: string;
  mesReferencia: string;
  tipoVeiculo: number;
  siglaCombustivel: string;
  dataConsulta: string;
}

/**
 * GET /api/fipe/update
 * Atualiza valores FIPE de todos os veículos do cliente
 */
export async function GET(request: NextRequest) {
  try {
    const resultados = await Promise.all(
      veiculosCliente.map(async (veiculo) => {
        // Máquinas não têm FIPE oficial
        if (veiculo.tipo === 'maquina') {
          return {
            id: veiculo.id,
            nome: veiculo.nome,
            tipo: veiculo.tipo,
            ano: veiculo.ano,
            fipe: veiculo.fipeManual || 0,
            garantia: (veiculo.fipeManual || 0) * veiculo.multiplicador,
            mesReferencia: '',
            fonte: 'manual' as const,
            codigoFipe: null,
          };
        }

        // Buscar código FIPE
        const codigoFipe = getCodigoFipeById(veiculo.id);
        
        if (!codigoFipe) {
          // Se não tem código FIPE, usar manual se disponível
          const fipe = veiculo.fipeManual || 0;
          return {
            id: veiculo.id,
            nome: veiculo.nome,
            tipo: veiculo.tipo,
            ano: veiculo.ano,
            fipe,
            garantia: fipe * veiculo.multiplicador,
            mesReferencia: '',
            fonte: 'manual' as const,
            codigoFipe: null,
          };
        }

        // Buscar FIPE na BrasilAPI
        try {
          const response = await fetch(`${BRASIL_API_BASE}/preco/v1/${codigoFipe}`, {
            next: { revalidate: 3600 }, // Cache por 1 hora
          });

          if (!response.ok) {
            throw new Error(`Erro ao buscar FIPE: ${response.statusText}`);
          }

          const data: FipePrecoResponse | FipePrecoResponse[] = await response.json();
          
          // A API pode retornar array ou objeto único
          const precoFipe = Array.isArray(data) ? data[0] : data;
          
          if (!precoFipe || !precoFipe.valor) {
            throw new Error('Resposta da API inválida');
          }

          // Converter "R$ 75.000,00" para number
          const fipe = parseBRLToNumber(precoFipe.valor);
          
          if (fipe === 0) {
            throw new Error(`Valor FIPE inválido: ${precoFipe.valor}`);
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
            mesReferencia: precoFipe.mesReferencia || '',
            fonte: 'brasilapi' as const,
            codigoFipe,
          };
        } catch (error: any) {
          console.error(`Erro ao buscar FIPE para ${veiculo.nome} (${codigoFipe}):`, error);
          
          // Fallback: usar FIPE manual se disponível
          const fipe = veiculo.fipeManual || 0;
          return {
            id: veiculo.id,
            nome: veiculo.nome,
            tipo: veiculo.tipo,
            ano: veiculo.ano,
            fipe,
            garantia: fipe * veiculo.multiplicador,
            mesReferencia: '',
            fonte: 'manual' as const,
            codigoFipe,
            erro: error.message,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      veiculos: resultados,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Erro ao atualizar FIPE:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao atualizar FIPE',
      },
      { status: 500 }
    );
  }
}
