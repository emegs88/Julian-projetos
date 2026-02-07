/**
 * Solver de Custo Efetivo (IRR) usando Newton-Raphson com fallback para Bisseção
 * Calcula a taxa interna de retorno (IRR) onde NPV = 0
 * 
 * PARTE D: Motor IRR robusto
 * - Newton-Raphson com validações
 * - Fallback para Bisseção quando Newton falha
 * - Tolerância 1e-10, máximo 100 iterações
 * - Validação de convergência
 */

export interface IRRResult {
  rate: number; // Taxa mensal
  rateAnnual: number; // Taxa anual equivalente
  converged: boolean;
  iterations: number;
  method: 'newton-raphson' | 'bisection';
  error?: string;
}

const MAX_ITERATIONS = 100; // Máximo de iterações
const TOLERANCE = 1e-10; // Tolerância para convergência (muito precisa)
const MIN_RATE = -0.99; // -99% (praticamente -100%, limite inferior)
const MAX_RATE = 2.0; // 200% ao mês (limite superior, permite encontrar taxas altas)
const INITIAL_GUESS = 0.01; // 1% ao mês como chute inicial

/**
 * Calcula o NPV (Net Present Value) para uma taxa dada
 */
export function calculateNPV(cashFlows: number[], rate: number): number {
  if (!cashFlows || cashFlows.length === 0) return 0;
  
  // Validar taxa
  if (isNaN(rate) || !isFinite(rate) || rate === -1) {
    return NaN;
  }
  
  let npv = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    const cf = cashFlows[t];
    if (isNaN(cf) || !isFinite(cf)) {
      continue; // Pular valores inválidos
    }
    npv += cf / Math.pow(1 + rate, t);
  }
  
  // Proteção final
  if (isNaN(npv) || !isFinite(npv)) {
    return NaN;
  }
  
  return npv;
}

/**
 * Calcula a derivada do NPV (NPV')
 * PARTE D: Derivada robusta para Newton-Raphson
 */
export function calculateNPVDerivative(cashFlows: number[], rate: number): number {
  if (!cashFlows || cashFlows.length === 0) return 0;
  if (rate === -1 || isNaN(rate) || !isFinite(rate)) return NaN;
  
  let derivative = 0;
  for (let t = 1; t < cashFlows.length; t++) {
    const cf = cashFlows[t];
    if (isNaN(cf) || !isFinite(cf)) {
      continue; // Pular valores inválidos
    }
    const denominador = Math.pow(1 + rate, t + 1);
    if (denominador === 0 || !isFinite(denominador)) {
      return NaN; // Divisão por zero ou overflow
    }
    derivative -= (t * cf) / denominador;
  }
  
  // Proteção final
  if (isNaN(derivative) || !isFinite(derivative)) {
    return NaN;
  }
  
  return derivative;
}

/**
 * Método de Newton-Raphson para encontrar IRR
 * PARTE D: Newton-Raphson robusto com múltiplas tentativas
 */
function newtonRaphson(cashFlows: number[]): IRRResult | null {
  // Tentar múltiplos chutes iniciais para melhorar convergência
  const initialGuesses = [0.01, 0.005, 0.02, 0.001, 0.05];
  
  for (const guess of initialGuesses) {
    let rate = guess;
    
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
        break; // Tentar próximo chute inicial
      }
      
      // Verificar se há NaN ou Infinity
      if (!isFinite(npv) || !isFinite(derivative)) {
        break; // Tentar próximo chute inicial
      }
      
      // Atualizar taxa
      const newRate = rate - npv / derivative;
      
      // Verificar se saiu do intervalo razoável
      if (newRate < MIN_RATE || newRate > MAX_RATE || !isFinite(newRate)) {
        break; // Tentar próximo chute inicial
      }
      
      // Verificar se não está progredindo
      if (Math.abs(newRate - rate) < TOLERANCE && Math.abs(npv) > TOLERANCE) {
        break; // Tentar próximo chute inicial
      }
      
      rate = newRate;
    }
  }
  
  // Não convergiu com nenhum chute inicial
  return null;
}

/**
 * Método de Bisseção para encontrar IRR
 * PARTE D: Bisseção robusta com busca inteligente de intervalo
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
  const finalNPV = calculateNPV(cashFlows, finalRate);
  
  // Validar resultado final
  if (isNaN(finalRate) || !isFinite(finalRate) || isNaN(finalNPV) || !isFinite(finalNPV)) {
    return {
      rate: 0,
      rateAnnual: 0,
      converged: false,
      iterations,
      method: 'bisection',
      error: 'Não foi possível calcular IRR com bisseção',
    };
  }
  
  return {
    rate: finalRate,
    rateAnnual: Math.pow(1 + finalRate, 12) - 1,
    converged: Math.abs(finalNPV) < 0.01, // Tolerância mais flexível para bisseção
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
 * PARTE D: Conversão robusta
 */
export function monthlyToAnnual(monthlyRate: number): number {
  if (isNaN(monthlyRate) || !isFinite(monthlyRate)) {
    return 0;
  }
  const annual = Math.pow(1 + monthlyRate, 12) - 1;
  if (isNaN(annual) || !isFinite(annual)) {
    return 0;
  }
  return annual;
}

/**
 * Converte taxa anual para mensal
 * PARTE D: Conversão robusta
 */
export function annualToMonthly(annualRate: number): number {
  if (isNaN(annualRate) || !isFinite(annualRate) || annualRate <= -1) {
    return 0;
  }
  const monthly = Math.pow(1 + annualRate, 1 / 12) - 1;
  if (isNaN(monthly) || !isFinite(monthly)) {
    return 0;
  }
  return monthly;
}
