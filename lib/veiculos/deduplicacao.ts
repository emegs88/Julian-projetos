/**
 * Utilitários para deduplicação de veículos
 */

import { Veiculo } from '@/types';

/**
 * Normaliza o modelo do veículo para comparação
 * Remove espaços extras, converte para minúsculas, remove acentos
 */
export function normalizeModelo(modelo: string): string {
  return modelo
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Múltiplos espaços -> um espaço
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
}

/**
 * Gera chave única do veículo: modelo + ano
 * Formato: "modelo_normalizado|ano"
 */
export function vehicleKey(veiculo: Veiculo | { modelo: string; ano: number }): string {
  const modeloNormalizado = normalizeModelo(veiculo.modelo);
  return `${modeloNormalizado}|${veiculo.ano}`;
}

/**
 * Prioridade de fonte FIPE (maior = melhor)
 */
const PRIORIDADE_FONTE: Record<string, number> = {
  API: 3,
  MANUAL: 2,
  CATALOGO: 1,
};

/**
 * Sanitiza lista de veículos removendo duplicados
 * Mantém o veículo com maior prioridade de fonte
 * 
 * @param veiculos Lista de veículos (pode conter duplicados)
 * @returns Lista deduplicada e contagem de duplicados removidos
 */
export function sanitizeVehicles(veiculos: Veiculo[]): {
  veiculosUnicos: Veiculo[];
  duplicadosRemovidos: number;
} {
  const map = new Map<string, Veiculo>();
  let duplicadosRemovidos = 0;

  for (const veiculo of veiculos) {
    const key = vehicleKey(veiculo);
    const existente = map.get(key);

    if (!existente) {
      // Primeira ocorrência, adicionar
      map.set(key, veiculo);
    } else {
      // Duplicado encontrado
      duplicadosRemovidos++;

      // Comparar prioridade de fonte
      const prioridadeExistente = PRIORIDADE_FONTE[existente.fonteFipe] || 0;
      const prioridadeNovo = PRIORIDADE_FONTE[veiculo.fonteFipe] || 0;

      if (prioridadeNovo > prioridadeExistente) {
        // Novo veículo tem maior prioridade, substituir
        map.set(key, veiculo);
      }
      // Caso contrário, manter o existente
    }
  }

  return {
    veiculosUnicos: Array.from(map.values()),
    duplicadosRemovidos,
  };
}

/**
 * Verifica se um veículo já existe na lista
 */
export function veiculoJaExiste(veiculo: Veiculo | { modelo: string; ano: number }, lista: Veiculo[]): boolean {
  const key = vehicleKey(veiculo);
  return lista.some(v => vehicleKey(v) === key);
}

/**
 * Encontra veículo duplicado na lista
 */
export function encontrarDuplicado(veiculo: Veiculo | { modelo: string; ano: number }, lista: Veiculo[]): Veiculo | undefined {
  const key = vehicleKey(veiculo);
  return lista.find(v => vehicleKey(v) === key);
}
