/**
 * Base de valores FIPE do catálogo
 * Valores do catálogo "Catálogo Veículos 02.26"
 * Estes valores são usados como fallback para nunca mostrar FIPE = R$ 0,00
 */

export interface VeiculoBase {
  id: string;
  tipo: 'carros' | 'caminhoes' | 'maquinas' | 'outros';
  modelo: string;
  ano: number;
  valorBase: number; // FIPE do catálogo (sempre disponível)
}

export const veiculosBase: VeiculoBase[] = [
  // Carros
  { id: 'CAR001', tipo: 'carros', modelo: 'VW Polo', ano: 2020, valorBase: 75000 },
  { id: 'CAR002', tipo: 'carros', modelo: 'VW Gol', ano: 2022, valorBase: 52000 },
  { id: 'CAR003', tipo: 'carros', modelo: 'VW Saveiro', ano: 2012, valorBase: 44000 },
  
  // SUVs
  { id: 'SUV001', tipo: 'carros', modelo: 'Jaguar F-Pace', ano: 2021, valorBase: 529000 },
  { id: 'SUV002', tipo: 'carros', modelo: 'Mercedes GLC43', ano: 2017, valorBase: 270000 },
  { id: 'SUV003', tipo: 'carros', modelo: 'Porsche Cayenne', ano: 2020, valorBase: 470000 },
  
  // Caminhões
  { id: 'TRK001', tipo: 'caminhoes', modelo: 'MB Atego 2425', ano: 2012, valorBase: 267000 },
  { id: 'TRK002', tipo: 'caminhoes', modelo: 'VW 18.310', ano: 2003, valorBase: 80000 },
  { id: 'TRK003', tipo: 'caminhoes', modelo: 'VW Express', ano: 2021, valorBase: 234000 },
  
  // Vans
  { id: 'VAN001', tipo: 'carros', modelo: 'Peugeot Expert', ano: 2022, valorBase: 129000 },
  
  // Máquinas/Equipamentos
  { id: 'EQP001', tipo: 'maquinas', modelo: 'Empilhadeira Clark', ano: 2022, valorBase: 156000 },
  
  // Outros
  { id: 'BAU001', tipo: 'outros', modelo: 'Baú Sider', ano: 1986, valorBase: 40000 },
  { id: 'PLT001', tipo: 'outros', modelo: 'Plataforma Marksell', ano: 2021, valorBase: 20000 },
];

/**
 * Busca valor base do catálogo por ID
 */
export function getValorBase(id: string): number {
  const veiculo = veiculosBase.find(v => v.id === id);
  return veiculo?.valorBase || 0;
}

/**
 * Busca veículo base por ID
 */
export function getVeiculoBase(id: string): VeiculoBase | undefined {
  return veiculosBase.find(v => v.id === id);
}
