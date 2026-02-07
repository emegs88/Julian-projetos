/**
 * Algoritmo de seleção automática de cotas do BidCon
 * Seleciona o máximo de cotas possível respeitando o limite de garantia
 */

import { CotaSelecionada } from '@/types/bidcon';

interface ParametrosSelecao {
  cotas: CotaSelecionada[];
  saldoPico: number;
  limiteGarantia: number;
}

interface ResultadoSelecao {
  cotasSelecionadas: CotaSelecionada[];
  creditoTotal: number;
  liquidoTotal: number;
  parcelasTotal: number;
  novoSaldoPico: number;
  dentroLimite: boolean;
  folga: number;
}

/**
 * Calcula o custo/benefício de uma cota
 * Maior crédito por menor líquido a pagar = melhor
 */
function calcularCustoBeneficio(cota: CotaSelecionada): number {
  if (cota.valorLiquidoAPagar <= 0) return 0;
  return cota.credito / cota.valorLiquidoAPagar;
}

/**
 * Seleciona automaticamente o máximo de cotas possível
 */
export function selecionarMaximoCotas({
  cotas,
  saldoPico,
  limiteGarantia,
}: ParametrosSelecao): ResultadoSelecao {
  // Filtrar apenas cotas disponíveis
  const cotasDisponiveis = cotas.filter((c) => c.status === 'DISPONIVEL');

  // Ordenar por melhor custo/benefício (maior crédito por menor líquido)
  const cotasOrdenadas = [...cotasDisponiveis].sort((a, b) => {
    const custoBeneficioA = calcularCustoBeneficio(a);
    const custoBeneficioB = calcularCustoBeneficio(b);
    return custoBeneficioB - custoBeneficioA; // Maior primeiro
  });

  // Simular adição de cotas até estourar o limite
  const cotasSelecionadas: CotaSelecionada[] = [];
  let creditoAcumulado = 0;
  let liquidoAcumulado = 0;
  let parcelasAcumuladas = 0;

  // Calcular saldo pico inicial (sem cotas BidCon)
  // O saldo pico já considera o crédito das cotas existentes
  // Ao adicionar novas cotas, o saldo pico aumenta pelo crédito adicional
  let saldoPicoAtual = saldoPico;

  for (const cota of cotasOrdenadas) {
    // Calcular novo saldo pico se adicionar esta cota
    // O crédito da cota aumenta o saldo devedor
    const novoCredito = creditoAcumulado + cota.credito;
    const novoSaldoPico = saldoPico + novoCredito;

    // Verificar se ainda está dentro do limite
    if (novoSaldoPico <= limiteGarantia) {
      cotasSelecionadas.push({ ...cota, selecionada: true });
      creditoAcumulado = novoCredito;
      liquidoAcumulado += cota.valorLiquidoAPagar;
      parcelasAcumuladas += cota.parcela;
      saldoPicoAtual = novoSaldoPico;
    } else {
      // Estourou o limite, parar
      break;
    }
  }

  const folga = limiteGarantia - saldoPicoAtual;
  const dentroLimite = saldoPicoAtual <= limiteGarantia;

  return {
    cotasSelecionadas,
    creditoTotal: creditoAcumulado,
    liquidoTotal: liquidoAcumulado,
    parcelasTotal: parcelasAcumuladas,
    novoSaldoPico: saldoPicoAtual,
    dentroLimite,
    folga,
  };
}
