'use client';

import { useSimuladorStore } from '@/store/useSimuladorStore';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { formatPercent } from '@/lib/utils';
import { calcularTodos } from '@/lib/calculos';
import { useEffect } from 'react';

export function AbaCET() {
  const { estrutura, lotes, garantia, veiculos, cotasAutomoveis, calculos, setCalculos } = useSimuladorStore();

  useEffect(() => {
    // Validações antes de calcular
    if (!estrutura || estrutura.credito <= 0 || estrutura.prazoTotal <= 0) {
      setCalculos(null);
      return;
    }
    
    // Validar valores numéricos
    if (isNaN(estrutura.credito) || isNaN(estrutura.prazoTotal) || 
        !isFinite(estrutura.credito) || !isFinite(estrutura.prazoTotal)) {
      setCalculos(null);
      return;
    }
    
    try {
      const resultado = calcularTodos(estrutura, lotes, garantia, veiculos, cotasAutomoveis);
      
      // Validar resultado
      if (resultado && !isNaN(resultado.valorLiquido) && isFinite(resultado.valorLiquido)) {
        setCalculos(resultado);
      } else {
        setCalculos(null);
      }
    } catch (error) {
      console.error('Erro ao calcular CET:', error);
      setCalculos(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estrutura, lotes, garantia, veiculos, cotasAutomoveis]);

  if (!calculos) {
    return (
      <Card>
        <Alert variant="info">
          Preencha os dados da estrutura da operação para calcular o Custo Efetivo.
        </Alert>
      </Card>
    );
  }

  // Proteção contra valores inválidos
  const cetMensalPercent = (calculos.cetMensal || 0) * 100;
  const cetAnualPercent = (calculos.cetAnual || 0) * 100;
  
  // Validar se os valores são válidos
  const cetMensalValido = !isNaN(cetMensalPercent) && isFinite(cetMensalPercent);
  const cetAnualValido = !isNaN(cetAnualPercent) && isFinite(cetAnualPercent);

  return (
    <div className="space-y-6">
      <Card title="Custo Efetivo Total (CET) - NPV=0">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-primary/10 p-6 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">CET Mensal</p>
              <p className="text-4xl font-bold text-primary">
                {cetMensalValido ? formatPercent(cetMensalPercent, 4) : 'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-2">ao mês</p>
              {!cetMensalValido && (
                <p className="text-xs text-red-600 mt-1">Não foi possível calcular</p>
              )}
            </div>
            <div className="bg-dark/10 p-6 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">CET Anual</p>
              <p className="text-4xl font-bold text-dark">
                {cetAnualValido ? formatPercent(cetAnualPercent, 4) : 'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-2">ao ano</p>
              {!cetAnualValido && (
                <p className="text-xs text-red-600 mt-1">Não foi possível calcular</p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Método de Cálculo</h4>
            <p className="text-sm text-gray-600">
              O CET foi calculado usando o método de Newton-Raphson com fallback para Bisseção,
              encontrando a taxa interna de retorno (IRR) onde o Valor Presente Líquido (NPV) é igual a zero.
            </p>
            {calculos.alertas.some((a) => a.includes('CET')) && (
              <Alert variant="warning" className="mt-4">
                {calculos.alertas.find((a) => a.includes('CET'))}
              </Alert>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-4">Fluxo de Caixa (Resumo)</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Mês</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Entrada</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Saída</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Saldo Acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  {calculos.fluxoCaixa.slice(0, 12).map((fc) => (
                    <tr key={fc.mes} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{fc.mes}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {fc.entrada > 0 ? `R$ ${fc.entrada.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {fc.saida < 0 ? `R$ ${Math.abs(fc.saida).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        R$ {fc.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {calculos.fluxoCaixa.length > 12 && (
                    <tr>
                      <td colSpan={4} className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-500">
                        ... e mais {calculos.fluxoCaixa.length - 12} meses
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
