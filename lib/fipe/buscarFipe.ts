/**
 * Buscar FIPE da BrasilAPI
 */

import { consultarPrecoFIPE } from './brasilapi';
import { parseBRLToNumber } from './parseBRL';
import { getCache, setCache } from './cache';

export interface ResultadoFIPE {
  fipe: number;
  mesReferencia: string;
  fonte: 'brasilapi' | 'cache' | 'manual';
}

/**
 * Busca FIPE online ou retorna do cache
 */
export async function buscarFipe(codigoFipe: string): Promise<ResultadoFIPE> {
  // Verificar cache primeiro
  const cached = getCache(codigoFipe);
  if (cached) {
    return {
      fipe: cached.valor,
      mesReferencia: cached.mesReferencia,
      fonte: 'cache',
    };
  }

  // Buscar na BrasilAPI
  try {
    const precoFIPE = await consultarPrecoFIPE(codigoFipe);
    const valor = parseBRLToNumber(precoFIPE.valor);
    
    if (valor === 0) {
      throw new Error(`Valor FIPE inválido: ${precoFIPE.valor}`);
    }

    // Normalizar mesReferencia
    const mesReferencia = normalizarMesReferencia(precoFIPE.mesReferencia);

    // Salvar no cache
    setCache(codigoFipe, valor, mesReferencia);

    return {
      fipe: valor,
      mesReferencia,
      fonte: 'brasilapi',
    };
  } catch (error: any) {
    console.error(`Erro ao buscar FIPE para ${codigoFipe}:`, error);
    throw error;
  }
}

/**
 * Normalizar mesReferencia para formato YYYY-MM
 */
function normalizarMesReferencia(mesRef: string): string {
  const meses: { [key: string]: string } = {
    janeiro: '01',
    fevereiro: '02',
    março: '03',
    marco: '03',
    abril: '04',
    maio: '05',
    junho: '06',
    julho: '07',
    agosto: '08',
    setembro: '09',
    outubro: '10',
    novembro: '11',
    dezembro: '12',
  };

  const match = mesRef.toLowerCase().match(/(\w+)\s+de\s+(\d{4})/);
  if (match) {
    const mes = meses[match[1]] || '01';
    const ano = match[2];
    return `${ano}-${mes}`;
  }

  // Se já estiver no formato YYYY-MM, retornar
  if (/^\d{4}-\d{2}$/.test(mesRef)) {
    return mesRef;
  }

  // Fallback: usar mês atual
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
