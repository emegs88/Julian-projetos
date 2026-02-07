/**
 * Resolvedor automático de código FIPE
 * Busca código FIPE automaticamente usando marca, modelo e ano
 */

import { normalizeText, tokenOverlap, extractNumbers, jaroWinklerSimilarity } from './normalize';

const BRASIL_API_BASE = 'https://brasilapi.com.br/api/fipe';

export interface ResolveFipeParams {
  tipo: 'carros' | 'caminhoes';
  marcaTexto: string;
  modeloTexto: string;
  ano: number;
}

export interface ResolveFipeResult {
  codigoFipe: string;
  codigoMarca: string;
  codigoModelo: string;
  marca: string;
  modelo: string;
  ano: string;
  mesReferencia?: string;
}

export interface ResolveFipeError {
  erro: string;
  sugestoes?: Array<{
    marca: string;
    modelo: string;
    ano: string;
    codigoFipe: string;
    score: number;
  }>;
}

/**
 * PASSO A: Descobrir código da marca
 */
async function resolveMarca(
  tipo: 'carros' | 'caminhoes',
  marcaTexto: string
): Promise<{ codigo: string; nome: string; score: number } | null> {
  try {
    const response = await fetch(`${BRASIL_API_BASE}/marcas/v1/${tipo}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar marcas: ${response.statusText}`);
    }
    
    const marcas: Array<{ codigo: string; nome: string }> = await response.json();
    const marcaNormalizada = normalizeText(marcaTexto);
    
    // Buscar melhor match
    let melhorMatch: { codigo: string; nome: string; score: number } | null = null;
    let melhorScore = 0;
    
    for (const marca of marcas) {
      const nomeNormalizado = normalizeText(marca.nome);
      
      // Match exato
      if (nomeNormalizado === marcaNormalizada) {
        return { codigo: marca.codigo, nome: marca.nome, score: 1.0 };
      }
      
      // Similaridade Jaro-Winkler
      const score = jaroWinklerSimilarity(marcaTexto, marca.nome);
      
      // Bonus se contém
      if (nomeNormalizado.includes(marcaNormalizada) || marcaNormalizada.includes(nomeNormalizado)) {
        score * 1.2; // Bonus de 20%
      }
      
      if (score > melhorScore) {
        melhorScore = score;
        melhorMatch = { codigo: marca.codigo, nome: marca.nome, score };
      }
    }
    
    // Limiar mínimo de 0.6 para aceitar
    if (melhorMatch && melhorScore >= 0.6) {
      return melhorMatch;
    }
    
    return null;
  } catch (error: any) {
    console.error(`Erro ao resolver marca "${marcaTexto}":`, error);
    throw error;
  }
}

/**
 * PASSO B: Descobrir código do modelo
 */
async function resolveModelo(
  tipo: 'carros' | 'caminhoes',
  codigoMarca: string,
  modeloTexto: string
): Promise<Array<{ codigo: string; nome: string; score: number }>> {
  try {
    const response = await fetch(`${BRASIL_API_BASE}/marcas/v1/${tipo}/${codigoMarca}/modelos`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar modelos: ${response.statusText}`);
    }
    
    const data = await response.json();
    const modelos: Array<{ codigo: string; nome: string }> = Array.isArray(data)
      ? data
      : (data.modelos || []);
    
    const modeloNormalizado = normalizeText(modeloTexto);
    const numerosModelo = extractNumbers(modeloTexto);
    
    // Calcular score para cada modelo
    const modelosComScore = modelos.map((modelo) => {
      const nomeNormalizado = normalizeText(modelo.nome);
      
      // Score base: token overlap
      let score = tokenOverlap(modeloTexto, modelo.nome);
      
      // Bonus: Jaro-Winkler
      score = (score + jaroWinklerSimilarity(modeloTexto, modelo.nome)) / 2;
      
      // Bonus: números em comum
      const numerosModeloAPI = extractNumbers(modelo.nome);
      if (numerosModelo.length > 0 && numerosModeloAPI.length > 0) {
        const numerosComuns = numerosModelo.filter(n => numerosModeloAPI.includes(n));
        if (numerosComuns.length > 0) {
          score += 0.3; // Bonus significativo para números em comum
        }
      }
      
      // Bonus: match exato
      if (nomeNormalizado === modeloNormalizado) {
        score = 1.0;
      }
      
      // Bonus: contém
      if (nomeNormalizado.includes(modeloNormalizado) || modeloNormalizado.includes(nomeNormalizado)) {
        score += 0.2;
      }
      
      return { codigo: modelo.codigo, nome: modelo.nome, score: Math.min(score, 1.0) };
    });
    
    // Ordenar por score e retornar top 5
    return modelosComScore
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  } catch (error: any) {
    console.error(`Erro ao resolver modelo "${modeloTexto}":`, error);
    throw error;
  }
}

/**
 * PASSO C: Descobrir código FIPE para o ano
 */
async function resolveAno(
  tipo: 'carros' | 'caminhoes',
  codigoMarca: string,
  codigoModelo: string,
  ano: number
): Promise<{ codigo: string; nome: string; ano: number } | null> {
  try {
    const response = await fetch(
      `${BRASIL_API_BASE}/marcas/v1/${tipo}/${codigoMarca}/modelos/${codigoModelo}/anos`
    );
    if (!response.ok) {
      throw new Error(`Erro ao buscar anos: ${response.statusText}`);
    }
    
    const anos: Array<{ codigo: string; nome: string }> = await response.json();
    
    // Extrair ano de cada item (formato pode ser "2020" ou "2020 Gasolina")
    const anosComAno = anos.map((item) => {
      const anoMatch = item.nome.match(/\d{4}/);
      const anoNum = anoMatch ? parseInt(anoMatch[0]) : 0;
      return { codigo: item.codigo, nome: item.nome, ano: anoNum };
    });
    
    // Buscar ano exato
    let melhorAno = anosComAno.find((a) => a.ano === ano);
    if (melhorAno) {
      return melhorAno;
    }
    
    // Buscar ano mais próximo (mas não maior que o solicitado)
    const anosValidos = anosComAno.filter((a) => a.ano > 0 && a.ano <= ano);
    if (anosValidos.length > 0) {
      melhorAno = anosValidos.reduce((prev, curr) => {
        return Math.abs(curr.ano - ano) < Math.abs(prev.ano - ano) ? curr : prev;
      });
      return melhorAno;
    }
    
    // Se não encontrou, retornar o primeiro disponível
    if (anosComAno.length > 0) {
      return anosComAno[0];
    }
    
    return null;
  } catch (error: any) {
    console.error(`Erro ao resolver ano ${ano}:`, error);
    throw error;
  }
}

/**
 * Resolve código FIPE automaticamente
 */
export async function resolveCodigoFipe(
  params: ResolveFipeParams
): Promise<ResolveFipeResult | ResolveFipeError> {
  const { tipo, marcaTexto, modeloTexto, ano } = params;
  
  try {
    // PASSO A: Resolver marca
    const marca = await resolveMarca(tipo, marcaTexto);
    if (!marca) {
      return {
        erro: `Marca "${marcaTexto}" não encontrada para ${tipo}`,
      };
    }
    
    // PASSO B: Resolver modelo
    const modelos = await resolveModelo(tipo, marca.codigo, modeloTexto);
    if (modelos.length === 0 || modelos[0].score < 0.3) {
      // Score muito baixo, retornar sugestões
      const sugestoes = await Promise.all(
        modelos.slice(0, 5).map(async (modelo) => {
          const anoResolvido = await resolveAno(tipo, marca.codigo, modelo.codigo, ano);
          if (anoResolvido) {
            // Buscar preço para obter código FIPE
            try {
              const precoResponse = await fetch(
                `${BRASIL_API_BASE}/preco/v1/${anoResolvido.codigo}`
              );
              if (precoResponse.ok) {
                const precoData = await precoResponse.json();
                const preco = Array.isArray(precoData) ? precoData[0] : precoData;
                return {
                  marca: marca.nome,
                  modelo: modelo.nome,
                  ano: anoResolvido.nome,
                  codigoFipe: anoResolvido.codigo,
                  score: modelo.score,
                };
              }
            } catch (e) {
              // Ignorar erro ao buscar preço
            }
          }
          return null;
        })
      );
      
      return {
        erro: `Modelo "${modeloTexto}" não encontrado com confiança suficiente para ${marca.nome}`,
        sugestoes: sugestoes.filter((s): s is NonNullable<typeof s> => s !== null),
      };
    }
    
    const melhorModelo = modelos[0];
    
    // PASSO C: Resolver ano
    const anoResolvido = await resolveAno(tipo, marca.codigo, melhorModelo.codigo, ano);
    if (!anoResolvido) {
      return {
        erro: `Ano ${ano} não encontrado para ${marca.nome} ${melhorModelo.nome}`,
      };
    }
    
    // Buscar preço para obter mesReferencia
    let mesReferencia: string | undefined;
    try {
      const precoResponse = await fetch(`${BRASIL_API_BASE}/preco/v1/${anoResolvido.codigo}`);
      if (precoResponse.ok) {
        const precoData = await precoResponse.json();
        const preco = Array.isArray(precoData) ? precoData[0] : precoData;
        mesReferencia = preco.mesReferencia;
      }
    } catch (e) {
      // Ignorar erro, mesReferencia é opcional
    }
    
    return {
      codigoFipe: anoResolvido.codigo,
      codigoMarca: marca.codigo,
      codigoModelo: melhorModelo.codigo,
      marca: marca.nome,
      modelo: melhorModelo.nome,
      ano: anoResolvido.nome,
      mesReferencia,
    };
  } catch (error: any) {
    console.error('Erro ao resolver código FIPE:', error);
    return {
      erro: error.message || 'Erro desconhecido ao resolver código FIPE',
    };
  }
}
