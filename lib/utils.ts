/**
 * Utilitários gerais
 */

/**
 * Formata valor em BRL
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata percentual
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formata número com separadores
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Converte string BRL para número
 */
export function parseBRL(value: string): number {
  return parseFloat(
    value
      .replace(/[^\d,.-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
  );
}

/**
 * Converte string percentual para número
 */
export function parsePercent(value: string): number {
  return parseFloat(
    value.replace(/[^\d,.-]/g, '').replace(',', '.')
  );
}

/**
 * Máscara para input de dinheiro
 */
export function maskMoney(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length === 0) return '';
  
  const cents = numbers.slice(-2);
  const reais = numbers.slice(0, -2) || '0';
  
  return `R$ ${reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${cents.padStart(2, '0')}`;
}

/**
 * Máscara para input de percentual
 */
export function maskPercent(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length === 0) return '';
  
  if (numbers.length <= 2) {
    return `${numbers}%`;
  }
  
  const decimals = numbers.slice(-2);
  const integer = numbers.slice(0, -2);
  
  return `${integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimals}%`;
}
