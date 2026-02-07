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
import { PoolGlobal } from './PoolGlobal';
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
  const [estrategiaSelecao, setEstrategiaSelecao] = useState<'maior-primeiro' | 'menor-primeiro'>('maior-primeiro');

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

    const maiorLote = lotesSelecionados.length > 0
      ? lotesSelecionados.reduce((max, l) => {
          const valor = garantia.criterioAvaliacao === 'mercado' ? l.valorMercado : l.valorVendaForcada;
          const maxValor = garantia.criterioAvaliacao === 'mercado' ? max.valorMercado : max.valorVendaForcada;
          return valor > maxValor ? l : max;
        }, lotesSelecionados[0])
      : null;

    const menorLote = lotesSelecionados.length > 0
      ? lotesSelecionados.reduce((min, l) => {
          const valor = garantia.criterioAvaliacao === 'mercado' ? l.valorMercado : l.valorVendaForcada;
          const minValor = garantia.criterioAvaliacao === 'mercado' ? min.valorMercado : min.valorVendaForcada;
          return valor < minValor ? l : min;
        }, lotesSelecionados[0])
      : null;

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

  // INTEGRAÇÃO COM OPERAÇÃO - Importar da aba Estrutura
  const saldoPico = calculos?.saldoPico || 0;
  const saldoAtual = calculos?.cronograma?.[calculos.cronograma.length - 1]?.saldoDevedor || 0;
  const cronogramaSaldo = calculos?.cronograma || [];
  
  // POOL DE GARANTIA
  const poolValor = poolGarantia.valorTotal;
  const limitePermitido = calcularLimiteSaldo(poolValor, garantia.ltvMaximo);
  
  // Comparar com saldoDevedorPico
  const dentroLimite = saldoPico <= limitePermitido;
  const faltaGarantia = Math.max(0, saldoPico - limitePermitido);
  const folga = Math.max(0, limitePermitido - saldoPico);
  const percentualCobertura = limitePermitido > 0 ? (saldoPico / limitePermitido) * 100 : 0;
  
  // Status com cores
  const statusCor = !dentroLimite 
    ? 'vermelho' 
    : percentualCobertura >= 95 
      ? 'amarelo' 
      : 'verde';
  
  const statusTexto = !dentroLimite 
    ? 'INSUFICIENTE' 
    : percentualCobertura >= 95 
      ? 'ATENÇÃO' 
      : 'SEGURO';

  // Selecionar mínimo necessário com estratégias
  const handleSelecionarMinimo = () => {
    if (saldoPico <= 0) {
      alert('⚠️ Configure a operação primeiro para calcular o saldo devedor pico.');
      return;
    }

    const limiteNecessario = saldoPico / (garantia.ltvMaximo / 100);
    
    // Ordenar lotes por valor (baseado na estratégia escolhida)
    const lotesOrdenados = [...lotes].sort((a, b) => {
      const valorA = garantia.criterioAvaliacao === 'mercado' ? a.valorMercado : a.valorVendaForcada;
      const valorB = garantia.criterioAvaliacao === 'mercado' ? b.valorMercado : b.valorVendaForcada;
      return estrategiaSelecao === 'maior-primeiro' ? valorB - valorA : valorA - valorB;
    });

    // Somar até cobrir o limite necessário
    let soma = 0;
    const idsSelecionados: string[] = [];
    
    for (const lote of lotesOrdenados) {
      const valor = garantia.criterioAvaliacao === 'mercado' ? lote.valorMercado : lote.valorVendaForcada;
      soma += valor;
      idsSelecionados.push(lote.id);
      
      if (soma >= limiteNecessario) {
        break;
      }
    }

    setGarantia({ lotesSelecionados: idsSelecionados });
    
    // Calcular folga
    const valorTotalSelecionado = soma;
    const limiteComLTV = valorTotalSelecionado * (garantia.ltvMaximo / 100);
    const folgaCalculada = limiteComLTV - saldoPico;
    
    // Feedback melhorado
    setTimeout(() => {
      alert(
        `✅ Seleção automática concluída!\n\n` +
        `📊 Mínimo necessário: ${idsSelecionados.length} lote(s)\n` +
        `💰 Valor pool: ${formatBRL(valorTotalSelecionado)}\n` +
        `📈 Limite LTV ${garantia.ltvMaximo}%: ${formatBRL(limiteComLTV)}\n` +
        `💚 Folga: ${formatBRL(folgaCalculada)}`
      );
    }, 100);
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
      {/* Pool Global Fixo no Topo */}
      <PoolGlobal />
      
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
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-white p-2 rounded border border-gray-300">
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="radio"
                        checked={estrategiaSelecao === 'maior-primeiro'}
                        onChange={() => setEstrategiaSelecao('maior-primeiro')}
                        className="w-3 h-3"
                      />
                      <span>Maior→Menor</span>
                    </label>
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="radio"
                        checked={estrategiaSelecao === 'menor-primeiro'}
                        onChange={() => setEstrategiaSelecao('menor-primeiro')}
                        className="w-3 h-3"
                      />
                      <span>Menor→Maior</span>
                    </label>
                  </div>
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
              </div>

              {lotes.length === 0 ? (
                <Alert variant="info">
                  Importe lotes na aba "Empreendimento" para começar.
                </Alert>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 font-semibold">
                        <th className="border border-gray-300 px-4 py-3 text-left w-12"></th>
                        <th className="border border-gray-300 px-4 py-3 text-left">ID</th>
                        <th className="border border-gray-300 px-4 py-3 text-left">Matrícula</th>
                        <th className="border border-gray-300 px-4 py-3 text-right">Área (m²)</th>
                        <th className="border border-gray-300 px-4 py-3 text-right">Valor Mercado</th>
                        <th className="border border-gray-300 px-4 py-3 text-right">Venda Forçada</th>
                        <th className="border border-gray-300 px-4 py-3 text-left">Obs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lotes.map((lote) => {
                        const selecionado = garantia.lotesSelecionados.includes(lote.id);
                        return (
                          <tr
                            key={lote.id}
                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                              selecionado ? 'bg-blue-50 border-l-4 border-l-primary' : ''
                            }`}
                            onClick={() => toggleLoteSelecionado(lote.id)}
                          >
                            <td className="border border-gray-300 px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={selecionado}
                                onChange={() => toggleLoteSelecionado(lote.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 cursor-pointer"
                              />
                            </td>
                            <td className="border border-gray-300 px-4 py-3 font-medium">{lote.id}</td>
                            <td className="border border-gray-300 px-4 py-3">{lote.matricula || '-'}</td>
                            <td className="border border-gray-300 px-4 py-3 text-right">
                              {formatNumber(lote.area, 2)}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-right font-semibold">
                              {formatBRL(lote.valorMercado)}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-right">
                              {formatBRL(lote.valorVendaForcada)}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">
                              {lote.observacoes || '-'}
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

          {/* Card Grande: GARANTIA CONSOLIDADA */}
          <div className="lg:col-span-1">
            <Card title="GARANTIA CONSOLIDADA" className="sticky top-4">
              {poolGarantia.quantidade === 0 ? (
                <Alert variant="info">
                  Selecione lotes ou veículos para ver o pool de garantia consolidada.
                </Alert>
              ) : (
                <div className="space-y-6">
                  {/* Valores Principais */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border-2 border-gray-300">
                      <p className="text-sm text-gray-600 mb-1">Valor Pool</p>
                      <p className="text-3xl font-bold text-gray-900">{formatBRL(poolValor)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {poolGarantia.quantidadeLotes} lote(s)
                        {poolGarantia.quantidadeVeiculos > 0 && (
                          <> + {poolGarantia.quantidadeVeiculos} veículo(s)</>
                        )}
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                      <p className="text-sm text-gray-600 mb-1">Limite LTV {garantia.ltvMaximo}%</p>
                      <p className="text-3xl font-bold text-blue-700">{formatBRL(limitePermitido)}</p>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
                      <p className="text-sm text-gray-600 mb-1">Saldo Pico</p>
                      <p className="text-3xl font-bold text-red-700">{formatBRL(saldoPico)}</p>
                      <p className="text-xs text-gray-500 mt-1">Mês {calculos?.mesSaldoPico || 0}</p>
                    </div>
                    
                    <div className={`p-4 rounded-lg border-2 ${
                      folga > 0 
                        ? 'bg-green-50 border-green-300' 
                        : 'bg-red-50 border-red-300'
                    }`}>
                      <p className="text-sm text-gray-600 mb-1">Folga</p>
                      <p className={`text-3xl font-bold ${
                        folga > 0 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {formatBRL(folga)}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className={`p-6 rounded-lg border-2 text-center ${
                    statusCor === 'verde' 
                      ? 'bg-green-50 border-green-400' 
                      : statusCor === 'amarelo'
                        ? 'bg-yellow-50 border-yellow-400'
                        : 'bg-red-50 border-red-400'
                  }`}>
                    <p className="text-sm text-gray-600 mb-2">STATUS</p>
                    <p className={`text-4xl font-bold ${
                      statusCor === 'verde' 
                        ? 'text-green-700' 
                        : statusCor === 'amarelo'
                          ? 'text-yellow-700'
                          : 'text-red-700'
                    }`}>
                      {statusTexto}
                    </p>
                  </div>

                  {/* Indicador Visual - Barra */}
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
                      Indicador Visual
                    </p>
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex-1 text-right">
                        <p className="text-xs text-gray-600">SALDO PICO</p>
                        <p className="text-lg font-bold text-red-600">{formatBRL(saldoPico)}</p>
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden relative">
                          <div
                            className={`h-full transition-all duration-500 ${
                              statusCor === 'verde' 
                                ? 'bg-green-500' 
                                : statusCor === 'amarelo'
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, percentualCobertura)}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-semibold text-gray-800">
                              {percentualCobertura.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-xs text-gray-600">LIMITE POOL</p>
                        <p className="text-lg font-bold text-blue-600">{formatBRL(limitePermitido)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Gráfico: Saldo vs Garantia ao longo do tempo */}
                  {cronogramaSaldo.length > 0 && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
                        Saldo vs Garantia ao Longo do Tempo
                      </p>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={cronogramaSaldo.map((c) => ({
                          mes: `M${c.mes}`,
                          saldoDevedor: c.saldoDevedor,
                          limite: limitePermitido,
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip formatter={(value: number) => formatBRL(value)} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="saldoDevedor"
                            stroke="#ef4444"
                            strokeWidth={2}
                            name="Saldo Devedor"
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="limite"
                            stroke="#22c55e"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            name="Limite Pool"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Alerta */}
                  {!dentroLimite && (
                    <Alert variant="error">
                      <div className="space-y-2">
                        <p className="font-semibold">⚠️ Garantia Insuficiente</p>
                        <p className="text-sm">
                          Faltam <strong>{formatBRL(faltaGarantia)}</strong> em garantia.
                        </p>
                        <p className="text-sm">
                          Sugestão: adicionar {calculos?.quantidadeMinimaMatriculas || 0} lote(s) ou aumentar o valor da garantia.
                        </p>
                        <Button
                          size="sm"
                          variant="primary"
                          className="mt-2 w-full"
                          onClick={handleSelecionarMinimo}
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Selecionar Mínimo Necessário
                        </Button>
                      </div>
                    </Alert>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Gráfico de Cobertura */}
      {saldoPico > 0 && (
        <Card title="Visualização: Saldo vs Limite" className="mt-6">
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
