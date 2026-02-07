import { EstruturaOperacao, Lote, Garantia, CronogramaMes, FluxoCaixa, CalculosResultado, Veiculo, CotaAutomovel } from '@/types';
import { calculateIRR } from './irr';

/**
 * Calcula o valor líquido disponível
 */
export function calcularValorLiquido(estrutura: EstruturaOperacao): number {
  const custosTotais = 
    (estrutura.custoDocumentacao || 0) +
    (estrutura.custoRegistro || 0) +
    (estrutura.custoITBI || 0) +
    (estrutura.custoComissoes || 0) +
    (estrutura.custoOutros || 0);
  const desagio = (estrutura.credito * estrutura.desagio) / 100;
  const intermediacao = (estrutura.credito * estrutura.taxaIntermediacao) / 100;
  
  return estrutura.credito - estrutura.entrada - custosTotais - desagio - intermediacao;
}

/**
 * Calcula o total de custos
 */
export function calcularTotalCustos(estrutura: EstruturaOperacao): number {
  return (
    (estrutura.custoDocumentacao || 0) +
    (estrutura.custoRegistro || 0) +
    (estrutura.custoITBI || 0) +
    (estrutura.custoComissoes || 0) +
    (estrutura.custoOutros || 0)
  );
}

/**
 * Calcula o cronograma de saldo devedor
 */
export function calcularCronograma(estrutura: EstruturaOperacao): CronogramaMes[] {
  const cronograma: CronogramaMes[] = [];
  const prazo = estrutura.prazoTotal;
  const credito = estrutura.credito;
  const parcela = estrutura.parcelaMensal;
  
  // Validar entradas
  if (prazo <= 0 || credito <= 0) {
    return [{
      mes: 0,
      saldoDevedor: 0,
      parcela: 0,
      juros: 0,
      amortizacao: 0,
      saldoInicial: 0,
    }];
  }
  
  // Taxa mensal (assumindo taxa de administração anual)
  let taxaMensal = 0;
  if (estrutura.taxaAdministracaoTipo === 'anual') {
    taxaMensal = Math.pow(1 + estrutura.taxaAdministracao / 100, 1 / 12) - 1;
  } else {
    taxaMensal = estrutura.taxaAdministracao / 100 / prazo;
  }
  
  // Saldo devedor inicial = crédito menos entrada (entrada é descontada do crédito)
  let saldoDevedor = Math.max(0, credito - estrutura.entrada);
  
  for (let mes = 0; mes <= prazo; mes++) {
    if (mes === 0) {
      cronograma.push({
        mes: 0,
        saldoDevedor,
        parcela: 0,
        juros: 0,
        amortizacao: 0,
        saldoInicial: saldoDevedor,
      });
      continue;
    }
    
    const saldoInicial = saldoDevedor;
    const juros = saldoDevedor * taxaMensal;
    
    // Verificar se o cliente já começou a pagar
    let parcelaPaga = 0;
    if (!estrutura.pagamentoAposAprovado || mes >= estrutura.mesInicioPagamento) {
      parcelaPaga = parcela;
    }
    
    const amortizacao = parcelaPaga - juros;
    saldoDevedor = Math.max(0, saldoDevedor - amortizacao);
    
    cronograma.push({
      mes,
      saldoDevedor,
      parcela: parcelaPaga,
      juros,
      amortizacao,
      saldoInicial,
    });
  }
  
  return cronograma;
}

/**
 * Calcula o fluxo de caixa
 */
export function calcularFluxoCaixa(
  estrutura: EstruturaOperacao,
  cronograma: CronogramaMes[]
): FluxoCaixa[] {
  const fluxo: FluxoCaixa[] = [];
  const valorLiquido = calcularValorLiquido(estrutura);
  
  let saldoAcumulado = 0;
  
  for (let i = 0; i < cronograma.length; i++) {
    const mes = cronograma[i].mes;
    
    let entrada = 0;
    let saida = 0;
    
    if (mes === 0) {
      entrada = valorLiquido;
    }
    
    // Parcelas pagas pelo cliente (negativas no fluxo)
    saida = -cronograma[i].parcela;
    
    // Custos pontuais (se houver)
    // TODO: adicionar custos pontuais em meses específicos
    
    saldoAcumulado += entrada + saida;
    
    fluxo.push({
      mes,
      entrada,
      saida,
      saldo: saldoAcumulado,
    });
  }
  
  return fluxo;
}

/**
 * Calcula o valor da garantia baseado nos lotes selecionados
 */
export function calcularValorGarantia(
  lotes: Lote[],
  garantia: Garantia,
  veiculos?: Veiculo[],
  cotasAutomoveis?: CotaAutomovel[]
): number {
  let valorLotes = 0;
  let valorVeiculos = 0;
  let valorCotasAutomoveis = 0;

  // Calcular garantia de lotes
  if (garantia.lotesSelecionados.length > 0) {
    const lotesSelecionados = lotes.filter((lote) =>
      garantia.lotesSelecionados.includes(lote.id)
    );
    
    valorLotes = lotesSelecionados.reduce((total, lote) => {
      const valor =
        garantia.criterioAvaliacao === 'mercado'
          ? lote.valorMercado
          : lote.valorVendaForcada;
      return total + valor;
    }, 0);
  }

  // Calcular garantia de veículos (130% FIPE)
  if (garantia.usarVeiculos && veiculos && garantia.veiculosSelecionados.length > 0) {
    const veiculosSelecionados = veiculos.filter((veiculo) =>
      garantia.veiculosSelecionados.includes(veiculo.id)
    );
    
    valorVeiculos = veiculosSelecionados.reduce((total, veiculo) => {
      return total + veiculo.valorGarantia; // Já está calculado como 130% da FIPE
    }, 0);
  }

  // Calcular garantia de cotas de automóveis (130% FIPE)
  if (garantia.usarVeiculos && cotasAutomoveis && garantia.veiculosSelecionados.length > 0) {
    const cotasSelecionadas = cotasAutomoveis.filter((cota) =>
      garantia.veiculosSelecionados.includes(cota.id)
    );
    
    valorCotasAutomoveis = cotasSelecionadas.reduce((total, cota) => {
      return total + cota.valorGarantia; // Já está calculado como 130% da FIPE
    }, 0);
  }

  return valorLotes + valorVeiculos + valorCotasAutomoveis;
}

/**
 * Calcula o limite de saldo baseado no LTV
 */
export function calcularLimiteSaldo(valorGarantia: number, ltvMaximo: number): number {
  return (valorGarantia * ltvMaximo) / 100;
}

/**
 * Encontra o saldo pico e o mês correspondente
 */
export function encontrarSaldoPico(cronograma: CronogramaMes[]): {
  saldoPico: number;
  mesSaldoPico: number;
} {
  let saldoPico = 0;
  let mesSaldoPico = 0;
  
  cronograma.forEach((item) => {
    if (item.saldoDevedor > saldoPico) {
      saldoPico = item.saldoDevedor;
      mesSaldoPico = item.mes;
    }
  });
  
  return { saldoPico, mesSaldoPico };
}

/**
 * Calcula a quantidade mínima de matrículas necessárias
 */
export function calcularMinimoMatriculas(
  lotes: Lote[],
  garantia: Garantia,
  saldoPico: number,
  estrategia: 'maior-primeiro' | 'menor-primeiro' = 'maior-primeiro'
): number {
  const limiteNecessario = saldoPico / (garantia.ltvMaximo / 100);
  
  // Ordenar lotes
  const lotesOrdenados = [...lotes].sort((a, b) => {
    const valorA =
      garantia.criterioAvaliacao === 'mercado'
        ? a.valorMercado
        : a.valorVendaForcada;
    const valorB =
      garantia.criterioAvaliacao === 'mercado'
        ? b.valorMercado
        : b.valorVendaForcada;
    
    return estrategia === 'maior-primeiro' ? valorB - valorA : valorA - valorB;
  });
  
  let soma = 0;
  let quantidade = 0;
  
  for (const lote of lotesOrdenados) {
    const valor =
      garantia.criterioAvaliacao === 'mercado'
        ? lote.valorMercado
        : lote.valorVendaForcada;
    
    soma += valor;
    quantidade++;
    
    if (soma >= limiteNecessario) {
      break;
    }
  }
  
  return quantidade;
}

/**
 * Função principal: calcula todos os resultados
 */
export function calcularTodos(
  estrutura: EstruturaOperacao,
  lotes: Lote[],
  garantia: Garantia,
  veiculos?: Veiculo[],
  cotasAutomoveis?: CotaAutomovel[]
): CalculosResultado {
  const valorLiquido = calcularValorLiquido(estrutura);
  const cronograma = calcularCronograma(estrutura);
  const fluxoCaixa = calcularFluxoCaixa(estrutura, cronograma);
  const { saldoPico, mesSaldoPico } = encontrarSaldoPico(cronograma);
  const valorGarantia = calcularValorGarantia(lotes, garantia, veiculos, cotasAutomoveis);
  const limiteSaldo = calcularLimiteSaldo(valorGarantia, garantia.ltvMaximo);
  
  // Calcular CET (IRR)
  const cashFlows = fluxoCaixa.map((fc) => fc.entrada + fc.saida);
  const irrResult = calculateIRR(cashFlows);
  
  // Verificar se está dentro do limite LTV
  const dentroLimiteLTV = saldoPico <= limiteSaldo;
  
  // Calcular quantidade mínima de matrículas
  const quantidadeMinimaMatriculas = calcularMinimoMatriculas(
    lotes,
    garantia,
    saldoPico
  );
  
  // Gerar alertas
  const alertas: string[] = [];
  if (!dentroLimiteLTV) {
    alertas.push(
      `Saldo devedor pico (R$ ${saldoPico.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}) excede o limite LTV (R$ ${limiteSaldo.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })})`
    );
    alertas.push(
      `Necessário selecionar pelo menos ${quantidadeMinimaMatriculas} matrículas para cobrir o saldo pico`
    );
  }
  
  if (valorLiquido <= 0) {
    alertas.push('Valor líquido disponível é negativo ou zero');
  }
  
  if (!irrResult.converged) {
    alertas.push('Não foi possível calcular o CET com precisão');
  }
  
  return {
    valorLiquido,
    saldoPico,
    mesSaldoPico,
    valorGarantia,
    limiteSaldo,
    quantidadeMinimaMatriculas,
    cetMensal: irrResult.rate,
    cetAnual: irrResult.rateAnnual,
    cronograma,
    fluxoCaixa,
    dentroLimiteLTV,
    alertas,
  };
}
