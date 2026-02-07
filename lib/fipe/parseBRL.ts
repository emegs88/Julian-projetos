/**
 * Normaliza valor em formato BRL (R$ 123.456,00) para number
 */
export function parseBRLToNumber(str: string): number {
  if (!str || typeof str !== 'string') {
    return 0;
  }

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
 * Testa se uma string parece ser um valor em BRL
 */
export function isBRLFormat(str: string): boolean {
  return /R\$\s*\d+[\.,]\d+/.test(str);
}
