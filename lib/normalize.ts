/**
 * Normalização de texto para busca e comparação
 */

/**
 * Remove acentos de uma string
 */
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normaliza texto para comparação:
 * - lowercase
 * - remove acentos
 * - remove pontuação
 * - troca múltiplos espaços por 1
 * - trim
 */
export function normalizeText(str: string): string {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, ' ') // Remove pontuação, mantém apenas letras, números e espaços
    .replace(/\s+/g, ' ') // Múltiplos espaços -> 1 espaço
    .trim();
}

/**
 * Converte valor BRL para número
 * "R$ 123.456,00" => 123456.00
 */
export function parseBRLToNumber(str: string): number {
  if (!str || typeof str !== 'string') return 0;
  
  // Remover "R$", pontos, espaços
  let limpo = str
    .replace(/R\$/g, '')
    .replace(/\./g, '') // Remove pontos (separadores de milhar)
    .replace(/\s/g, '') // Remove espaços
    .trim();
  
  // Trocar vírgula por ponto
  limpo = limpo.replace(',', '.');
  
  // Converter para number
  const numero = parseFloat(limpo);
  
  // Validar NaN
  if (isNaN(numero)) {
    console.warn(`Erro ao converter valor BRL: "${str}" -> NaN`);
    return 0;
  }
  
  return numero;
}

/**
 * Stopwords para remover de modelos de veículos
 */
const STOPWORDS = new Set([
  '4x2', '4x4', 'aut', 'automatico', 'mec', 'mecanico', 'flex', 'diesel',
  'cv', 'turbo', 'blindado', 'cd', 'lx', 'gl', 'gls', 'gli', 'titanium',
  'trekking', 'cross', 'sport', 'comfortline', 'highline', 'executive',
  's', 'se', 'sel', 'sl', 'sle', 'slt', 'amg', 'line', 'edition',
  'cabine', 'simples', 'dupla', 'estendida', 'curta', 'longa',
]);

/**
 * Tokeniza um texto (divide em palavras e remove stopwords)
 */
export function tokenize(text: string): string[] {
  const normalized = normalizeText(text);
  const tokens = normalized.split(/\s+/).filter(token => token.length > 0);
  
  // Remover stopwords
  return tokens.filter(token => !STOPWORDS.has(token));
}

/**
 * Calcula sobreposição de tokens entre dois textos
 * Retorna um score de 0 a 1
 */
export function tokenOverlap(text1: string, text2: string): number {
  const tokens1 = new Set(tokenize(text1));
  const tokens2 = new Set(tokenize(text2));
  
  if (tokens1.size === 0 || tokens2.size === 0) return 0;
  
  // Contar tokens em comum
  let common = 0;
  for (const token of tokens1) {
    if (tokens2.has(token)) {
      common++;
    }
  }
  
  // Score: tokens comuns / total de tokens únicos
  const totalUnique = new Set([...tokens1, ...tokens2]).size;
  return totalUnique > 0 ? common / totalUnique : 0;
}

/**
 * Extrai números de um texto
 */
export function extractNumbers(text: string): number[] {
  const matches = text.match(/\d+/g);
  return matches ? matches.map(Number) : [];
}

/**
 * Calcula similaridade de Jaro-Winkler (simplificado)
 * Retorna um score de 0 a 1
 */
export function jaroWinklerSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;
  
  // Jaro distance
  const matchWindow = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);
  
  let matches = 0;
  let transpositions = 0;
  
  // Encontrar matches
  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, s2.length);
    
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }
  
  if (matches === 0) return 0.0;
  
  // Encontrar transposições
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  
  // Jaro distance
  const jaro = (matches / s1.length + matches / s2.length + (matches - transpositions / 2) / matches) / 3.0;
  
  // Winkler prefix bonus
  let prefix = 0;
  for (let i = 0; i < Math.min(s1.length, s2.length, 4); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }
  
  return jaro + (0.1 * prefix * (1 - jaro));
}
