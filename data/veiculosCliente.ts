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

export const veiculosCliente: VeiculoCliente[] = [
  {
    id: 'CAR001',
    tipo: 'carro',
    nome: 'VW Polo',
    ano: 2020,
    codigoFipe: '', // Preencher com código FIPE real quando disponível
    multiplicador: 1.3,
  },
  {
    id: 'SUV001',
    tipo: 'carro',
    nome: 'Jaguar F-Pace',
    ano: 2021,
    codigoFipe: '', // Preencher com código FIPE real quando disponível
    multiplicador: 1.3,
  },
  {
    id: 'TRK001',
    tipo: 'caminhao',
    nome: 'MB Atego 2425',
    ano: 2012,
    codigoFipe: '', // Preencher com código FIPE real quando disponível
    multiplicador: 1.3,
  },
  {
    id: 'TRK002',
    tipo: 'caminhao',
    nome: 'VW 18.310',
    ano: 2003,
    codigoFipe: '', // Preencher com código FIPE real quando disponível
    multiplicador: 1.3,
  },
  {
    id: 'EMP001',
    tipo: 'maquina',
    nome: 'Empilhadeira Clark',
    ano: 2022,
    fipeManual: 156000, // Máquinas não têm FIPE oficial
    multiplicador: 1.3,
  },
];
