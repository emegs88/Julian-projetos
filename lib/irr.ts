/**
 * Solver de Custo Efetivo (IRR) usando Newton-Raphson com fallback para Bisseção
 * Calcula a taxa interna de retorno (IRR) onde NPV = 0
 */

export interface IRRResult {
  rate: number; // Taxa mensal
  rateAnnual: number; // Taxa anual equivalente
  converged: boolean;
  iterations: number;
  method: 'newton-raphson' | 'bisection';
  error?: string;
}

const MAX_ITERATIONS = 100;
const TOLERANCE = 1e-10;
const MIN_RATE = -0.99; // -99% (praticamente -100%)
const MAX_RATE = 2.0; // 200% ao mês (muito alto, mas permite encontrar)

/**
 * Calcula o NPV (Net Present Value) para uma taxa dada
 */
export function calculateNPV(cashFlows: number[], rate: number): number {
  if (cashFlows.length === 0) return 0;
  
  let npv = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    if (rate === -1) {
      // Caso especial: taxa = -100% (divisão por zero)
      return NaN;
    }
    npv += cashFlows[t] / Math.pow(1 + rate, t);
  }
  return npv;
}

/**
 * Calcula a derivada do NPV (NPV')
 */
export function calculateNPVDerivative(cashFlows: number[], rate: number): number {
  if (cashFlows.length === 0) return 0;
  if (rate === -1) return NaN;
  
  let derivative = 0;
  for (let t = 1; t < cashFlows.length; t++) {
    derivative -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
  }
  return derivative;
}

/**
 * Método de Newton-Raphson para encontrar IRR
 */
function newtonRaphson(cashFlows: number[]): IRRResult | null {
  // Taxa inicial: tentar 0.01 (1% ao mês) ou estimativa baseada no fluxo
  let rate = 0.01;
  
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const npv = calculateNPV(cashFlows, rate);
    const derivative = calculateNPVDerivative(cashFlows, rate);
    
    // Verificar convergência
    if (Math.abs(npv) < TOLERANCE) {
      return {
        rate,
        rateAnnual: Math.pow(1 + rate, 12) - 1,
        converged: true,
        iterations: i + 1,
        method: 'newton-raphson',
      };
    }
    
    // Verificar se a derivada é muito pequena (pode causar divisão por zero)
    if (Math.abs(derivative) < TOLERANCE) {
      return null; // Fallback para bisseção
    }
    
    // Verificar se há NaN ou Infinity
    if (!isFinite(npv) || !isFinite(derivative)) {
      return null;
    }
    
    // Atualizar taxa
    const newRate = rate - npv / derivative;
    
    // Verificar se saiu do intervalo razoável
    if (newRate < MIN_RATE || newRate > MAX_RATE || !isFinite(newRate)) {
      return null;
    }
    
    // Verificar se não está progredindo
    if (Math.abs(newRate - rate) < TOLERANCE && Math.abs(npv) > TOLERANCE) {
      return null;
    }
    
    rate = newRate;
  }
  
  // Não convergiu
  return null;
}

/**
 * Método de Bisseção para encontrar IRR
 */
function bisection(cashFlows: number[]): IRRResult {
  let a = MIN_RATE;
  let b = MAX_RATE;
  
  // Expandir intervalo se necessário até encontrar mudança de sinal
  let expanded = false;
  while (calculateNPV(cashFlows, a) * calculateNPV(cashFlows, b) > 0 && !expanded) {
    // Tentar expandir para a esquerda
    if (a > MIN_RATE * 2) {
      a = Math.max(MIN_RATE, a * 1.5);
    } else if (b < MAX_RATE * 2) {
      b = Math.min(MAX_RATE, b * 1.5);
    } else {
      expanded = true;
    }
  }
  
  // Se ainda não há mudança de sinal, usar intervalo padrão
  if (calculateNPV(cashFlows, a) * calculateNPV(cashFlows, b) > 0) {
    // Tentar encontrar manualmente um intervalo válido
    for (let testRate = -0.9; testRate <= 1.0; testRate += 0.1) {
      const npv = calculateNPV(cashFlows, testRate);
      if (isFinite(npv)) {
        if (npv > 0 && calculateNPV(cashFlows, b) < 0) {
          a = testRate;
          break;
        } else if (npv < 0 && calculateNPV(cashFlows, a) > 0) {
          b = testRate;
          break;
        }
      }
    }
  }
  
  let iterations = 0;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    iterations = i + 1;
    const mid = (a + b) / 2;
    const npvMid = calculateNPV(cashFlows, mid);
    
    if (Math.abs(npvMid) < TOLERANCE || Math.abs(b - a) < TOLERANCE) {
      return {
        rate: mid,
        rateAnnual: Math.pow(1 + mid, 12) - 1,
        converged: true,
        iterations,
        method: 'bisection',
      };
    }
    
    const npvA = calculateNPV(cashFlows, a);
    
    if (npvA * npvMid < 0) {
      b = mid;
    } else {
      a = mid;
    }
  }
  
  // Retornar melhor estimativa mesmo se não convergiu completamente
  const finalRate = (a + b) / 2;
  return {
    rate: finalRate,
    rateAnnual: Math.pow(1 + finalRate, 12) - 1,
    converged: Math.abs(calculateNPV(cashFlows, finalRate)) < 0.01, // Tolerância mais flexível
    iterations,
    method: 'bisection',
  };
}

/**
 * Função principal: calcula IRR usando Newton-Raphson com fallback para Bisseção
 */
export function calculateIRR(cashFlows: number[]): IRRResult {
  // Validar entrada
  if (!cashFlows || cashFlows.length < 2) {
    return {
      rate: 0,
      rateAnnual: 0,
      converged: false,
      iterations: 0,
      method: 'bisection',
      error: 'Fluxo de caixa deve ter pelo menos 2 períodos',
    };
  }
  
  // Verificar se há mudança de sinal (necessário para IRR)
  const hasPositive = cashFlows.some(cf => cf > 0);
  const hasNegative = cashFlows.some(cf => cf < 0);
  
  if (!hasPositive || !hasNegative) {
    return {
      rate: 0,
      rateAnnual: 0,
      converged: false,
      iterations: 0,
      method: 'bisection',
      error: 'Fluxo de caixa deve ter valores positivos e negativos',
    };
  }
  
  // Tentar Newton-Raphson primeiro
  const nrResult = newtonRaphson(cashFlows);
  if (nrResult && nrResult.converged) {
    return nrResult;
  }
  
  // Fallback para Bisseção
  return bisection(cashFlows);
}

/**
 * Converte taxa mensal para anual
 */
export function monthlyToAnnual(monthlyRate: number): number {
  return Math.pow(1 + monthlyRate, 12) - 1;
}

/**
 * Converte taxa anual para mensal
 */
export function annualToMonthly(annualRate: number): number {
  return Math.pow(1 + annualRate, 1 / 12) - 1;
}
