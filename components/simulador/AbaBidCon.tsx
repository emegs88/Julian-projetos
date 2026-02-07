'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSimuladorStore } from '@/store/useSimuladorStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { CotaSelecionada } from '@/types/bidcon';
import { formatBRL } from '@/lib/utils';
import { RefreshCw, ExternalLink, ShoppingCart, CheckCircle, XCircle, AlertTriangle, Zap, Trash2 } from 'lucide-react';
import { selecionarMaximoCotas } from '@/lib/bidcon/selecaoAutomatica';
import { calcularLimiteSaldo } from '@/lib/calculos';

export function AbaBidCon() {
  const {
    cotasBidCon,
    garantia,
    calculos,
    lotes,
    veiculos,
    cotasAutomoveis,
    setCotasBidCon,
    toggleCotaBidConSelecionada,
    updateCotaBidCon,
    setEstrutura,
  } = useSimuladorStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservando, setReservando] = useState<string | null>(null);

  // Carregar cotas do marketplace ao abrir a aba
  useEffect(() => {
    carregarMarketplace();
  }, []);

  // Carregar marketplace
  const carregarMarketplace = async (forcarAtualizacao = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = forcarAtualizacao
        ? '/api/bidcon/marketplace?atualizar=true'
        : '/api/bidcon/marketplace';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao carregar marketplace');
      const { data } = await response.json();
      const cotasComSelecao: CotaSelecionada[] = data.map((cota: any) => ({
        ...cota,
        selecionada: false,
      }));
      setCotasBidCon(cotasComSelecao);
    } catch (err: any) {
      console.error('Erro ao carregar marketplace:', err);
      setError(err.message || 'Erro ao carregar marketplace');
    } finally {
      setLoading(false);
    }
  };

  // Limpar cache
  const handleLimparCache = async () => {
    try {
      const response = await fetch('/api/bidcon/marketplace/limpar-cache', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Erro ao limpar cache');
      alert('✅ Cache limpo com sucesso!');
      // Recarregar marketplace após limpar cache
      await carregarMarketplace(true);
    } catch (err: any) {
      console.error('Erro ao limpar cache:', err);
      alert(`Erro ao limpar cache: ${err.message}`);
    }
  };

  // Calcular pool de garantia
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
    return valorTotalLotes + valorTotalVeiculos + valorTotalCotasAutomoveis;
  }, [lotes, veiculos, cotasAutomoveis, garantia]);

  const limiteGarantia = calcularLimiteSaldo(poolGarantia, garantia.ltvMaximo);
  const saldoPico = calculos?.saldoPico || 0;

  // Cotas selecionadas
  const cotasSelecionadas = cotasBidCon.filter((c) => c.selecionada);

  // Totais das cotas selecionadas
  const totais = useMemo(() => {
    return cotasSelecionadas.reduce(
      (acc, cota) => ({
        credito: acc.credito + cota.credito,
        liquido: acc.liquido + cota.valorLiquidoAPagar,
        parcelas: acc.parcelas + cota.parcela,
      }),
      { credito: 0, liquido: 0, parcelas: 0 }
    );
  }, [cotasSelecionadas]);

  // Calcular novo saldo pico com cotas selecionadas
  const novoSaldoPico = saldoPico + totais.credito;
  const dentroLimite = novoSaldoPico <= limiteGarantia;
  const folga = Math.max(0, limiteGarantia - novoSaldoPico);
  const percentualCobertura = limiteGarantia > 0 ? (novoSaldoPico / limiteGarantia) * 100 : 0;

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

  // Seleção automática
  const handleSelecionarAutomatico = () => {
    if (saldoPico <= 0) {
      alert('⚠️ Configure a operação primeiro para calcular o saldo devedor pico.');
      return;
    }

    const resultado = selecionarMaximoCotas({
      cotas: cotasBidCon,
      saldoPico,
      limiteGarantia,
    });

    // Aplicar seleção
    const cotasAtualizadas = cotasBidCon.map((cota) => ({
      ...cota,
      selecionada: resultado.cotasSelecionadas.some((cs) => cs.id === cota.id),
    }));

    setCotasBidCon(cotasAtualizadas);

    // Aplicar totais à estrutura
    if (resultado.creditoTotal > 0) {
      setEstrutura({
        credito: resultado.creditoTotal,
        parcelaMensal: resultado.parcelasTotal,
      });
    }

    alert(
      `✅ Seleção automática concluída!\n\n` +
      `📊 Cotas selecionadas: ${resultado.cotasSelecionadas.length}\n` +
      `💰 Crédito total: ${formatBRL(resultado.creditoTotal)}\n` +
      `💵 Líquido a pagar: ${formatBRL(resultado.liquidoTotal)}\n` +
      `📈 Novo saldo pico: ${formatBRL(resultado.novoSaldoPico)}\n` +
      `💚 Folga: ${formatBRL(resultado.folga)}`
    );
  };

  // Reservar cota
  const handleReservar = async (cota: CotaSelecionada) => {
    if (!window.confirm(`Deseja reservar a cota ${cota.grupo}/${cota.cota} por 30 minutos?`)) {
      return;
    }

    setReservando(cota.id);
    try {
      const response = await fetch('/api/bidcon/marketplace/reservar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BIDCON_API_KEY || ''}`,
        },
        body: JSON.stringify({
          cartaId: cota.id,
          reservadoPor: 'Prospere',
          ttlMinutos: 30,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao reservar cota');
      }

      const { reservaId, expiresAt } = await response.json();

      updateCotaBidCon(cota.id, {
        status: 'RESERVADO',
        reservaId,
        expiresAt,
        reservadoPor: 'Prospere',
      });

      alert(`✅ Cota reservada com sucesso! Reserva expira em ${new Date(expiresAt).toLocaleString('pt-BR')}`);
    } catch (err: any) {
      console.error('Erro ao reservar:', err);
      alert(`Erro ao reservar cota: ${err.message}`);
    } finally {
      setReservando(null);
    }
  };

  // Confirmar compra
  const handleConfirmarCompra = async (cota: CotaSelecionada) => {
    if (!cota.reservaId) {
      alert('A cota precisa estar reservada antes de confirmar a compra.');
      return;
    }

    const formaPagamento = prompt('Forma de pagamento:');
    if (!formaPagamento) return;

    try {
      const response = await fetch('/api/bidcon/marketplace/confirmar-compra', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BIDCON_API_KEY || ''}`,
        },
        body: JSON.stringify({
          reservaId: cota.reservaId,
          comprador: 'Prospere',
          formaPagamento,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao confirmar compra');
      }

      updateCotaBidCon(cota.id, {
        status: 'VENDIDO',
      });

      alert('✅ Compra confirmada com sucesso! A cota foi movida para "Minhas Compras".');
    } catch (err: any) {
      console.error('Erro ao confirmar compra:', err);
      alert(`Erro ao confirmar compra: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Card de Resumo */}
      <Card title="Resumo das Cotas Selecionadas" className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
            <p className="text-sm text-gray-600 mb-1">Crédito Total</p>
            <p className="text-2xl font-bold text-blue-700">{formatBRL(totais.credito)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
            <p className="text-sm text-gray-600 mb-1">Custo (Líquido a Pagar)</p>
            <p className="text-2xl font-bold text-blue-700">{formatBRL(totais.liquido)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
            <p className="text-sm text-gray-600 mb-1">Parcelas Somadas</p>
            <p className="text-2xl font-bold text-blue-700">{formatBRL(totais.parcelas)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-blue-400">
            <p className="text-sm text-gray-600 mb-1">Qtd Cotas</p>
            <p className="text-3xl font-bold text-blue-800">{cotasSelecionadas.length}</p>
          </div>
        </div>

        {cotasSelecionadas.length > 0 && (
          <div className="mt-4 pt-4 border-t border-blue-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border-2 ${
                statusCor === 'verde'
                  ? 'bg-green-50 border-green-300'
                  : statusCor === 'amarelo'
                    ? 'bg-yellow-50 border-yellow-300'
                    : 'bg-red-50 border-red-300'
              }`}>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className={`text-xl font-bold ${
                  statusCor === 'verde'
                    ? 'text-green-700'
                    : statusCor === 'amarelo'
                      ? 'text-yellow-700'
                      : 'text-red-700'
                }`}>
                  {statusTexto}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                <p className="text-sm text-gray-600 mb-1">Novo Saldo Pico</p>
                <p className="text-xl font-bold">{formatBRL(novoSaldoPico)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                <p className="text-sm text-gray-600 mb-1">Limite pela Garantia</p>
                <p className="text-xl font-bold">{formatBRL(limiteGarantia)}</p>
                <p className="text-xs text-gray-500 mt-1">Folga: {formatBRL(folga)}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Alertas */}
      {!dentroLimite && cotasSelecionadas.length > 0 && (
        <Alert variant="error">
          <div className="space-y-2">
            <p className="font-semibold">⚠️ Garantia Insuficiente</p>
            <p className="text-sm">
              O saldo pico ({formatBRL(novoSaldoPico)}) excede o limite de garantia ({formatBRL(limiteGarantia)}).
            </p>
            <p className="text-sm">
              Faltam <strong>{formatBRL(limiteGarantia - novoSaldoPico)}</strong> em garantia.
            </p>
            <p className="text-sm">
              Sugestões: adicionar mais garantia (lotes/veículos), reduzir número de cotas ou trocar por cotas com menor impacto.
            </p>
          </div>
        </Alert>
      )}

      {percentualCobertura >= 95 && percentualCobertura < 100 && cotasSelecionadas.length > 0 && (
        <Alert variant="warning">
          <p className="font-semibold">⚠️ Atenção</p>
          <p className="text-sm">
            A operação está usando {percentualCobertura.toFixed(1)}% do limite de garantia. Considere adicionar mais garantia.
          </p>
        </Alert>
      )}

      {/* Controles */}
      <Card title="Cotas Automáticas (BidCon Marketplace)">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Button
              onClick={() => carregarMarketplace(true)}
              disabled={loading}
              variant="outline"
              size="sm"
              className="font-medium"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Atualizando...' : 'Atualizar Marketplace'}
            </Button>
            <Button
              onClick={handleLimparCache}
              disabled={loading}
              variant="outline"
              size="sm"
              className="font-medium text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Cache
            </Button>
            <Button
              onClick={handleSelecionarAutomatico}
              disabled={saldoPico <= 0 || cotasBidCon.length === 0}
              variant="primary"
              size="sm"
              className="font-medium"
            >
              <Zap className="w-4 h-4 mr-2" />
              Selecionar Automático (Máximo)
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {cotasBidCon.length === 0 && !loading ? (
          <Alert variant="info">
            Nenhuma cota disponível no marketplace. Clique em "Atualizar Marketplace" para buscar.
          </Alert>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 font-semibold">
                  <th className="border border-gray-300 px-4 py-3 text-center w-12"></th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Crédito</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Líquido a Pagar</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Entrada</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Parcela</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Prazo</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Adm</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Status</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {cotasBidCon.map((cota) => {
                  const selecionada = cota.selecionada;
                  return (
                    <tr
                      key={cota.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selecionada ? 'bg-blue-50 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selecionada}
                          onChange={() => toggleCotaBidConSelecionada(cota.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-3 font-semibold">
                        {formatBRL(cota.credito)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {formatBRL(cota.valorLiquidoAPagar)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {formatBRL(cota.valorEntrada)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {formatBRL(cota.parcela)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {cota.prazoMeses} meses
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {cota.administradora}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            cota.status === 'DISPONIVEL'
                              ? 'bg-green-100 text-green-800'
                              : cota.status === 'RESERVADO'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {cota.status}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(cota.linkPublico, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                          {cota.status === 'DISPONIVEL' && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleReservar(cota)}
                              disabled={reservando === cota.id}
                            >
                              {reservando === cota.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <ShoppingCart className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                          {cota.status === 'RESERVADO' && cota.reservaId && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleConfirmarCompra(cota)}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
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
  );
}
