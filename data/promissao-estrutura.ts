/**
 * Estrutura de operação típica para Promissão/SP
 * Valores de referência baseados em operações reais da região
 */

import { EstruturaOperacao } from '@/types';

export const estruturaPromissaoReferencia: Partial<EstruturaOperacao> = {
  // Valores típicos para consórcio contemplado em Promissão
  taxaAdministracao: 1.2, // % a.a. (típico para região)
  taxaAdministracaoTipo: 'anual',
  fundoReserva: 2.5, // % (padrão)
  seguro: 0.5, // % (opcional)
  desagio: 3.0, // % (deságio típico na venda do crédito)
  taxaIntermediacao: 2.0, // % (taxa de intermediação)
  custoDocumentacao: 1500, // R$ (documentação)
  custoRegistro: 2000, // R$ (registro)
  custoITBI: 1000, // R$ (ITBI)
  custoComissoes: 500, // R$ (comissões)
  custoOutros: 0, // R$ (outros)
  prazoEstimado: 120, // meses (10 anos)
  fluxoMensalEstimado: 0, // será calculado
};

// Cenários típicos para Promissão
export const cenariosPromissao = {
  conservador: {
    ltv: 60,
    desagio: 5,
    taxa: 1.5,
    custos: 3.5,
  },
  base: {
    ltv: 70,
    desagio: 3,
    taxa: 1.2,
    custos: 2.5,
  },
  agressivo: {
    ltv: 80,
    desagio: 1.5,
    taxa: 1.0,
    custos: 2.0,
  },
};

// Informações específicas de mercado Promissão/SP
export const mercadoPromissao = {
  cidade: 'Promissão',
  uf: 'SP',
  regiao: 'Interior de São Paulo',
  caracteristicas: [
    'Mercado imobiliário em crescimento',
    'Localização estratégica próxima a rodovias',
    'Demanda por lotes residenciais',
    'Valorização constante',
  ],
  valorMedioM2: 500, // R$/m² (referência)
  tendencia: 'Alta',
};
