'use client';

import { useState, useMemo } from 'react';
import { useSimuladorStore } from '@/store/useSimuladorStore';
import { Card } from '@/components/ui/Card';
import { InputPercent } from '@/components/ui/InputPercent';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Toggle } from '@/components/ui/Toggle';
import { calcularValorGarantia, calcularLimiteSaldo, calcularMinimoMatriculas } from '@/lib/calculos';
import { formatBRL, formatNumber } from '@/lib/utils';
import { CheckCircle, XCircle, Save, Target, CheckSquare, Square, Trash2, BarChart3 } from 'lucide-react';
import { CenarioGarantia } from '@/types';
import { estatisticasPromissao, empreendimentoPromissao } from '@/data/promissao-lotes';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function AbaGarantias() {
  const {
    lotes,
    veiculos,
    cotasAutomoveis,
    garantia,
    calculos,
    cenariosGarantia,
    setGarantia,
    toggleLoteSelecionado,
    addCenarioGarantia,
    removeCenarioGarantia,
    aplicarCenarioGarantia,
  } = useSimuladorStore();

  const [nomeCenario, setNomeCenario] = useState('');

  // Calcular pool de garantia consolidada (lotes + veículos + cotas automóveis)
  const poolGarantia = useMemo(() => {
    const lotesSelecionados = lotes.filter((l) => garantia.lotesSelecionados.includes(l.id));
    const veiculosSelecionados = garantia.usarVeiculos
      ? veiculos.filter((v) => garantia.veiculosSelecionados.includes(v.id))
      : [];
    const cotasAutomoveisSelecionadas = garantia.usarVeiculos
      ? cotasAutomoveis.filter((c) => garantia.veiculosSelecionados.includes(c.id))
      : [];
    
    const valorTotalLotes = lotesSelecionados.reduce((sum, l) => {
      const valor = garantia.criterioAvaliacao === 'mercado' ? l.valorMercado : l.valorVendaForcada;
      return sum + valor;
    }, 0);

    const valorTotalVeiculos = veiculosSelecionados.reduce((sum, v) => sum + v.valorGarantia, 0);
    const valorTotalCotasAutomoveis = cotasAutomoveisSelecionadas.reduce((sum, c) => sum + c.valorGarantia, 0);
    const valorTotal = valorTotalLotes + valorTotalVeiculos + valorTotalCotasAutomoveis;

    if (lotesSelecionados.length === 0 && veiculosSelecionados.length === 0 && cotasAutomoveisSelecionadas.length === 0) {
      return {
        quantidade: 0,
        quantidadeLotes: 0,
        quantidadeVeiculos: 0,
        valorTotal: 0,
        areaTotal: 0,
        valorMedio: 0,
        maiorLote: null as any,
        menorLote: null as any,
        numeroMatriculas: 0,
      };
    }

    const valores = lotesSelecionados.map((l) =>
      garantia.criterioAvaliacao === 'mercado' ? l.valorMercado : l.valorVendaForcada
    );
    const areas = lotesSelecionados.map((l) => l.area);

    const areaTotal = areas.reduce((sum, a) => sum + a, 0);
    const totalItens = lotesSelecionados.length + veiculosSelecionados.length + cotasAutomoveisSelecionadas.length;
    const valorMedio = totalItens > 0 ? valorTotal / totalItens : 0;

    const maiorLote = lotesSelecionados.reduce((max, l) => {
      const valor = garantia.criterioAvaliacao === 'mercado' ? l.valorMercado : l.valorVendaForcada;
      const maxValor = garantia.criterioAvaliacao === 'mercado' ? max.valorMercado : max.valorVendaForcada;
      return valor > maxValor ? l : max;
    }, lotesSelecionados[0]);

    const menorLote = lotesSelecionados.reduce((min, l) => {
      const valor = garantia.criterioAvaliacao === 'mercado' ? l.valorMercado : l.valorVendaForcada;
      const minValor = garantia.criterioAvaliacao === 'mercado' ? min.valorMercado : min.valorVendaForcada;
      return valor < minValor ? l : min;
    }, lotesSelecionados[0]);

    return {
      quantidade: lotesSelecionados.length + veiculosSelecionados.length + cotasAutomoveisSelecionadas.length,
      quantidadeLotes: lotesSelecionados.length,
      quantidadeVeiculos: veiculosSelecionados.length + cotasAutomoveisSelecionadas.length,
      valorTotal,
      areaTotal,
      valorMedio,
      maiorLote,
      menorLote,
      numeroMatriculas: new Set(lotesSelecionados.map((l) => l.matricula)).size,
    };
  }, [lotes, veiculos, cotasAutomoveis, garantia.lotesSelecionados, garantia.veiculosSelecionados, garantia.usarVeiculos, garantia.criterioAvaliacao]);

  const limitePermitido = calcularLimiteSaldo(poolGarantia.valorTotal, garantia.ltvMaximo);
  const saldoPico = calculos?.saldoPico || 0;
  const dentroLimite = saldoPico <= limitePermitido;
  const faltaGarantia = Math.max(0, saldoPico - limitePermitido);
  const percentualCobertura = limitePermitido > 0 ? (saldoPico / limitePermitido) * 100 : 0;

  // Selecionar mínimo necessário
  const handleSelecionarMinimo = () => {
    if (saldoPico <= 0) return;

    const quantidadeMinima = calcularMinimoMatriculas(lotes, garantia, saldoPico, 'maior-primeiro');
    
    // Ordenar lotes por valor (maior primeiro)
    const lotesOrdenados = [...lotes].sort((a, b) => {
      const valorA = garantia.criterioAvaliacao === 'mercado' ? a.valorMercado : a.valorVendaForcada;
      const valorB = garantia.criterioAvaliacao === 'mercado' ? b.valorMercado : b.valorVendaForcada;
      return valorB - valorA;
    });

    // Selecionar os primeiros N lotes
    const idsSelecionados = lotesOrdenados.slice(0, quantidadeMinima).map((l) => l.id);
    setGarantia({ lotesSelecionados: idsSelecionados });
  };

  // Salvar cenário
  const handleSalvarCenario = () => {
    if (poolGarantia.quantidade === 0) {
      alert('Selecione pelo menos um lote antes de salvar um cenário.');
      return;
    }

    const nome = nomeCenario || `Cenário ${cenariosGarantia.length + 1}`;
    const novoCenario: CenarioGarantia = {
      id: `cenario-${Date.now()}`,
      nome,
      lotesSelecionados: [...garantia.lotesSelecionados],
      valorTotal: poolGarantia.valorTotal,
      areaTotal: poolGarantia.areaTotal,
      quantidadeLotes: poolGarantia.quantidade,
      dataCriacao: new Date(),
    };

    addCenarioGarantia(novoCenario);
    setNomeCenario('');
  };

  // Dados para gráfico
  const dadosGrafico = [
    {
      nome: 'Saldo Pico',
      valor: saldoPico,
      limite: limitePermitido,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Info Promissão */}
      <Card title={`Garantias - ${empreendimentoPromissao.nome} - ${empreendimentoPromissao.localizacao}`}>
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-gray-700">
            <strong>Empreendimento:</strong> {empreendimentoPromissao.nome} |{' '}
            <strong>Registro:</strong> {empreendimentoPromissao.registro} |{' '}
            <strong>Lotes Disponíveis:</strong> {lotes.length} lotes
            {garantia.usarVeiculos && (
              <> | <strong>Veículos:</strong> {veiculos.length} veículos</>
            )}
          </p>
        </div>
      </Card>

      {/* Configuração */}
      <Card title="Configuração de Garantias">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <InputPercent
            label="LTV Máximo Permitido (%)"
            value={garantia.ltvMaximo}
            onChange={(value) => setGarantia({ ltvMaximo: value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Critério de Avaliação
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={garantia.criterioAvaliacao === 'mercado'}
                  onChange={() => setGarantia({ criterioAvaliacao: 'mercado' })}
                />
                <span>Valor de Mercado</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={garantia.criterioAvaliacao === 'venda-forcada'}
                  onChange={() => setGarantia({ criterioAvaliacao: 'venda-forcada' })}
                />
                <span>Venda Forçada</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <Toggle
            checked={garantia.modoJuncao === 'consolidado'}
            onChange={(checked) =>
              setGarantia({ modoJuncao: checked ? 'consolidado' : 'individual' })
            }
            label="Modo Junção Consolidada (Pool de Garantia)"
          />
          <p className="text-sm text-gray-600 mt-2">
            {garantia.modoJuncao === 'consolidado'
              ? 'Os lotes selecionados serão tratados como uma única garantia consolidada (pool).'
              : 'Cada lote será tratado individualmente como garantia separada.'}
          </p>
        </div>
      </Card>

      {/* Painel Lateral - Pool de Garantia */}
      {garantia.modoJuncao === 'consolidado' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tabela de Lotes */}
          <div className="lg:col-span-2">
            <Card title="Selecionar Lotes/Matrículas">
              <div className="mb-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const todosIds = lotes.map((l) => l.id);
                    setGarantia({ lotesSelecionados: todosIds });
                  }}
                  className="font-medium"
                  aria-label="Selecionar todos os lotes"
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Selecionar Todos
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setGarantia({ lotesSelecionados: [] });
                  }}
                  className="font-medium"
                  aria-label="Limpar seleção de lotes"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Limpar Seleção
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSelecionarMinimo}
                  disabled={saldoPico <= 0}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Selecionar Mínimo Necessário
                </Button>
              </div>

              {lotes.length === 0 ? (
                <Alert variant="info">
                  Importe lotes na aba "Empreendimento" para começar.
                </Alert>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left w-12"></th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Lote</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Matrícula</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Área (m²)</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lotes.map((lote) => {
                        const valor =
                          garantia.criterioAvaliacao === 'mercado'
                            ? lote.valorMercado
                            : lote.valorVendaForcada;
                        const selecionado = garantia.lotesSelecionados.includes(lote.id);
                        return (
                          <tr
                            key={lote.id}
                            className={`hover:bg-gray-50 cursor-pointer ${
                              selecionado ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => toggleLoteSelecionado(lote.id)}
                          >
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={selecionado}
                                onChange={() => toggleLoteSelecionado(lote.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="border border-gray-300 px-4 py-2">{lote.id}</td>
                            <td className="border border-gray-300 px-4 py-2">{lote.matricula}</td>
                            <td className="border border-gray-300 px-4 py-2 text-right">
                              {formatNumber(lote.area, 2)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-right">
                              {formatBRL(valor)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Painel Lateral - Pool de Garantia */}
          <div className="lg:col-span-1">
            <Card title="Garantia Consolidada (Pool)" className="sticky top-4">
              {poolGarantia.quantidade === 0 ? (
                <Alert variant="info">
                  Selecione lotes ou veículos para ver o pool de garantia consolidada.
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Quantidade Total</p>
                    <p className="text-3xl font-bold text-primary">{poolGarantia.quantidade}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {poolGarantia.quantidadeLotes} lote(s)
                      {poolGarantia.quantidadeVeiculos > 0 && (
                        <> + {poolGarantia.quantidadeVeiculos} veículo(s)</>
                      )}
                    </p>
                  </div>
                  
                  {poolGarantia.quantidadeVeiculos > 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-sm font-semibold text-yellow-800 mb-2">Veículos Incluídos</p>
                      <p className="text-sm text-yellow-700">
                        {poolGarantia.quantidadeVeiculos} veículo(s) com garantia de 130% FIPE
                      </p>
                    </div>
                  )}


                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Valor Médio</p>
                    <p className="text-xl font-bold">{formatBRL(poolGarantia.valorMedio)}</p>
                    <p className="text-xs text-gray-500 mt-1">por item (lote/veículo)</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Área Total</p>
                    <p className="text-xl font-bold">
                      {formatNumber(poolGarantia.areaTotal, 2)} m²
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Número de Matrículas</p>
                    <p className="text-xl font-bold">{poolGarantia.numeroMatriculas}</p>
                  </div>

                  {poolGarantia.maiorLote && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Maior Lote</p>
                      <p className="font-semibold">{poolGarantia.maiorLote.id}</p>
                      <p className="text-sm">
                        {formatBRL(
                          garantia.criterioAvaliacao === 'mercado'
                            ? poolGarantia.maiorLote.valorMercado
                            : poolGarantia.maiorLote.valorVendaForcada
                        )}
                      </p>
                    </div>
                  )}

                  {poolGarantia.menorLote && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Menor Lote</p>
                      <p className="font-semibold">{poolGarantia.menorLote.id}</p>
                      <p className="text-sm">
                        {formatBRL(
                          garantia.criterioAvaliacao === 'mercado'
                            ? poolGarantia.menorLote.valorMercado
                            : poolGarantia.menorLote.valorVendaForcada
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Análise LTV e Cobertura */}
      {garantia.modoJuncao === 'consolidado' && poolGarantia.quantidade > 0 && (
        <Card title="Análise de Cobertura LTV">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Limite Permitido (LTV {garantia.ltvMaximo}%)</p>
              <p className="text-2xl font-bold">{formatBRL(limitePermitido)}</p>
            </div>
            <div className={`p-4 rounded-lg ${dentroLimite ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-sm text-gray-600">Saldo Devedor Pico</p>
              <p className={`text-2xl font-bold ${dentroLimite ? 'text-green-700' : 'text-red-700'}`}>
                {formatBRL(saldoPico)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Cobertura</p>
              <p className="text-2xl font-bold">{percentualCobertura.toFixed(1)}%</p>
            </div>
          </div>

          {/* Barra de Cobertura Visual */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Cobertura do Saldo</span>
              <span className="text-sm text-gray-600">
                {formatBRL(saldoPico)} / {formatBRL(limitePermitido)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  dentroLimite ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, percentualCobertura)}%` }}
              />
            </div>
          </div>

          {dentroLimite ? (
            <Alert variant="success">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Pool cobre o saldo devedor!</p>
                  <p className="text-sm">
                    A garantia consolidada de {formatBRL(poolGarantia.valorTotal)} com LTV de{' '}
                    {garantia.ltvMaximo}% permite um limite de {formatBRL(limitePermitido)}, que cobre
                    o saldo pico de {formatBRL(saldoPico)}.
                  </p>
                </div>
              </div>
            </Alert>
          ) : (
            <Alert variant="error">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Falta garantia!</p>
                  <p className="text-sm">
                    O saldo pico de {formatBRL(saldoPico)} excede o limite de {formatBRL(limitePermitido)}.
                    Faltam {formatBRL(faltaGarantia)} em garantia adicional.
                  </p>
                  <Button
                    size="sm"
                    variant="primary"
                    className="mt-2"
                    onClick={handleSelecionarMinimo}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Selecionar Mínimo Necessário
                  </Button>
                </div>
              </div>
            </Alert>
          )}

          {/* Gráfico de Cobertura */}
          {saldoPico > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-4">Visualização: Saldo vs Limite</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatBRL(value)} />
                  <Legend />
                  <Bar dataKey="valor" fill="#ef4444" name="Saldo Pico" />
                  <Bar dataKey="limite" fill="#22c55e" name="Limite Permitido" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      )}

      {/* Salvar Cenários */}
      {garantia.modoJuncao === 'consolidado' && poolGarantia.quantidade > 0 && (
        <Card title="Salvar Cenários de Garantia">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Nome do cenário (ex: Cenário 1)"
              value={nomeCenario}
              onChange={(e) => setNomeCenario(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button onClick={handleSalvarCenario}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Cenário
            </Button>
          </div>

          {cenariosGarantia.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold mb-2">Cenários Salvos:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cenariosGarantia.map((cenario) => (
                  <div
                    key={cenario.id}
                    className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-semibold">{cenario.nome}</h5>
                        <p className="text-xs text-gray-500">
                          {new Date(cenario.dataCriacao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeCenarioGarantia(cenario.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-gray-600">Lotes:</span>{' '}
                        <strong>{cenario.quantidadeLotes}</strong>
                      </p>
                      <p>
                        <span className="text-gray-600">Valor Total:</span>{' '}
                        <strong>{formatBRL(cenario.valorTotal)}</strong>
                      </p>
                      <p>
                        <span className="text-gray-600">Área Total:</span>{' '}
                        <strong>{formatNumber(cenario.areaTotal, 2)} m²</strong>
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full mt-3"
                      onClick={() => aplicarCenarioGarantia(cenario.id)}
                    >
                      Aplicar Cenário
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Modo Individual (fallback) */}
      {garantia.modoJuncao === 'individual' && (
        <Card title="Modo Individual">
          <Alert variant="info">
            No modo individual, cada lote é tratado separadamente. Ative o modo consolidado para usar
            pool de garantia.
          </Alert>
        </Card>
      )}
    </div>
  );
}
