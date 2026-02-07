/**
 * Cache de FIPE no localStorage
 * Armazena valores por 24 horas
 */

interface FipeCacheEntry {
  fipe: number;
  garantia: number;
  mesReferencia: string;
  timestamp: number;
}

const CACHE_KEY = 'fipeCache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Obtém cache do localStorage
 */
export function getFipeCache(): Record<string, FipeCacheEntry> {
  if (typeof window === 'undefined') return {};
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return {};
    
    const data = JSON.parse(cached);
    const now = Date.now();
    
    // Limpar entradas expiradas
    const valid: Record<string, FipeCacheEntry> = {};
    for (const [key, entry] of Object.entries(data)) {
      const entryTyped = entry as FipeCacheEntry;
      if (now - entryTyped.timestamp < CACHE_DURATION) {
        valid[key] = entryTyped;
      }
    }
    
    // Salvar de volta (sem expirados)
    if (Object.keys(valid).length !== Object.keys(data).length) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(valid));
    }
    
    return valid;
  } catch (error) {
    console.error('Erro ao ler cache FIPE:', error);
    return {};
  }
}

/**
 * Salva valor no cache
 */
export function setFipeCache(veiculoId: string, fipe: number, garantia: number, mesReferencia: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const cache = getFipeCache();
    cache[veiculoId] = {
      fipe,
      garantia,
      mesReferencia,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Erro ao salvar cache FIPE:', error);
  }
}

/**
 * Obtém valor do cache para um veículo específico
 */
export function getFipeCacheForVeiculo(veiculoId: string): FipeCacheEntry | null {
  const cache = getFipeCache();
  return cache[veiculoId] || null;
}

/**
 * Limpa todo o cache
 */
export function clearFipeCache(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CACHE_KEY);
}
