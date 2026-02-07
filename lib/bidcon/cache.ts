/**
 * Cache para dados do Marketplace BidCon
 * Cache de 5 minutos
 */

interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache: Map<string, CacheEntry> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos em milissegundos

/**
 * Verifica se o cache é válido
 */
export function isCacheValid(key: string): boolean {
  const entry = cache.get(key);
  if (!entry) return false;

  const now = Date.now();
  const age = now - entry.timestamp;
  return age < CACHE_DURATION;
}

/**
 * Obtém valor do cache
 */
export function getCache(key: string): any | null {
  if (!isCacheValid(key)) {
    cache.delete(key);
    return null;
  }
  return cache.get(key)?.data || null;
}

/**
 * Salva valor no cache
 */
export function setCache(key: string, data: any): void {
  cache.set(key, {
    data,
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
