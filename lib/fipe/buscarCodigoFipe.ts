/**
 * Buscar código FIPE automaticamente por marca, modelo e ano
 * Usa a BrasilAPI para encontrar o código FIPE
 */

import { listarMarcas, listarTabelasFIPE } from './brasilapi';

const BRASIL_API_BASE = 'https://brasilapi.com.br/api/fipe';

export interface ModeloFipe {
  codigo: string;
  nome: string;
}

export interface AnoFipe {
  codigo: string;
  nome: string;
}

export interface ResultadoBuscaCodigo {
  codigoFipe: string | null;
  marca: string;
  modelo: string;
  ano: string;
  erro?: string;
}

/**
 * Normalizar nome da marca para busca
 */
function normalizarMarca(marca: string): string {
  const normalizacoes: { [key: string]: string } = {
    'vw': 'volkswagen',
    'volkswagen': 'volkswagen',
    'mb': 'mercedes-benz',
    'mercedes': 'mercedes-benz',
    'mercedes-benz': 'mercedes-benz',
    'jaguar': 'jaguar',
    'porsche': 'porsche',
    'peugeot': 'peugeot',
    'clark': 'clark', // Máquinas podem não ter na FIPE
  };
  
  const marcaLower = marca.toLowerCase().trim();
  return normalizacoes[marcaLower] || marcaLower;
}

/**
 * Normalizar nome do modelo para busca
 */
function normalizarModelo(modelo: string): string {
  // Remover espaços extras e normalizar
  return modelo.trim().toLowerCase();
}

/**
 * Buscar código FIPE por marca, modelo e ano
 */
export async function buscarCodigoFipe(
  marca: string,
  modelo: string,
  ano: number,
  tipo: 'carros' | 'caminhoes' | 'motos' = 'carros'
): Promise<ResultadoBuscaCodigo> {
  try {
    // Normalizar entrada
    const marcaNormalizada = normalizarMarca(marca);
    const modeloNormalizado = normalizarModelo(modelo);
    
    // 1. Buscar marcas
    const marcas = await listarMarcas(tipo);
    const marcaEncontrada = marcas.find(
      (m) => normalizarMarca(m.nome) === marcaNormalizada
    );
    
    if (!marcaEncontrada) {
      return {
        codigoFipe: null,
        marca,
        modelo,
        ano: ano.toString(),
        erro: `Marca "${marca}" não encontrada na FIPE para ${tipo}`,
      };
    }
    
    // 2. Buscar modelos da marca
    const responseModelos = await fetch(
      `${BRASIL_API_BASE}/marcas/v1/${tipo}/${marcaEncontrada.codigo}/modelos`
    );
    
    if (!responseModelos.ok) {
      throw new Error(`Erro ao buscar modelos: ${responseModelos.statusText}`);
    }
    
    const dataModelos = await responseModelos.json();
    // A API retorna { modelos: [...] } ou array direto
    const modelos: ModeloFipe[] = Array.isArray(dataModelos) 
      ? dataModelos 
      : (dataModelos.modelos || []);
    
    // Buscar modelo (pode ser parcial)
    const modeloEncontrado = modelos.find((m) => {
      const nomeModelo = normalizarModelo(m.nome);
      return nomeModelo.includes(modeloNormalizado) || 
             modeloNormalizado.includes(nomeModelo);
    });
    
    if (!modeloEncontrado) {
      return {
        codigoFipe: null,
        marca,
        modelo,
        ano: ano.toString(),
        erro: `Modelo "${modelo}" não encontrado para marca "${marca}"`,
      };
    }
    
    // 3. Buscar anos do modelo
    const responseAnos = await fetch(
      `${BRASIL_API_BASE}/marcas/v1/${tipo}/${marcaEncontrada.codigo}/modelos/${modeloEncontrado.codigo}/anos`
    );
    
    if (!responseAnos.ok) {
      throw new Error(`Erro ao buscar anos: ${responseAnos.statusText}`);
    }
    
    const anos: AnoFipe[] = await responseAnos.json();
    
    // Buscar ano (pode ser exato ou próximo)
    const anoEncontrado = anos.find((a) => {
      const anoStr = a.nome.match(/\d{4}/)?.[0];
      return anoStr && parseInt(anoStr) === ano;
    }) || anos.find((a) => {
      // Tentar ano mais próximo
      const anoStr = a.nome.match(/\d{4}/)?.[0];
      if (anoStr) {
        const anoNum = parseInt(anoStr);
        return Math.abs(anoNum - ano) <= 1; // Aceitar diferença de 1 ano
      }
      return false;
    });
    
    if (!anoEncontrado) {
      return {
        codigoFipe: null,
        marca,
        modelo,
        ano: ano.toString(),
        erro: `Ano ${ano} não encontrado para ${marca} ${modelo}`,
      };
    }
    
    // 4. O código FIPE é o próprio código do ano
    // A estrutura da BrasilAPI: /preco/v1/{codigoFipe}
    // O código do ano já é o código FIPE
    const codigoFipe = anoEncontrado.codigo;
    
    if (!codigoFipe) {
      return {
        codigoFipe: null,
        marca,
        modelo,
        ano: ano.toString(),
        erro: 'Código FIPE não encontrado',
      };
    }
    
    // Verificar se o código FIPE funciona buscando o preço
    try {
      const responsePreco = await fetch(
        `${BRASIL_API_BASE}/preco/v1/${codigoFipe}`
      );
      
      if (!responsePreco.ok) {
        throw new Error(`Código FIPE inválido: ${responsePreco.statusText}`);
      }
      
      const precos = await responsePreco.json();
      const preco = Array.isArray(precos) ? precos[0] : precos;
      
      return {
        codigoFipe: codigoFipe,
        marca: preco?.marca || marca,
        modelo: preco?.modelo || modelo,
        ano: ano.toString(),
      };
    } catch (error: any) {
      // Mesmo se falhar ao buscar preço, retornar o código encontrado
      return {
        codigoFipe: codigoFipe,
        marca,
        modelo,
        ano: ano.toString(),
      };
    }
  } catch (error: any) {
    console.error(`Erro ao buscar código FIPE para ${marca} ${modelo} ${ano}:`, error);
    return {
      codigoFipe: null,
      marca,
      modelo,
      ano: ano.toString(),
      erro: error.message || 'Erro desconhecido ao buscar código FIPE',
    };
  }
}
