/**
 * Cache persistente de códigos FIPE resolvidos e preços diários
 * Usa arquivo JSON simples (pode migrar para SQLite depois)
 * APENAS PARA SERVIDOR (Node.js)
 */

import * as fs from 'fs';
import * as path from 'path';

// Verificar se está rodando no servidor
const isServer = typeof window === 'undefined' && typeof process !== 'undefined';

const CACHE_DIR = isServer ? path.join(process.cwd(), 'data') : '';
const CACHE_FILE = isServer ? path.join(CACHE_DIR, 'cacheFipe.json') : '';

interface FipeResolvedCode {
  marcaTexto: string;
  modeloTexto: string;
  ano: number;
  tipo: 'carros' | 'caminhoes';
  codigoMarca: string;
  codigoModelo: string;
  codigoFipe: string;
  updatedAt: string;
}

interface FipeDailyCache {
  codigoFipe: string;
  date: string; // YYYY-MM-DD
  fipe: number;
  mesReferencia: string;
}

interface FipeCache {
  resolvedCodes: FipeResolvedCode[];
  dailyCache: FipeDailyCache[];
}

/**
 * Carrega cache do arquivo
 */
function loadCache(): FipeCache {
  if (!isServer) {
    return { resolvedCodes: [], dailyCache: [] };
  }
  
  try {
    if (CACHE_FILE && fs.existsSync(CACHE_FILE)) {
      const content = fs.readFileSync(CACHE_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Erro ao carregar cache FIPE:', error);
  }
  
  return { resolvedCodes: [], dailyCache: [] };
}

/**
 * Salva cache no arquivo
 */
function saveCache(cache: FipeCache): void {
  if (!isServer) {
    return;
  }
  
  try {
    // Criar diretório se não existir
    if (CACHE_DIR && !fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    
    if (CACHE_FILE) {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
    }
  } catch (error) {
    console.error('Erro ao salvar cache FIPE:', error);
  }
}

/**
 * Busca código FIPE resolvido no cache
 */
export function getResolvedCode(
  marcaTexto: string,
  modeloTexto: string,
  ano: number,
  tipo: 'carros' | 'caminhoes'
): FipeResolvedCode | null {
  const cache = loadCache();
  
  return cache.resolvedCodes.find(
    (entry) =>
      entry.marcaTexto === marcaTexto &&
      entry.modeloTexto === modeloTexto &&
      entry.ano === ano &&
      entry.tipo === tipo
  ) || null;
}

/**
 * Salva código FIPE resolvido no cache
 */
export function setResolvedCode(
  marcaTexto: string,
  modeloTexto: string,
  ano: number,
  tipo: 'carros' | 'caminhoes',
  codigoMarca: string,
  codigoModelo: string,
  codigoFipe: string
): void {
  const cache = loadCache();
  
  // Remover entrada existente se houver
  cache.resolvedCodes = cache.resolvedCodes.filter(
    (entry) =>
      !(
        entry.marcaTexto === marcaTexto &&
        entry.modeloTexto === modeloTexto &&
        entry.ano === ano &&
        entry.tipo === tipo
      )
  );
  
  // Adicionar nova entrada
  cache.resolvedCodes.push({
    marcaTexto,
    modeloTexto,
    ano,
    tipo,
    codigoMarca,
    codigoModelo,
    codigoFipe,
    updatedAt: new Date().toISOString(),
  });
  
  saveCache(cache);
}

/**
 * Busca preço FIPE do cache diário
 */
export function getDailyCache(codigoFipe: string): FipeDailyCache | null {
  const cache = loadCache();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  return cache.dailyCache.find(
    (entry) => entry.codigoFipe === codigoFipe && entry.date === today
  ) || null;
}

/**
 * Salva preço FIPE no cache diário
 */
export function setDailyCache(
  codigoFipe: string,
  fipe: number,
  mesReferencia: string
): void {
  const cache = loadCache();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Remover entrada existente para hoje
  cache.dailyCache = cache.dailyCache.filter(
    (entry) => !(entry.codigoFipe === codigoFipe && entry.date === today)
  );
  
  // Adicionar nova entrada
  cache.dailyCache.push({
    codigoFipe,
    date: today,
    fipe,
    mesReferencia,
  });
  
  // Limpar cache antigo (mais de 7 dias)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
  
  cache.dailyCache = cache.dailyCache.filter(
    (entry) => entry.date >= sevenDaysAgoStr
  );
  
  saveCache(cache);
}

/**
 * Limpa todo o cache
 */
export function clearCache(): void {
  saveCache({ resolvedCodes: [], dailyCache: [] });
}
