/**
 * Tipos para integração com Marketplace BidCon
 */

export type TipoBem = 'IMOVEL' | 'AUTO' | 'SERVICOS' | 'OUTROS';
export type StatusCota = 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO';

export interface CotaMarketplace {
  id: string;
  tipoBem: TipoBem;
  administradora: string;
  grupo: string;
  cota: string;
  credito: number;
  prazoMeses: number;
  parcela: number;
  taxaAdmPercent: number;
  fundoReservaPercent: number;
  seguroMensal: number;
  valorEntrada: number;
  valorLiquidoAPagar: number;
  saldoDevedorAtual: number;
  status: StatusCota;
  createdAt: string;
  updatedAt: string;
  linkPublico: string;
}

export interface ReservaCota {
  cartaId: string;
  reservadoPor: string;
  ttlMinutos: number;
}

export interface ConfirmarCompra {
  reservaId: string;
  comprador: string;
  formaPagamento: string;
  comprovanteUrl?: string;
}

export interface CotaSelecionada extends CotaMarketplace {
  selecionada: boolean;
  reservaId?: string;
  reservadoPor?: string;
  expiresAt?: string;
}
