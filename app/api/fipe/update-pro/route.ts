import { NextRequest, NextResponse } from 'next/server';
import { veiculosCliente } from '@/data/veiculosCliente';
import { resolveCodigoFipe } from '@/lib/fipeResolver';
import { parseBRLToNumber } from '@/lib/normalize';
import {
  getResolvedCode,
  setResolvedCode,
  getDailyCache,
  setDailyCache,
} from '@/lib/fipe/cachePersistente';

const BRASIL_API_BASE = 'https://brasilapi.com.br/api/fipe';

interface VehicleRow {
  id: string;
  tipo: 'carros' | 'caminhoes' | 'maquinas';
  marcaTexto: string;
  modeloTexto: string;
  ano: number;
  fipeAtual?: number;
  codigoFipe?: string;
  mesReferencia?: string;
  fonte: 'api' | 'manual';
  multiplicador: number;
  garantia?: number;
  incluir: boolean;
}

interface UpdateResult {
  id: string;
  ok: boolean;
  fipeAtual?: number;
  garantia?: number;
  codigoFipe?: string;
  mesReferencia?: string;
  erro?: string;
  sugestoes?: Array<{
    marca: string;
    modelo: string;
    ano: string;
    codigoFipe: string;
    score: number;
  }>;
}

/**
 * POST /api/fipe/update-pro
 * Atualiza FIPE automaticamente para todos os veículos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const vehicles: VehicleRow[] = body.vehicles || veiculosCliente.map((v) => {
      // Converter veiculosCliente para VehicleRow
      const partes = v.nome.split(' ');
      const marcaTexto = partes[0] || '';
      const modeloTexto = partes.slice(1).join(' ') || v.nome;
      
      return {
        id: v.id,
        tipo: v.tipo === 'maquina' ? 'maquinas' : (v.tipo === 'caminhao' ? 'caminhoes' : 'carros'),
        marcaTexto,
        modeloTexto,
        ano: v.ano,
        fipeAtual: v.fipeManual,
        codigoFipe: v.codigoFipe,
        fonte: v.fipeManual ? 'manual' : 'api',
        multiplicador: v.multiplicador,
        incluir: false,
      };
    });

    const resultados: UpdateResult[] = [];

    for (let i = 0; i < vehicles.length; i++) {
      const veiculo = vehicles[i];
      
      // Máquinas: manter manual
      if (veiculo.tipo === 'maquinas') {
        resultados.push({
          id: veiculo.id,
          ok: true,
          fipeAtual: veiculo.fipeAtual || 0,
          garantia: (veiculo.fipeAtual || 0) * veiculo.multiplicador,
        });
        continue;
      }

      // Verificar cache de código resolvido
      let codigoFipe: string | undefined = veiculo.codigoFipe;
      
      if (!codigoFipe || codigoFipe.trim() === '') {
        // Tentar buscar do cache persistente
        const cachedCode = getResolvedCode(
          veiculo.marcaTexto,
          veiculo.modeloTexto,
          veiculo.ano,
          veiculo.tipo
        );
        
        if (cachedCode) {
          codigoFipe = cachedCode.codigoFipe;
        } else {
          // Resolver código FIPE automaticamente
          const resolveResult = await resolveCodigoFipe({
            tipo: veiculo.tipo,
            marcaTexto: veiculo.marcaTexto,
            modeloTexto: veiculo.modeloTexto,
            ano: veiculo.ano,
          });

          if ('erro' in resolveResult) {
            resultados.push({
              id: veiculo.id,
              ok: false,
              erro: resolveResult.erro,
              sugestoes: resolveResult.sugestoes,
            });
            continue;
          }

          codigoFipe = resolveResult.codigoFipe;
          
          // Salvar no cache
          setResolvedCode(
            veiculo.marcaTexto,
            veiculo.modeloTexto,
            veiculo.ano,
            veiculo.tipo,
            resolveResult.codigoMarca,
            resolveResult.codigoModelo,
            resolveResult.codigoFipe
          );
        }
      }

      // Verificar cache diário de preço
      const cachedPrice = getDailyCache(codigoFipe);
      let fipe: number;
      let mesReferencia: string;

      if (cachedPrice) {
        // Usar cache
        fipe = cachedPrice.fipe;
        mesReferencia = cachedPrice.mesReferencia;
      } else {
        // Buscar preço da API
        try {
          const response = await fetch(`${BRASIL_API_BASE}/preco/v1/${codigoFipe}`, {
            next: { revalidate: 3600 }, // Cache por 1 hora
          });

          if (!response.ok) {
            throw new Error(`Erro ao buscar preço FIPE: ${response.statusText}`);
          }

          const data = await response.json();
          const precoFipe = Array.isArray(data) ? data[0] : data;

          if (!precoFipe || !precoFipe.valor) {
            throw new Error('Resposta da API inválida');
          }

          fipe = parseBRLToNumber(precoFipe.valor);
          mesReferencia = precoFipe.mesReferencia || '';

          if (fipe === 0) {
            throw new Error(`Valor FIPE inválido: ${precoFipe.valor}`);
          }

          // Salvar no cache diário
          setDailyCache(codigoFipe, fipe, mesReferencia);
        } catch (error: any) {
          console.error(`Erro ao buscar FIPE para ${veiculo.id}:`, error);
          
          // Fallback: usar valor manual se disponível
          if (veiculo.fipeAtual && veiculo.fipeAtual > 0) {
            fipe = veiculo.fipeAtual;
            mesReferencia = '';
            resultados.push({
              id: veiculo.id,
              ok: true,
              fipeAtual: fipe,
              garantia: fipe * veiculo.multiplicador,
              codigoFipe,
              mesReferencia,
            });
            continue;
          } else {
            resultados.push({
              id: veiculo.id,
              ok: false,
              erro: error.message || 'Erro ao buscar FIPE',
            });
            continue;
          }
        }
      }

      // Calcular garantia
      const garantia = fipe * veiculo.multiplicador;

      resultados.push({
        id: veiculo.id,
        ok: true,
        fipeAtual: fipe,
        garantia,
        codigoFipe,
        mesReferencia,
      });
    }

    return NextResponse.json({
      success: true,
      resultados,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Erro ao atualizar FIPE PRO:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao atualizar FIPE',
      },
      { status: 500 }
    );
  }
}
