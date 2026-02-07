'use client';

import { useEffect } from 'react';
import { useSimuladorStore } from '@/store/useSimuladorStore';
import { Card } from '@/components/ui/Card';
import { InputMoney } from '@/components/ui/InputMoney';
import { InputPercent } from '@/components/ui/InputPercent';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { calcularTodos, calcularTotalCustos } from '@/lib/calculos';
import { formatBRL, formatPercent } from '@/lib/utils';
import { estruturaPromissaoReferencia } from '@/data/promissao-estrutura';
import { CustosDetalhados } from './CustosDetalhados';

export function AbaEstrutura() {
  const { estrutura, lotes, garantia, veiculos, cotasAutomoveis, cotas, usarMultiplasCotas, setEstrutura, setCalculos } = useSimuladorStore();
  
  // Calcular totais das cotas se estiver usando múltiplas cotas
  const totaisCotas = usarMultiplasCotas
    ? {
        credito: cotas.reduce((sum, c) => sum + c.credito, 0),
        parcelaMensal: cotas.reduce((sum, c) => sum + c.parcelaMensal, 0),
        saldoDevedor: cotas.reduce((sum, c) => sum + c.saldoDevedor, 0),
      }
    : null;

  // Estrutura de cálculo: se usar múltiplas cotas, usar os totais das cotas
  const estruturaCalculo = usarMultiplasCotas && totaisCotas && totaisCotas.credito > 0
    ? {
        ...estrutura,
        credito: totaisCotas.credito,
        parcelaMensal: totaisCotas.parcelaMensal,
      }
    : estrutura;

  const handleCalculate = () => {
    // Validações antes de calcular
    if (!estruturaCalculo || estruturaCalculo.credito <= 0 || estruturaCalculo.prazoTotal <= 0) {
      setCalculos(null);
      return;
    }
    
    // Validar valores numéricos
    if (isNaN(estruturaCalculo.credito) || isNaN(estruturaCalculo.prazoTotal) || 
        !isFinite(estruturaCalculo.credito) || !isFinite(estruturaCalculo.prazoTotal)) {
      setCalculos(null);
      return;
    }
    
    try {
      const calculos = calcularTodos(estruturaCalculo, lotes, garantia, veiculos, cotasAutomoveis);
      
      // Validar resultado
      if (calculos && !isNaN(calculos.valorLiquido) && isFinite(calculos.valorLiquido)) {
        setCalculos(calculos);
      } else {
        setCalculos(null);
      }
    } catch (error) {
      console.error('Erro ao calcular:', error);
      setCalculos(null);
    }
  };

  useEffect(() => {
    // Validações antes de calcular
    if (!estruturaCalculo || estruturaCalculo.credito <= 0 || estruturaCalculo.prazoTotal <= 0) {
      setCalculos(null);
      return;
    }
    
    // Validar valores numéricos
    if (isNaN(estruturaCalculo.credito) || isNaN(estruturaCalculo.prazoTotal) || 
        !isFinite(estruturaCalculo.credito) || !isFinite(estruturaCalculo.prazoTotal)) {
      setCalculos(null);
      return;
    }
    
    try {
      const calculos = calcularTodos(estruturaCalculo, lotes, garantia, veiculos, cotasAutomoveis);
      
      // Validar resultado
      if (calculos && !isNaN(calculos.valorLiquido) && isFinite(calculos.valorLiquido)) {
        setCalculos(calculos);
      } else {
        setCalculos(null);
      }
    } catch (error) {
      console.error('Erro ao calcular:', error);
      setCalculos(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estrutura, lotes, garantia, veiculos, cotasAutomoveis, cotas, usarMultiplasCotas, totaisCotas]);

  // Aplicar valores de referência de Promissão se estrutura estiver vazia
  const aplicarValoresReferencia = () => {
    if (estrutura.credito === 0 && estrutura.taxaAdministracao === 0) {
      setEstrutura(estruturaPromissaoReferencia);
    }
  };

  return (
    <div className="space-y-6">
      {estrutura.credito === 0 && (
        <Alert variant="info">
          <div>
            <p className="font-semibold mb-2">Valores de Referência - Promissão/SP</p>
            <p className="text-sm mb-2">
              Clique no botão abaixo para preencher com valores típicos da região:
            </p>
            <Button size="sm" onClick={aplicarValoresReferencia}>
              Usar Valores de Referência (Promissão)
            </Button>
          </div>
        </Alert>
      )}

      {usarMultiplasCotas && totaisCotas && cotas.length > 0 && (
        <Card title="Resumo das Cotas Agrupadas">
          <Alert variant="info" className="mb-4">
            Você está usando múltiplas cotas. Os valores abaixo são calculados automaticamente a partir das cotas cadastradas.
          </Alert>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Crédito Total</p>
              <p className="text-2xl font-bold text-primary">{formatBRL(totaisCotas.credito)}</p>
              <p className="text-xs text-gray-500 mt-1">{cotas.length} cota(s)</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Parcela Mensal Total</p>
              <p className="text-2xl font-bold">{formatBRL(totaisCotas.parcelaMensal)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Saldo Devedor Total</p>
              <p className="text-2xl font-bold">{formatBRL(totaisCotas.saldoDevedor)}</p>
            </div>
          </div>
        </Card>
      )}

      <Card title="Estrutura da Operação">
        {usarMultiplasCotas && (
          <Alert variant="warning" className="mb-4">
            <p className="font-semibold mb-1">Modo: Múltiplas Cotas Ativo</p>
            <p className="text-sm">
              O crédito e parcela mensal podem ser preenchidos manualmente ou aplicados automaticamente
              a partir das cotas cadastradas na aba "Cotas".
            </p>
          </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputMoney
            label="Crédito da Cota Contemplada"
            value={estruturaCalculo.credito}
            onChange={(value) => setEstrutura({ credito: value })}
            disabled={usarMultiplasCotas && totaisCotas && totaisCotas.credito > 0}
          />
          <InputMoney
            label="Entrada Negociada (descontada do crédito)"
            value={estrutura.entrada}
            onChange={(value) => setEstrutura({ entrada: value })}
          />
          <div className="md:col-span-2">
            <p className="text-xs text-gray-500">
              A entrada será descontada do crédito contemplado. Ex: Se crédito é R$ 500.000 e entrada é R$ 50.000, 
              o valor líquido disponível será R$ 450.000 (menos custos, deságio, etc.).
            </p>
          </div>
          <div>
            <InputPercent
              label="Taxa de Administração"
              value={estrutura.taxaAdministracao}
              onChange={(value) => setEstrutura({ taxaAdministracao: value })}
            />
            <div className="mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={estrutura.taxaAdministracaoTipo === 'anual'}
                  onChange={() => setEstrutura({ taxaAdministracaoTipo: 'anual' })}
                />
                <span className="text-sm">% a.a.</span>
              </label>
              <label className="flex items-center gap-2 ml-4">
                <input
                  type="radio"
                  checked={estrutura.taxaAdministracaoTipo === 'total'}
                  onChange={() => setEstrutura({ taxaAdministracaoTipo: 'total' })}
                />
                <span className="text-sm">% total</span>
              </label>
            </div>
          </div>
          <InputPercent
            label="Fundo de Reserva (%)"
            value={estrutura.fundoReserva}
            onChange={(value) => setEstrutura({ fundoReserva: value })}
          />
          <InputPercent
            label="Seguro (%)"
            value={estrutura.seguro}
            onChange={(value) => setEstrutura({ seguro: value })}
          />
          <Input
            label="Prazo Total (meses)"
            type="number"
            value={estrutura.prazoTotal}
            onChange={(e) => setEstrutura({ prazoTotal: parseInt(e.target.value) || 0 })}
          />
          <InputMoney
            label="Parcela Mensal (PMT)"
            value={estruturaCalculo.parcelaMensal}
            onChange={(value) => setEstrutura({ parcelaMensal: value })}
            disabled={usarMultiplasCotas && totaisCotas && totaisCotas.parcelaMensal > 0}
          />
          <div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={estrutura.pagamentoAposAprovado}
                onChange={(e) => setEstrutura({ pagamentoAposAprovado: e.target.checked })}
              />
              <span className="text-sm font-medium">Pagamento só após aprovado</span>
            </label>
            {estrutura.pagamentoAposAprovado && (
              <Input
                label="Mês de Início do Pagamento"
                type="number"
                value={estrutura.mesInicioPagamento}
                onChange={(e) => setEstrutura({ mesInicioPagamento: parseInt(e.target.value) || 0 })}
              />
            )}
          </div>
          <InputPercent
            label="Deságio na Venda do Crédito (%)"
            value={estrutura.desagio}
            onChange={(value) => setEstrutura({ desagio: value })}
          />
          <InputPercent
            label="Taxa de Intermediação (%)"
            value={estrutura.taxaIntermediacao}
            onChange={(value) => setEstrutura({ taxaIntermediacao: value })}
          />
        </div>
      </Card>

      <CustosDetalhados />

      <Card title="Prazo e Fluxo Mensal Estimados">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Prazo Estimado (meses)"
            type="number"
            value={estrutura.prazoEstimado}
            onChange={(e) => setEstrutura({ prazoEstimado: parseInt(e.target.value) || 0 })}
            placeholder="Ex: 120 meses"
          />
          <InputMoney
            label="Fluxo Mensal Estimado"
            value={estrutura.fluxoMensalEstimado}
            onChange={(value) => setEstrutura({ fluxoMensalEstimado: value })}
            placeholder="Valor mensal estimado"
          />
        </div>
        {estrutura.prazoEstimado > 0 && estrutura.fluxoMensalEstimado > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Projeção Total Estimada</p>
            <p className="text-xl font-bold">
              {formatBRL(estrutura.prazoEstimado * estrutura.fluxoMensalEstimado)} em{' '}
              {estrutura.prazoEstimado} meses
            </p>
          </div>
        )}
      </Card>

      <Card title="Resultados Calculados">
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Cálculo do Valor Líquido:</p>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Crédito Contemplado:</span>
                <span className="font-semibold">{formatBRL(estrutura.credito)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>- Entrada (descontada):</span>
                <span className="font-semibold">-{formatBRL(estrutura.entrada)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>- Custos totais:</span>
                <span className="font-semibold">-{formatBRL(calcularTotalCustos(estrutura))}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>- Deságio ({estrutura.desagio}%):</span>
                <span className="font-semibold">-{formatBRL((estrutura.credito * estrutura.desagio) / 100)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>- Intermediação ({estrutura.taxaIntermediacao}%):</span>
                <span className="font-semibold">-{formatBRL((estrutura.credito * estrutura.taxaIntermediacao) / 100)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2 font-bold text-lg">
                <span>= Valor Líquido Disponível:</span>
                <span className="text-primary">
                  {formatBRL(
                    estrutura.credito -
                      estrutura.entrada -
                      calcularTotalCustos(estrutura) -
                      (estrutura.credito * estrutura.desagio) / 100 -
                      (estrutura.credito * estrutura.taxaIntermediacao) / 100
                  )}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Valor Líquido Disponível</p>
              <p className="text-2xl font-bold text-primary">
                {formatBRL(
                  estrutura.credito -
                    estrutura.entrada -
                    calcularTotalCustos(estrutura) -
                    (estrutura.credito * estrutura.desagio) / 100 -
                    (estrutura.credito * estrutura.taxaIntermediacao) / 100
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Custos</p>
              <p className="text-2xl font-bold">{formatBRL(calcularTotalCustos(estrutura))}</p>
            </div>
            {estrutura.prazoEstimado > 0 && estrutura.fluxoMensalEstimado > 0 && (
              <div>
                <p className="text-sm text-gray-600">Fluxo Total Estimado</p>
                <p className="text-2xl font-bold">
                  {formatBRL(estrutura.prazoEstimado * estrutura.fluxoMensalEstimado)}
                </p>
                <p className="text-xs text-gray-500">{estrutura.prazoEstimado} meses</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="text-center space-y-4">
        <Button size="lg" onClick={handleCalculate} className="font-medium">
          Calcular Operação
        </Button>
        <div>
          <a href="/apresentacao">
            <Button size="lg" variant="primary" className="font-medium">
              Ver Apresentação para Cliente
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
