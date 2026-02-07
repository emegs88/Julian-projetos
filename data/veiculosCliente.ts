/**
 * Veículos do Cliente - Lista Fixa
 * Apenas veículos cadastrados terão FIPE atualizada automaticamente
 */

export interface VeiculoCliente {
  id: string;
  tipo: 'carro' | 'caminhao' | 'maquina';
  nome: string;
  ano: number;
  codigoFipe?: string; // Se não tiver, usar fipeManual
  fipeManual?: number; // Para máquinas ou veículos sem FIPE oficial
  multiplicador: number; // Multiplicador para cálculo de garantia (padrão 1.3)
}

/**
 * Catálogo Veículos 02.26 - Todos os veículos do cliente
 * FIPE será buscada automaticamente quando houver código FIPE
 */
export const veiculosCliente: VeiculoCliente[] = [
  // Carros
  {
    id: 'CAR001',
    tipo: 'carro',
    nome: 'VW Polo',
    ano: 2020,
    codigoFipe: '', // Será buscado automaticamente
    multiplicador: 1.3,
  },
  {
    id: 'CAR002',
    tipo: 'carro',
    nome: 'VW Gol',
    ano: 2022,
    codigoFipe: '', // Será buscado automaticamente
    multiplicador: 1.3,
  },
  {
    id: 'CAR003',
    tipo: 'carro',
    nome: 'VW Saveiro',
    ano: 2012,
    codigoFipe: '', // Será buscado automaticamente
    multiplicador: 1.3,
  },
  {
    id: 'SUV001',
    tipo: 'carro',
    nome: 'Jaguar F-Pace',
    ano: 2021,
    codigoFipe: '', // Será buscado automaticamente
    multiplicador: 1.3,
  },
  {
    id: 'SUV002',
    tipo: 'carro',
    nome: 'Mercedes GLC43',
    ano: 2017,
    codigoFipe: '', // Será buscado automaticamente
    multiplicador: 1.3,
  },
  {
    id: 'SUV003',
    tipo: 'carro',
    nome: 'Porsche Cayenne',
    ano: 2020,
    codigoFipe: '', // Será buscado automaticamente
    multiplicador: 1.3,
  },
  // Caminhões
  {
    id: 'TRK001',
    tipo: 'caminhao',
    nome: 'MB Atego 2425',
    ano: 2012,
    codigoFipe: '', // Será buscado automaticamente
    multiplicador: 1.3,
  },
  {
    id: 'TRK002',
    tipo: 'caminhao',
    nome: 'VW 18.310',
    ano: 2003,
    codigoFipe: '', // Será buscado automaticamente
    multiplicador: 1.3,
  },
  // Vans
  {
    id: 'VAN001',
    tipo: 'carro',
    nome: 'Peugeot Expert',
    ano: 2022,
    codigoFipe: '', // Será buscado automaticamente
    multiplicador: 1.3,
  },
  // Máquinas/Equipamentos (sem FIPE oficial)
  {
    id: 'EMP001',
    tipo: 'maquina',
    nome: 'Empilhadeira Clark',
    ano: 2022,
    fipeManual: 156000, // Máquinas não têm FIPE oficial
    multiplicador: 1.3,
  },
];
