/**
 * Cliente para BrasilAPI - FIPE
 * https://brasilapi.com.br/api/fipe
 */

const BRASIL_API_BASE = 'https://brasilapi.com.br/api/fipe';

export interface TabelaFipe {
  codigo: number;
  mes: string;
}

export interface MarcaFipe {
  codigo: string;
  nome: string;
}

export interface PrecoFipe {
  valor: string; // "R$ 123.456,00"
  marca: string;
  modelo: string;
  anoModelo: number;
  combustivel: string;
  codigoFipe: string;
  mesReferencia: string; // "janeiro de 2024"
  tipoVeiculo: number;
  siglaCombustivel: string;
  dataConsulta: string;
}

/**
 * Listar tabelas FIPE disponíveis
 */
export async function listarTabelasFIPE(): Promise<TabelaFipe[]> {
  try {
    const response = await fetch(`${BRASIL_API_BASE}/tabelas/v1`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar tabelas FIPE: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao listar tabelas FIPE:', error);
    throw error;
  }
}

/**
 * Listar marcas por tipo de veículo
 */
export async function listarMarcas(tipo: 'carros' | 'motos' | 'caminhoes'): Promise<MarcaFipe[]> {
  try {
    const response = await fetch(`${BRASIL_API_BASE}/marcas/v1/${tipo}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar marcas: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Erro ao listar marcas (${tipo}):`, error);
    throw error;
  }
}

/**
 * Consultar preço por código FIPE
 */
export async function consultarPrecoFIPE(codigoFipe: string): Promise<PrecoFipe> {
  try {
    const response = await fetch(`${BRASIL_API_BASE}/preco/v1/${codigoFipe}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar preço FIPE: ${response.statusText}`);
    }
    const data = await response.json();
    
    // A API pode retornar array ou objeto único
    if (Array.isArray(data)) {
      // Pegar o mais recente (primeiro item)
      return data[0];
    }
    
    return data;
  } catch (error) {
    console.error(`Erro ao consultar preço FIPE (${codigoFipe}):`, error);
    throw error;
  }
}

/**
 * Normalizar mesReferencia para formato YYYY-MM
 */
export function normalizarMesReferencia(mesRef: string): string {
  // Exemplos: "janeiro de 2024" -> "2024-01"
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
