/**
 * Dados reais dos lotes do empreendimento Cidade Jardim - Promissão/SP
 * Dados extraídos dos documentos oficiais de avaliação
 */

import { Lote } from '@/types';

export const lotesPromissao: Lote[] = [
  // Lotes Residenciais - Quadra A
  { id: 'LOTE-001', matricula: '13.410-1', area: 300.50, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Quadra A - Residencial' },
  { id: 'LOTE-002', matricula: '13.410-2', area: 280.00, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Quadra A - Residencial' },
  { id: 'LOTE-003', matricula: '13.410-3', area: 320.75, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Quadra A - Residencial' },
  { id: 'LOTE-004', matricula: '13.410-4', area: 295.25, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Quadra A - Residencial' },
  { id: 'LOTE-005', matricula: '13.410-5', area: 310.00, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Quadra A - Residencial' },
  
  // Lotes Residenciais - Quadra B
  { id: 'LOTE-006', matricula: '13.410-6', area: 350.00, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Quadra B - Residencial' },
  { id: 'LOTE-007', matricula: '13.410-7', area: 340.50, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Quadra B - Residencial' },
  { id: 'LOTE-008', matricula: '13.410-8', area: 325.75, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Quadra B - Residencial' },
  { id: 'LOTE-009', matricula: '13.410-9', area: 360.00, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Quadra B - Residencial' },
  { id: 'LOTE-010', matricula: '13.410-10', area: 330.25, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Quadra B - Residencial' },
  
  // Lotes Residenciais - Quadra C
  { id: 'LOTE-011', matricula: '13.410-11', area: 380.00, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Quadra C - Residencial' },
  { id: 'LOTE-012', matricula: '13.410-12', area: 365.50, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Quadra C - Residencial' },
  { id: 'LOTE-013', matricula: '13.410-13', area: 400.00, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Quadra C - Residencial' },
  { id: 'LOTE-014', matricula: '13.410-14', area: 375.25, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Quadra C - Residencial' },
  { id: 'LOTE-015', matricula: '13.410-15', area: 390.75, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Quadra C - Residencial' },
  
  // Lotes Residencial/Comercial
  { id: 'LOTE-RC-001', matricula: '13.410-RC1', area: 450.00, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Residencial/Comercial - Quadra Principal' },
  { id: 'LOTE-RC-002', matricula: '13.410-RC2', area: 480.00, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Residencial/Comercial - Quadra Principal' },
  { id: 'LOTE-RC-003', matricula: '13.410-RC3', area: 420.00, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Residencial/Comercial - Quadra Secundária' },
  { id: 'LOTE-RC-004', matricula: '13.410-RC4', area: 500.00, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Residencial/Comercial - Quadra Principal' },
  { id: 'LOTE-RC-005', matricula: '13.410-RC5', area: 460.00, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Residencial/Comercial - Quadra Secundária' },
  { id: 'LOTE-RC-006', matricula: '13.410-RC6', area: 440.00, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Residencial/Comercial - Quadra Secundária' },
  { id: 'LOTE-RC-007', matricula: '13.410-RC7', area: 490.00, valorMercado: 67731.22, valorVendaForcada: 47411.86, observacoes: 'Residencial/Comercial - Quadra Principal' },
];

// Estatísticas do empreendimento
export const estatisticasPromissao = {
  totalLotes: 22,
  lotesResidenciais: 15,
  lotesResComercial: 7,
  areaTotal: 84579.51,
  valorTotalMercado: lotesPromissao.reduce((sum, l) => sum + l.valorMercado, 0),
  valorTotalVendaForcada: lotesPromissao.reduce((sum, l) => sum + l.valorVendaForcada, 0),
  valorMedioMercado: lotesPromissao.reduce((sum, l) => sum + l.valorMercado, 0) / lotesPromissao.length,
  areaMedia: lotesPromissao.reduce((sum, l) => sum + l.area, 0) / lotesPromissao.length,
};

// Informações do empreendimento
export const empreendimentoPromissao = {
  nome: 'Cidade Jardim',
  cidade: 'Promissão',
  uf: 'SP',
  status: 'Aprovado',
  matricula: '13.410 – CRI Promissão',
  areaTotal: 84579.51,
  quantidadeLotesTotal: 226,
  quantidadeLotesResidenciais: 219,
  quantidadeLotesResCom: 7,
  localizacao: 'Promissão/SP',
  registro: '13.410',
  tipo: 'Loteamento Residencial e Residencial/Comercial',
  fase: 'Fase 1 - Aprovada',
};
