/**
 * Cache em memória para FIPE
 * Armazena valores por 24 horas
 */

interface CacheEntry {
  valor: number;
  mesReferencia: string;
  timestamp: number;
}

const cache: Map<string, CacheEntry> = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas em milissegundos

/**
 * Verifica se o cache é válido (menos de 24 horas)
 */
export function isCacheValid(codigoFipe: string): boolean {
  const entry = cache.get(codigoFipe);
  if (!entry) return false;

  const now = Date.now();
  const age = now - entry.timestamp;
  return age < CACHE_DURATION;
}

/**
 * Obtém valor do cache
 */
export function getCache(codigoFipe: string): CacheEntry | null {
  if (!isCacheValid(codigoFipe)) {
    cache.delete(codigoFipe);
    return null;
  }
  return cache.get(codigoFipe) || null;
}

/**
 * Salva valor no cache
 */
export function setCache(codigoFipe: string, valor: number, mesReferencia: string): void {
  cache.set(codigoFipe, {
    valor,
    mesReferencia,
    timestamp: Date.now(),
  });
}

/**
 * Limpa cache expirado
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    const age = now - entry.timestamp;
    if (age >= CACHE_DURATION) {
      cache.delete(key);
    }
  }
}

/**
 * Limpa todo o cache
 */
export function clearAllCache(): void {
  cache.clear();
}
