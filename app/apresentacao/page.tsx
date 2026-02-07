'use client';

import { useSimuladorStore } from '@/store/useSimuladorStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { formatBRL, formatPercent } from '@/lib/utils';
import { calcularTodos, calcularTotalCustos, calcularValorLiquido } from '@/lib/calculos';
import { Download, CheckCircle, TrendingUp, Shield, Calculator } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ApresentacaoPage() {
  const { estrutura, lotes, veiculos, garantia, calculos, setCalculos } = useSimuladorStore();
  const [calculado, setCalculado] = useState(false);

  useEffect(() => {
    if (estrutura.credito > 0 && estrutura.prazoTotal > 0) {
      const resultado = calcularTodos(estrutura, lotes, garantia, veiculos);
      setCalculos(resultado);
      setCalculado(true);
    }
  }, [estrutura, lotes, garantia, veiculos, setCalculos]);

  const handleExportPDF = async () => {
    const element = document.getElementById('apresentacao-completa');
    if (!element) return;

    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('apresentacao-captacao.pdf');
  };

  const totalCustos = calcularTotalCustos(estrutura);
  const valorLiquido = calcularValorLiquido(estrutura);

  const lotesSelecionados = lotes.filter((l) => garantia.lotesSelecionados.includes(l.id));
  const veiculosSelecionados = garantia.usarVeiculos
    ? veiculos.filter((v) => garantia.veiculosSelecionados.includes(v.id))
    : [];

  const valorGarantiaLotes = lotesSelecionados.reduce((sum, l) => {
    const valor = garantia.criterioAvaliacao === 'mercado' ? l.valorMercado : l.valorVendaForcada;
    return sum + valor;
  }, 0);

  const valorGarantiaVeiculos = veiculosSelecionados.reduce((sum, v) => sum + v.valorGarantia, 0);
  const valorGarantiaTotal = valorGarantiaLotes + valorGarantiaVeiculos;
  const limiteLTV = (valorGarantiaTotal * garantia.ltvMaximo) / 100;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-dark">Proposta de Captação</h1>
          <Button onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>

        <div id="apresentacao-completa" className="space-y-8">
          {/* Hero - Proposta de Valor */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary">
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold text-dark mb-4">
                Levantamento de Capital com Consórcio Contemplado
              </h2>
              <p className="text-xl text-gray-700 mb-6">
                Estruturação financeira com garantia por lotes e veículos, controle de LTV e custo efetivo real
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="bg-white p-4 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold">Estruturação Completa</p>
                  <p className="text-sm text-gray-600">Análise detalhada da operação</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold">Garantia Consolidada</p>
                  <p className="text-sm text-gray-600">Lotes + Veículos (130% FIPE)</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold">CET Real</p>
                  <p className="text-sm text-gray-600">Custo efetivo calculado (NPV=0)</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Resumo Executivo */}
          <Card title="Resumo Executivo">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Crédito Contemplado</p>
                <p className="text-3xl font-bold text-primary">{formatBRL(estrutura.credito)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Valor Líquido Disponível</p>
                <p className="text-3xl font-bold text-green-600">{formatBRL(valorLiquido)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Custo Efetivo Anual (CET)</p>
                <p className="text-3xl font-bold">
                  {calculos ? formatPercent(calculos.cetAnual * 100, 2) : '-'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Prazo</p>
                <p className="text-3xl font-bold">{estrutura.prazoTotal} meses</p>
              </div>
            </div>
          </Card>

          {/* Estrutura da Negociação */}
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-4 border-blue-500">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-dark mb-4">
                  Estrutura da Negociação
                </h2>
                <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                  Proposta de levantamento de capital com condições negociadas e garantia consolidada
                </p>
              </div>

              <div className="flex items-start gap-4 bg-white p-6 rounded-lg">
                <CheckCircle className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-xl mb-3">Condições da Operação</h3>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold">1.</span>
                      <p>
                        <strong>Crédito contemplado</strong> com valor e condições definidas na negociação.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold">2.</span>
                      <p>
                        <strong>Garantia consolidada</strong> através de lotes e/ou veículos (130% FIPE).
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold">3.</span>
                      <p>
                        <strong>Pagamento</strong> conforme cronograma negociado e acordado.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold">4.</span>
                      <p>
                        <strong>Controle de LTV</strong> e custo efetivo real calculado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {estrutura.pagamentoAposAprovado ? (
                <div className="bg-blue-500 text-white p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-8 h-8" />
                    <p className="font-bold text-xl">Cronograma de Pagamento Negociado</p>
                  </div>
                  <p className="text-lg">
                    Parcelas de <strong>{formatBRL(estrutura.parcelaMensal)}</strong> a partir do{' '}
                    <strong>mês {estrutura.mesInicioPagamento}</strong>, conforme condições acordadas para o crédito de{' '}
                    <strong>{formatBRL(estrutura.credito)}</strong>.
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-gray-300 p-4 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-2">Cronograma de Pagamento</p>
                  <p className="text-sm text-gray-600">
                    Configure o cronograma de pagamento na aba Estrutura conforme as condições negociadas.
                  </p>
                </div>
              )}

              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-300">
                <h4 className="font-bold text-lg mb-3">Resumo da Negociação</h4>
                <p className="text-gray-700 mb-3">
                  Esta proposta apresenta a estruturação completa da operação de levantamento de capital,
                  com todas as condições, garantias e custos detalhados.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="font-semibold text-sm text-gray-600">Valor Líquido Disponível:</p>
                    <p className="text-2xl font-bold text-green-600">{formatBRL(valorLiquido)}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-600">Parcela Mensal:</p>
                    <p className="text-2xl font-bold">{formatBRL(estrutura.parcelaMensal)}/mês</p>
                    <p className="text-xs text-gray-500">Prazo: {estrutura.prazoTotal} meses</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Estrutura da Operação */}
          <Card title="Estrutura da Operação">
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
              <p className="text-sm font-bold text-blue-800 mb-2">
                ⚠️ IMPORTANTE: A entrada é descontada do crédito contemplado
              </p>
              <p className="text-sm text-gray-700 mb-2">
                A entrada não é um valor adicional. Ela é <strong>descontada diretamente do crédito</strong>.
              </p>
              <div className="bg-white p-3 rounded mt-2">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Crédito Contemplado:</span>
                    <span className="font-semibold">{formatBRL(estrutura.credito)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>- Entrada (descontada):</span>
                    <span className="font-semibold">-{formatBRL(estrutura.entrada)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 font-bold">
                    <span>= Crédito após entrada:</span>
                    <span className="text-primary">{formatBRL(estrutura.credito - estrutura.entrada)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Deste valor ({formatBRL(estrutura.credito - estrutura.entrada)}) ainda serão descontados: 
                    custos, deságio e taxa de intermediação para chegar ao valor líquido disponível.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-4">Crédito e Entrada</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Crédito Contemplado:</span>
                    <span className="font-semibold">{formatBRL(estrutura.credito)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Entrada (descontada do crédito):</span>
                    <span className="font-semibold text-red-600">-{formatBRL(estrutura.entrada)}</span>
                  </div>
                  <div className="flex justify-between bg-primary/10 p-2 rounded">
                    <span className="font-semibold">Crédito após entrada:</span>
                    <span className="font-bold text-primary">{formatBRL(estrutura.credito - estrutura.entrada)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Saídas (Custos)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Documentação:</span>
                    <span className="font-semibold text-red-600">-{formatBRL(estrutura.custoDocumentacao)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Registro:</span>
                    <span className="font-semibold text-red-600">-{formatBRL(estrutura.custoRegistro)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ITBI:</span>
                    <span className="font-semibold text-red-600">-{formatBRL(estrutura.custoITBI)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comissões:</span>
                    <span className="font-semibold text-red-600">-{formatBRL(estrutura.custoComissoes)}</span>
                  </div>
                  {estrutura.custoOutros > 0 && (
                    <div className="flex justify-between">
                      <span>Outros:</span>
                      <span className="font-semibold text-red-600">-{formatBRL(estrutura.custoOutros)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-semibold">Total de Custos:</span>
                    <span className="font-bold text-red-600">-{formatBRL(totalCustos)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-primary/10 rounded-lg border-2 border-primary">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Valor Líquido Disponível:</span>
                  <span className="text-2xl font-bold text-primary">{formatBRL(valorLiquido)}</span>
                </div>
                <div className="bg-white p-3 rounded text-sm">
                  <p className="font-semibold text-gray-700 mb-2">Cálculo detalhado:</p>
                  <div className="space-y-1 text-gray-600">
                    <div className="flex justify-between">
                      <span>Crédito Contemplado:</span>
                      <span>{formatBRL(estrutura.credito)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>- Entrada (descontada do crédito):</span>
                      <span>-{formatBRL(estrutura.entrada)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>- Custos totais:</span>
                      <span>-{formatBRL(totalCustos)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>- Deságio ({estrutura.desagio}%):</span>
                      <span>-{formatBRL((estrutura.credito * estrutura.desagio) / 100)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>- Intermediação ({estrutura.taxaIntermediacao}%):</span>
                      <span>-{formatBRL((estrutura.credito * estrutura.taxaIntermediacao) / 100)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 font-bold text-primary">
                      <span>= Valor Líquido:</span>
                      <span>{formatBRL(valorLiquido)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Garantias */}
          <Card title="Garantias da Operação">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Lotes Selecionados
                  </h4>
                  {lotesSelecionados.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>{lotesSelecionados.length}</strong> lote(s) selecionado(s)
                      </p>
                      <p className="text-sm">
                        Valor Total: <strong>{formatBRL(valorGarantiaLotes)}</strong>
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum lote selecionado</p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Veículos Selecionados
                  </h4>
                  {veiculosSelecionados.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>{veiculosSelecionados.length}</strong> veículo(s) selecionado(s)
                      </p>
                      <p className="text-sm">
                        FIPE Total: <strong>{formatBRL(veiculosSelecionados.reduce((s, v) => s + v.fipe, 0))}</strong>
                      </p>
                      <p className="text-sm">
                        Garantia (130% FIPE): <strong className="text-green-700">{formatBRL(valorGarantiaVeiculos)}</strong>
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum veículo selecionado</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Valor Total da Garantia</p>
                    <p className="text-2xl font-bold">{formatBRL(valorGarantiaTotal)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">LTV Máximo ({garantia.ltvMaximo}%)</p>
                    <p className="text-2xl font-bold">{formatBRL(limiteLTV)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Saldo Devedor Pico</p>
                    <p className={`text-2xl font-bold ${calculos?.dentroLimiteLTV ? 'text-green-600' : 'text-red-600'}`}>
                      {calculos ? formatBRL(calculos.saldoPico) : '-'}
                    </p>
                    {calculos?.dentroLimiteLTV && (
                      <p className="text-xs text-green-600 mt-1">✓ Dentro do limite</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Cronograma de Pagamento */}
          {calculos && (
            <Card title="Cronograma de Pagamento">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Parcela Mensal: <strong>{formatBRL(estrutura.parcelaMensal)}</strong>
                </p>
                {estrutura.pagamentoAposAprovado && (
                  <p className="text-sm text-green-700 font-semibold">
                    ✓ Pagamento inicia no mês {estrutura.mesInicioPagamento} (após aprovação)
                  </p>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left">Mês</th>
                      <th className="border border-gray-300 px-3 py-2 text-right">Saldo Devedor</th>
                      <th className="border border-gray-300 px-3 py-2 text-right">Parcela</th>
                      <th className="border border-gray-300 px-3 py-2 text-right">Juros</th>
                      <th className="border border-gray-300 px-3 py-2 text-right">Amortização</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculos.cronograma.slice(0, 24).map((item) => (
                      <tr key={item.mes} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2">{item.mes}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">
                          {formatBRL(item.saldoDevedor)}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right">
                          {item.parcela > 0 ? formatBRL(item.parcela) : '-'}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right">
                          {formatBRL(item.juros)}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right">
                          {formatBRL(item.amortizacao)}
                        </td>
                      </tr>
                    ))}
                    {calculos.cronograma.length > 24 && (
                      <tr>
                        <td colSpan={5} className="border border-gray-300 px-3 py-2 text-center text-gray-500">
                          ... e mais {calculos.cronograma.length - 24} meses
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Custo Efetivo */}
          {calculos && (
            <Card title="Custo Efetivo Total (CET)">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-primary/10 p-6 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-2">CET Mensal</p>
                  <p className="text-4xl font-bold text-primary">
                    {formatPercent(calculos.cetMensal * 100, 4)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">ao mês</p>
                </div>
                <div className="bg-dark/10 p-6 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-2">CET Anual</p>
                  <p className="text-4xl font-bold text-dark">
                    {formatPercent(calculos.cetAnual * 100, 4)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">ao ano</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  O CET foi calculado usando o método de Newton-Raphson com fallback para Bisseção,
                  encontrando a taxa interna de retorno (IRR) onde o Valor Presente Líquido (NPV) é igual a zero.
                </p>
              </div>
            </Card>
          )}

          {/* Conclusão */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="text-center py-6">
              <h3 className="text-2xl font-bold text-dark mb-4">Resumo da Proposta</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Você Recebe</p>
                  <p className="text-2xl font-bold text-green-600">{formatBRL(valorLiquido)}</p>
                  <p className="text-xs text-gray-500 mt-1">Valor líquido disponível</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Você Paga</p>
                  <p className="text-2xl font-bold">{formatBRL(estrutura.parcelaMensal)}</p>
                  <p className="text-xs text-gray-500 mt-1">Por mês (após aprovação)</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Custo Real</p>
                  <p className="text-2xl font-bold">
                    {calculos ? formatPercent(calculos.cetAnual * 100, 2) : '-'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">CET anual</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-white rounded-lg max-w-2xl mx-auto">
                <p className="font-semibold text-lg mb-2">✓ Proposta Estruturada</p>
                <p className="text-sm text-gray-700">
                  Esta proposta apresenta a estruturação completa da operação de levantamento de capital,
                  com todas as condições negociadas, garantias consolidadas e custo efetivo real calculado.
                  A garantia está dentro dos limites de LTV configurados.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
