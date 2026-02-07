/**
 * Mapa de códigos FIPE para veículos do cliente
 * Códigos obtidos da BrasilAPI: https://brasilapi.com.br/api/fipe
 */

export const fipeMap: Record<string, string> = {
  "VW Polo 2020": "005340-2",
  "VW Gol 2022": "005485-8",
  "VW Saveiro 2012": "005287-1",
  "Jaguar F-Pace 2021": "059594-8",
  "Mercedes GLC43 2017": "021373-0",
  "Porsche Cayenne 2020": "035206-4",
  "MB Atego 2425 2012": "509049-6",
  "VW 18.310 2003": "509052-6",
  "Peugeot Expert 2022": "024176-8",
};

/**
 * Busca código FIPE por nome do veículo
 */
export function getCodigoFipe(nomeVeiculo: string, ano: number): string | null {
  const chave = `${nomeVeiculo} ${ano}`;
  return fipeMap[chave] || null;
}

/**
 * Busca código FIPE por ID do veículo (mapeamento direto)
 */
export function getCodigoFipeById(id: string): string | null {
  const mapeamentoId: Record<string, string> = {
    'CAR001': '005340-2', // VW Polo 2020
    'CAR002': '005485-8', // VW Gol 2022
    'CAR003': '005287-1', // VW Saveiro 2012
    'SUV001': '059594-8', // Jaguar F-Pace 2021
    'SUV002': '021373-0', // Mercedes GLC43 2017
    'SUV003': '035206-4', // Porsche Cayenne 2020
    'TRK001': '509049-6', // MB Atego 2425 2012
    'TRK002': '509052-6', // VW 18.310 2003
    'VAN001': '024176-8', // Peugeot Expert 2022
  };
  
  return mapeamentoId[id] || null;
}
