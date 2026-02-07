/**
 * Utilitários robustos para parsing de dados (Excel, PDF, BRL)
 * PARTE B - Consistência de dados
 */

/**
 * Converte string BRL para número de forma segura
 * Aceita: "R$ 123.456,78", "123456,78", "123456.78", etc.
 */
export function parseBRLToNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) return 0;
    return Math.max(0, value);
  }

  if (!value || typeof value !== 'string') {
    return 0;
  }

  // Remover símbolos e espaços
  let cleaned = value
    .replace(/[^\d,.-]/g, '') // Remove tudo exceto dígitos, vírgula, ponto, hífen
    .trim();

  if (!cleaned || cleaned === '-' || cleaned === '.') {
    return 0;
  }

  // Normalizar: remover pontos (milhares) e substituir vírgula por ponto
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  if (hasComma && hasDot) {
    // Formato brasileiro: "1.234,56" -> ponto é milhar, vírgula é decimal
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (hasComma && !hasDot) {
    // Apenas vírgula: pode ser decimal ou milhar
    // Se tiver mais de 3 dígitos após vírgula, é milhar
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Decimal: "123,45"
      cleaned = cleaned.replace(',', '.');
    } else {
      // Milhar: "1,234" -> tratar como número inteiro
      cleaned = cleaned.replace(',', '');
    }
  } else if (hasDot && !hasComma) {
    // Apenas ponto: pode ser decimal ou milhar
    const parts = cleaned.split('.');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Decimal: "123.45"
      // Já está correto
    } else {
      // Milhar: "1.234" -> remover ponto
      cleaned = cleaned.replace(/\./g, '');
    }
  }

  const parsed = parseFloat(cleaned);

  if (isNaN(parsed) || !isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, parsed);
}

/**
 * Garante que um número é válido e finito
 */
export function safeNumber(value: any, defaultValue: number = 0): number {
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) {
      return defaultValue;
    }
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || !isFinite(parsed)) {
      return defaultValue;
    }
    return parsed;
  }

  return defaultValue;
}

/**
 * Normaliza cabeçalhos de colunas do Excel
 * Remove acentos, espaços, converte para minúsculas
 */
export function normalizeHeader(header: string): string {
  if (!header || typeof header !== 'string') {
    return '';
  }

  return header
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, '_') // Espaços para underscore
    .replace(/[^a-z0-9_]/g, ''); // Remove caracteres especiais
}

/**
 * Mapeia nomes de colunas comuns para nomes padronizados
 */
export const COLUMN_MAPPINGS: Record<string, string[]> = {
  id: ['id', 'codigo', 'cod', 'numero', 'num', 'lote'],
  matricula: ['matricula', 'mat', 'registro', 'reg'],
  area: ['area', 'área', 'm2', 'metros', 'metros_quadrados'],
  valor_mercado: [
    'valor_mercado',
    'valor mercado',
    'avaliacao_mercado',
    'avaliação mercado',
    'valor_avaliacao',
    'valor avaliação',
    'mercado',
  ],
  valor_venda_forcada: [
    'valor_venda_forcada',
    'valor venda forçada',
    'venda_forcada',
    'venda forçada',
    'valor_vf',
    'vf',
    'avaliacao_vf',
    'avaliação vf',
  ],
  observacoes: ['observacoes', 'observações', 'obs', 'observacao', 'observação', 'notas', 'nota'],
};

/**
 * Encontra o nome padronizado de uma coluna baseado no cabeçalho
 */
export function mapColumnName(header: string): string | null {
  const normalized = normalizeHeader(header);

  for (const [standardName, variations] of Object.entries(COLUMN_MAPPINGS)) {
    for (const variation of variations) {
      if (normalized === normalizeHeader(variation) || normalized.includes(normalizeHeader(variation))) {
        return standardName;
      }
    }
  }

  return null;
}

/**
 * Valida que um lote tem pelo menos um valor de avaliação
 */
export function validateLote(lote: {
  valorMercado?: number;
  valorVendaForcada?: number;
}): { valid: boolean; error?: string } {
  const mercado = safeNumber(lote.valorMercado);
  const vendaForcada = safeNumber(lote.valorVendaForcada);

  if (mercado <= 0 && vendaForcada <= 0) {
    return {
      valid: false,
      error: 'Lote deve ter pelo menos um valor de avaliação (mercado ou venda forçada)',
    };
  }

  return { valid: true };
}

/**
 * Calcula venda forçada como 70% do valor de mercado se não existir
 */
export function calculateVendaForcada(
  valorMercado: number,
  valorVendaForcada: number | null | undefined,
  multiplicador: number = 0.7
): number {
  const mercado = safeNumber(valorMercado);
  const vf = safeNumber(valorVendaForcada);

  if (vf > 0) {
    return vf;
  }

  if (mercado > 0) {
    return mercado * multiplicador;
  }

  return 0;
}
