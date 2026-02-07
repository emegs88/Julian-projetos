/**
 * Tipos principais do sistema
 */

export interface Empreendimento {
  nome: string;
  cidade: string;
  uf: string;
  status: string;
  matricula: string;
  areaTotal: number; // m²
  quantidadeLotesTotal: number;
  quantidadeLotesResidenciais: number;
  quantidadeLotesResCom: number;
}

export interface Lote {
  id: string;
  matricula: string;
  area: number; // m²
  valorMercado: number;
  valorVendaForcada: number;
  observacoes?: string;
  selecionado?: boolean;
}

export interface EstruturaOperacao {
  credito: number;
  entrada: number;
  taxaAdministracao: number; // % a.a. ou total
  taxaAdministracaoTipo: 'anual' | 'total';
  fundoReserva: number; // %
  seguro: number; // % (opcional)
  prazoTotal: number; // meses
  parcelaMensal: number; // PMT
  dataContemplacao: Date;
  dataLiberacao: Date;
  mesInicioPagamento: number; // Mês em que o cliente começa a pagar
  pagamentoAposAprovado: boolean; // Toggle
  desagio: number; // % de deságio na venda do crédito
  taxaIntermediacao: number; // %
  // Custos detalhados
  custoDocumentacao: number;
  custoRegistro: number;
  custoITBI: number;
  custoComissoes: number;
  custoOutros: number;
  // Prazo e fluxo estimados
  prazoEstimado: number; // meses estimados
  fluxoMensalEstimado: number; // valor mensal estimado
}

export interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa?: string;
  chassi?: string;
  fipe: number; // Valor FIPE atual (pode ser fipeAtual ou fipeBase)
  fipeBase: number; // Valor base do catálogo (sempre disponível)
  fipeAtual?: number; // Valor FIPE da API (opcional)
  fonteFipe: 'CATALOGO' | 'API' | 'MANUAL'; // Fonte do valor FIPE
  mesReferencia?: string; // Mês de referência da FIPE (se da API)
  codigoFipe?: string; // Código FIPE resolvido
  valorGarantia: number; // (fipeAtual ?? fipeBase) * multiplicador
  multiplicador: number; // Multiplicador padrão 1.3
  observacoes?: string;
  selecionado?: boolean;
}

export interface CotaAutomovel {
  id: string;
  grupo: string;
  cota: string;
  marca: string;
  modelo: string;
  ano: number;
  valorContemplacao: number; // Valor da cota contemplada
  fipe: number; // Valor FIPE do veículo
  valorGarantia: number; // FIPE * 1.3 (130%)
  placa?: string;
  chassi?: string;
  dataContemplacao?: Date;
  observacoes?: string;
  selecionado?: boolean;
}

export interface Garantia {
  ltvMaximo: number; // % (ex: 70 ou 80)
  criterioAvaliacao: 'mercado' | 'venda-forcada';
  lotesSelecionados: string[]; // IDs dos lotes
  modoJuncao: 'individual' | 'consolidado'; // Modo de junção
  veiculosSelecionados: string[]; // IDs dos veículos
  usarVeiculos: boolean; // Toggle para usar veículos como garantia
}

export interface CenarioGarantia {
  id: string;
  nome: string;
  lotesSelecionados: string[];
  valorTotal: number;
  areaTotal: number;
  quantidadeLotes: number;
  dataCriacao: Date;
}

export interface CronogramaMes {
  mes: number;
  saldoDevedor: number;
  parcela: number;
  juros: number;
  amortizacao: number;
  saldoInicial: number;
}

export interface FluxoCaixa {
  mes: number;
  entrada: number; // Positivo = recebe
  saida: number; // Negativo = paga
  saldo: number; // Acumulado
}

export interface Cenario {
  id: string;
  nome: 'conservador' | 'base' | 'agressivo';
  ltv: number;
  desagio: number;
  taxa: number;
  custos: number;
  estrutura: Partial<EstruturaOperacao>;
}

export interface Cota {
  id: string;
  grupo: string;
  cota: string;
  credito: number;
  parcelaMensal: number;
  saldoDevedor: number;
  prazo: number; // meses
  observacoes?: string;
}

export interface CalculosResultado {
  valorLiquido: number;
  saldoPico: number;
  mesSaldoPico: number;
  valorGarantia: number;
  limiteSaldo: number;
  quantidadeMinimaMatriculas: number;
  cetMensal: number;
  cetAnual: number;
  cronograma: CronogramaMes[];
  fluxoCaixa: FluxoCaixa[];
  dentroLimiteLTV: boolean;
  alertas: string[];
}
