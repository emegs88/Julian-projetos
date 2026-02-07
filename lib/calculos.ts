import { EstruturaOperacao, Lote, Garantia, CronogramaMes, FluxoCaixa, CalculosResultado, Veiculo, CotaAutomovel } from '@/types';
import { calculateIRR } from './irr';

/**
 * Calcula o valor líquido disponível
 */
export function calcularValorLiquido(estrutura: EstruturaOperacao): number {
  // Validar entrada
  if (!estrutura || typeof estrutura.credito !== 'number' || isNaN(estrutura.credito)) {
    return 0;
  }

  const custosTotais = 
    (estrutura.custoDocumentacao || 0) +
    (estrutura.custoRegistro || 0) +
    (estrutura.custoITBI || 0) +
    (estrutura.custoComissoes || 0) +
    (estrutura.custoOutros || 0);
  const desagio = (estrutura.credito * (estrutura.desagio || 0)) / 100;
  const intermediacao = (estrutura.credito * (estrutura.taxaIntermediacao || 0)) / 100;
  
  const valorLiquido = estrutura.credito - (estrutura.entrada || 0) - custosTotais - desagio - intermediacao;
  
  // Proteção contra valores inválidos
  if (isNaN(valorLiquido) || !isFinite(valorLiquido)) {
    return 0;
  }
  
  return Math.max(0, valorLiquido);
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
  const prazo = Math.max(0, Math.floor(estrutura.prazoTotal || 0));
  const credito = Math.max(0, estrutura.credito || 0);
  const parcela = Math.max(0, estrutura.parcelaMensal || 0);
  
  // Validar entradas
  if (prazo <= 0 || credito <= 0 || isNaN(prazo) || isNaN(credito) || !isFinite(prazo) || !isFinite(credito)) {
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
  const taxaAdm = Math.max(0, estrutura.taxaAdministracao || 0);
  if (estrutura.taxaAdministracaoTipo === 'anual' && taxaAdm > 0) {
    taxaMensal = Math.pow(1 + taxaAdm / 100, 1 / 12) - 1;
    if (isNaN(taxaMensal) || !isFinite(taxaMensal)) {
      taxaMensal = 0;
    }
  } else if (prazo > 0) {
    taxaMensal = taxaAdm / 100 / prazo;
    if (isNaN(taxaMensal) || !isFinite(taxaMensal)) {
      taxaMensal = 0;
    }
  }
  
  // Saldo devedor inicial = crédito menos entrada (entrada é descontada do crédito)
  // IMPORTANTE: A entrada reduz o saldo devedor inicial
  const entrada = Math.max(0, estrutura.entrada || 0);
  let saldoDevedor = Math.max(0, credito - entrada);
  
  // Validar que saldo inicial é positivo
  if (saldoDevedor <= 0 && credito > 0) {
    console.warn('⚠️ Saldo devedor inicial é zero ou negativo. Entrada pode estar igual ou maior que o crédito.');
  }
  
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
    
    // Calcular juros sobre o saldo devedor
    const juros = Math.max(0, saldoDevedor * taxaMensal);
    
    // Verificar se o cliente já começou a pagar (carência)
    let parcelaPaga = 0;
    const mesInicio = Math.max(1, estrutura.mesInicioPagamento || 1); // Mínimo mês 1
    
    // Se pagamentoAposAprovado = true, só paga a partir do mesInicio
    // Se pagamentoAposAprovado = false, paga desde o mês 1
    if (!estrutura.pagamentoAposAprovado || mes >= mesInicio) {
      parcelaPaga = parcela;
    }
    
    // Amortização = parcela - juros (se parcela > juros)
    const amortizacao = Math.max(0, parcelaPaga - juros);
    
    // Atualizar saldo devedor
    saldoDevedor = Math.max(0, saldoDevedor - amortizacao);
    
    // Validar consistência: se parcela < juros, saldo aumenta (não amortiza)
    if (parcelaPaga > 0 && parcelaPaga < juros) {
      // Cliente paga menos que os juros, saldo aumenta
      // Isso é válido em alguns casos, mas pode indicar problema
      console.warn(`⚠️ Mês ${mes}: Parcela (${parcelaPaga}) menor que juros (${juros}). Saldo pode aumentar.`);
    }
    
    // Proteção contra valores inválidos
    if (isNaN(saldoDevedor) || !isFinite(saldoDevedor)) {
      saldoDevedor = 0;
    }
    
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
 * PARTE C: Validação de sinais financeiros
 * - Entrada de recurso (líquido) deve ser POSITIVO (para o projeto)
 * - Pagamentos do cliente devem ser NEGATIVOS (saída de caixa do projeto)
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
      // Mês 0: Entrada do recurso líquido (POSITIVO para o projeto)
      entrada = Math.max(0, valorLiquido);
      
      // Validar que entrada é positiva
      if (entrada <= 0) {
        console.warn('⚠️ Valor líquido é zero ou negativo. Verifique a estrutura da operação.');
      }
    }
    
    // Parcelas pagas pelo cliente (NEGATIVAS no fluxo - saída de caixa do projeto)
    // O cliente paga, então é saída para o projeto
    saida = -Math.max(0, cronograma[i].parcela);
    
    // Custos pontuais em meses específicos (se implementado no futuro)
    // Exemplo: custo de renovação no mês 12, custo de vistoria no mês 6, etc.
    // const custosPontuais = estrutura.custosPontuais?.[mes] || 0;
    // saida -= custosPontuais;
    
    // Validar sinais
    // entrada deve ser >= 0 (recebe recurso)
    // saida deve ser <= 0 (paga)
    if (entrada < 0) {
      console.warn(`⚠️ Mês ${mes}: Entrada negativa detectada. Corrigindo para 0.`);
      entrada = 0;
    }
    
    if (saida > 0) {
      console.warn(`⚠️ Mês ${mes}: Saída positiva detectada. Corrigindo para negativa.`);
      saida = -Math.abs(saida);
    }
    
    saldoAcumulado += entrada + saida;
    
    // Proteção contra valores inválidos
    if (isNaN(saldoAcumulado) || !isFinite(saldoAcumulado)) {
      saldoAcumulado = 0;
    }
    
    fluxo.push({
      mes,
      entrada: Math.max(0, entrada), // Garantir >= 0
      saida: Math.min(0, saida), // Garantir <= 0
      saldo: saldoAcumulado,
    });
  }
  
  // Validação final do fluxo
  const primeiraEntrada = fluxo.find(f => f.entrada > 0);
  if (!primeiraEntrada) {
    console.warn('⚠️ Nenhuma entrada de recurso detectada no fluxo de caixa.');
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
  // Validar entradas
  if (!lotes || !garantia) {
    return 0;
  }

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

  const total = valorLotes + valorVeiculos + valorCotasAutomoveis;
  
  // Proteção contra valores inválidos
  if (isNaN(total) || !isFinite(total)) {
    return 0;
  }
  
  return Math.max(0, total);
}

/**
 * Calcula o limite de saldo baseado no LTV
 */
export function calcularLimiteSaldo(valorGarantia: number, ltvMaximo: number): number {
  // Validar entradas
  if (isNaN(valorGarantia) || isNaN(ltvMaximo) || !isFinite(valorGarantia) || !isFinite(ltvMaximo)) {
    return 0;
  }
  
  const limite = (Math.max(0, valorGarantia) * Math.max(0, Math.min(100, ltvMaximo))) / 100;
  
  if (isNaN(limite) || !isFinite(limite)) {
    return 0;
  }
  
  return Math.max(0, limite);
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
  
  if (!cronograma || cronograma.length === 0) {
    return { saldoPico: 0, mesSaldoPico: 0 };
  }
  
  cronograma.forEach((item) => {
    const saldo = Math.max(0, item.saldoDevedor || 0);
    if (!isNaN(saldo) && isFinite(saldo) && saldo > saldoPico) {
      saldoPico = saldo;
      mesSaldoPico = item.mes || 0;
    }
  });
  
  // Proteção final
  if (isNaN(saldoPico) || !isFinite(saldoPico)) {
    saldoPico = 0;
  }
  
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
