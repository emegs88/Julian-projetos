/**
 * Buscar código FIPE automaticamente por marca, modelo e ano
 * Usa a BrasilAPI para encontrar o código FIPE
 */

import { listarMarcas, listarTabelasFIPE, type MarcaFipe } from './brasilapi';

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
    'mercedes benz': 'mercedes-benz',
    'jaguar': 'jaguar',
    'porsche': 'porsche',
    'peugeot': 'peugeot',
    'clark': 'clark', // Máquinas podem não ter na FIPE
  };
  
  const marcaLower = marca.toLowerCase().trim();
  return normalizacoes[marcaLower] || marcaLower;
}

/**
 * Busca marca na lista usando múltiplas estratégias
 */
function encontrarMarca(marcas: MarcaFipe[], marcaBuscada: string): MarcaFipe | null {
  const marcaNormalizada = normalizarMarca(marcaBuscada);
  
  // Estratégia 1: match exato normalizado
  let encontrada = marcas.find(m => normalizarMarca(m.nome) === marcaNormalizada);
  if (encontrada) return encontrada;
  
  // Estratégia 2: contém
  encontrada = marcas.find(m => {
    const nomeNormalizado = normalizarMarca(m.nome);
    return nomeNormalizado.includes(marcaNormalizada) || marcaNormalizada.includes(nomeNormalizado);
  });
  if (encontrada) return encontrada;
  
  // Estratégia 3: busca por palavras-chave
  const palavrasBuscadas = marcaNormalizada.split(/[\s-]+/);
  encontrada = marcas.find(m => {
    const nomeNormalizado = normalizarMarca(m.nome);
    return palavrasBuscadas.some(p => nomeNormalizado.includes(p));
  });
  
  return encontrada || null;
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
    console.log(`🔍 Buscando marca: "${marca}" (normalizada: "${marcaNormalizada}")`);
    const marcas = await listarMarcas(tipo);
    console.log(`📋 Total de marcas encontradas: ${marcas.length}`);
    
    const marcaEncontrada = encontrarMarca(marcas, marca);
    
    if (!marcaEncontrada) {
      console.warn(`⚠️ Marca não encontrada: "${marca}". Marcas disponíveis (primeiras 10):`, marcas.slice(0, 10).map(m => m.nome));
      return {
        codigoFipe: null,
        marca,
        modelo,
        ano: ano.toString(),
        erro: `Marca "${marca}" não encontrada na FIPE para ${tipo}`,
      };
    }
    
    console.log(`✅ Marca encontrada: "${marcaEncontrada.nome}" (código: ${marcaEncontrada.codigo})`);
    
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
    
    // Buscar modelo (pode ser parcial) - tentar múltiplas estratégias
    let modeloEncontrado = modelos.find((m) => {
      const nomeModelo = normalizarModelo(m.nome);
      // Estratégia 1: match exato
      if (nomeModelo === modeloNormalizado) return true;
      // Estratégia 2: contém
      if (nomeModelo.includes(modeloNormalizado) || modeloNormalizado.includes(nomeModelo)) return true;
      // Estratégia 3: palavras-chave (ex: "Polo" encontra "Polo", "Polo 1.0", etc)
      const palavrasModelo = modeloNormalizado.split(' ');
      const palavrasNome = nomeModelo.split(' ');
      return palavrasModelo.some(p => palavrasNome.some(n => n.includes(p) || p.includes(n)));
    });
    
    // Se não encontrou, tentar busca mais flexível (remover números, espaços extras)
    if (!modeloEncontrado) {
      const modeloLimpo = modeloNormalizado.replace(/\d+/g, '').trim();
      modeloEncontrado = modelos.find((m) => {
        const nomeModelo = normalizarModelo(m.nome).replace(/\d+/g, '').trim();
        return nomeModelo.includes(modeloLimpo) || modeloLimpo.includes(nomeModelo);
      });
    }
    
    if (!modeloEncontrado) {
      console.warn(`Modelo não encontrado: "${modelo}" para marca "${marca}". Modelos disponíveis:`, modelos.slice(0, 5).map(m => m.nome));
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
