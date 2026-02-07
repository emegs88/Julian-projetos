'use client';

import { useState } from 'react';
import { useSimuladorStore } from '@/store/useSimuladorStore';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { InputMoney } from '@/components/ui/InputMoney';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Toggle } from '@/components/ui/Toggle';
import { Plus, Trash2, Car, Search, CheckSquare, Square, RefreshCw } from 'lucide-react';
import { Veiculo } from '@/types';
import { formatBRL } from '@/lib/utils';
import { PoolGlobal } from './PoolGlobal';
import { InputPercent } from '@/components/ui/InputPercent';
import { Modal } from '@/components/ui/Modal';
import { useEffect } from 'react';

export function AbaVeiculos() {
  const {
    veiculos,
    garantia,
    setVeiculos,
    addVeiculo,
    updateVeiculo,
    removeVeiculo,
    toggleVeiculoSelecionado,
    setGarantia,
  } = useSimuladorStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [multiplicadorFIPE, setMultiplicadorFIPE] = useState(1.30); // 130% padrão
  const [showModalBusca, setShowModalBusca] = useState(false);
  const [veiculosFIPE, setVeiculosFIPE] = useState<any[]>([]);
  const [buscaModelo, setBuscaModelo] = useState('');
  const [loadingBusca, setLoadingBusca] = useState(false);
  const [codigoFipeInput, setCodigoFipeInput] = useState('');
  const [loadingFIPE, setLoadingFIPE] = useState(false);
  const [loadingVeiculosCliente, setLoadingVeiculosCliente] = useState(false);
  const [veiculosCliente, setVeiculosCliente] = useState<any[]>([]);

  // Carregar veículos do cliente ao abrir a aba
  useEffect(() => {
    carregarVeiculosCliente();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carregar veículos do cliente da API
  const carregarVeiculosCliente = async () => {
    setLoadingVeiculosCliente(true);
    try {
      const response = await fetch('/api/fipe/veiculos');
      if (!response.ok) throw new Error('Erro ao carregar veículos');
      const data = await response.json();
      setVeiculosCliente(data);
      
      // Converter para formato Veiculo e adicionar ao store se não existirem
      const novosVeiculos: Veiculo[] = data.map((v: any) => ({
        id: v.id,
        marca: v.nome.split(' ')[0] || '',
        modelo: v.nome.split(' ').slice(1).join(' ') || v.nome,
        ano: v.ano,
        placa: '',
        chassi: '',
        fipe: v.fipe,
        valorGarantia: v.garantia,
        observacoes: `${v.tipo} - ${v.fonte === 'brasilapi' ? `FIPE ${v.mesReferencia}` : v.fonte === 'cache' ? `Cache ${v.mesReferencia}` : 'Manual'}`,
        selecionado: false,
      }));

      // Adicionar apenas veículos que não existem
      novosVeiculos.forEach((novo) => {
        const existe = veiculos.find((v) => v.id === novo.id);
        if (!existe) {
          addVeiculo(novo);
        } else {
          // Atualizar FIPE e garantia dos existentes apenas se mudou
          if (existe.fipe !== novo.fipe || existe.valorGarantia !== novo.valorGarantia) {
            updateVeiculo(novo.id, {
              fipe: novo.fipe,
              valorGarantia: novo.valorGarantia,
              observacoes: novo.observacoes,
            });
          }
        }
      });
    } catch (error) {
      console.error('Erro ao carregar veículos do cliente:', error);
    } finally {
      setLoadingVeiculosCliente(false);
    }
  };

  // Atualizar FIPE (forçar atualização)
  const handleAtualizarFIPE = async () => {
    setLoadingVeiculosCliente(true);
    try {
      const response = await fetch('/api/fipe/veiculos?atualizar=true');
      if (!response.ok) throw new Error('Erro ao atualizar FIPE');
      const data = await response.json();
      setVeiculosCliente(data);
      
      // Atualizar veículos no store
      data.forEach((v: any) => {
        const veiculoExistente = veiculos.find((veic) => veic.id === v.id);
        if (veiculoExistente) {
          updateVeiculo(v.id, {
            fipe: v.fipe,
            valorGarantia: v.garantia,
            observacoes: `${v.tipo} - ${v.fonte === 'brasilapi' ? `FIPE ${v.mesReferencia}` : v.fonte === 'cache' ? `Cache ${v.mesReferencia}` : 'Manual'}`,
          });
        } else {
          addVeiculo({
            id: v.id,
            marca: v.nome.split(' ')[0] || '',
            modelo: v.nome.split(' ').slice(1).join(' ') || v.nome,
            ano: v.ano,
            placa: '',
            chassi: '',
            fipe: v.fipe,
            valorGarantia: v.garantia,
            observacoes: `${v.tipo} - ${v.fonte === 'brasilapi' ? `FIPE ${v.mesReferencia}` : v.fonte === 'cache' ? `Cache ${v.mesReferencia}` : 'Manual'}`,
            selecionado: false,
          });
        }
      });
      
      alert('✅ FIPE atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar FIPE:', error);
      alert(`Erro ao atualizar FIPE: ${error.message}`);
    } finally {
      setLoadingVeiculosCliente(false);
    }
  };

  // Buscar veículos na API FIPE
  const handleBuscarVeiculos = async () => {
    setLoadingBusca(true);
    try {
      const url = buscaModelo
        ? `/api/fipe?modelo=${encodeURIComponent(buscaModelo)}`
        : '/api/fipe';
      const response = await fetch(url);
      const data = await response.json();
      setVeiculosFIPE(data);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      alert('Erro ao buscar veículos na base FIPE');
    } finally {
      setLoadingBusca(false);
    }
  };

  // Buscar preço FIPE por código
  const handleBuscarPorCodigoFIPE = async () => {
    if (!codigoFipeInput.trim()) {
      alert('Digite um código FIPE');
      return;
    }

    setLoadingFIPE(true);
    try {
      // Calcular garantia via API interna
      const response = await fetch('/api/internal/garantia/veiculo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoFipe: codigoFipeInput.trim(),
          multiplicador: multiplicadorFIPE,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar preço FIPE');
      }

      const { fipeAtual, garantia, mesReferencia } = await response.json();

      // Buscar detalhes do veículo na watchlist (se existir)
      const watchlistResponse = await fetch(`/api/internal/fipe/watchlist?codigoFipe=${codigoFipeInput}`);
      let veiculoInfo: any = null;
      if (watchlistResponse.ok) {
        const watchlist = await watchlistResponse.json();
        veiculoInfo = watchlist.find((v: any) => v.codigoFipe === codigoFipeInput);
      }

      const novoVeiculo: Veiculo = {
        id: `veiculo-${Date.now()}`,
        marca: veiculoInfo?.marca || '',
        modelo: veiculoInfo?.modelo || '',
        ano: veiculoInfo?.anoModelo || new Date().getFullYear(),
        placa: '',
        chassi: '',
        fipe: fipeAtual,
        valorGarantia: garantia,
        observacoes: `FIPE ${mesReferencia}${veiculoInfo?.apelido ? ` - ${veiculoInfo.apelido}` : ''}`,
        selecionado: false,
      };

      addVeiculo(novoVeiculo);
      setEditingId(novoVeiculo.id);
      setShowModalBusca(false);
      setCodigoFipeInput('');
      setBuscaModelo('');
    } catch (error: any) {
      console.error('Erro ao buscar por código FIPE:', error);
      alert(`Erro ao buscar preço FIPE: ${error.message}`);
    } finally {
      setLoadingFIPE(false);
    }
  };

  // Selecionar veículo da API FIPE (tabela antiga)
  const handleSelecionarVeiculoFIPE = async (veiculoFIPE: any) => {
    try {
      // Calcular garantia via API
      const response = await fetch('/api/garantia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: veiculoFIPE.id,
          multiplicador: multiplicadorFIPE,
        }),
      });
      const { garantia, fipe } = await response.json();

      const novoVeiculo: Veiculo = {
        id: `veiculo-${Date.now()}`,
        marca: veiculoFIPE.marca,
        modelo: veiculoFIPE.modelo,
        ano: veiculoFIPE.ano,
        placa: '',
        chassi: '',
        fipe: fipe,
        valorGarantia: garantia,
        observacoes: veiculoFIPE.categoria || '',
        selecionado: false,
      };

      addVeiculo(novoVeiculo);
      setEditingId(novoVeiculo.id);
      setShowModalBusca(false);
      setBuscaModelo('');
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error);
      alert('Erro ao adicionar veículo');
    }
  };

  const handleAddVeiculo = () => {
    setShowModalBusca(true);
    handleBuscarVeiculos();
  };

  const handleUpdateVeiculo = (id: string, field: keyof Veiculo, value: any) => {
    const veiculo = veiculos.find((v) => v.id === id);
    if (!veiculo) return;

    const updates: Partial<Veiculo> = { [field]: value };

    // Recalcular valorGarantia se FIPE mudou
    if (field === 'fipe') {
      updates.valorGarantia = (value || 0) * multiplicadorFIPE;
    }

    updateVeiculo(id, updates);
  };

  const handleRemoveVeiculo = (id: string) => {
    removeVeiculo(id);
    if (editingId === id) {
      setEditingId(null);
    }
    // Remover da seleção de garantia também
    if (garantia.veiculosSelecionados.includes(id)) {
      setGarantia({
        veiculosSelecionados: garantia.veiculosSelecionados.filter((vid) => vid !== id),
      });
    }
  };

  // Calcular totais dos veículos selecionados
  const veiculosSelecionados = veiculos.filter((v) =>
    garantia.veiculosSelecionados.includes(v.id)
  );

  const totaisVeiculos = {
    quantidade: veiculosSelecionados.length,
    fipeTotal: veiculosSelecionados.reduce((sum, v) => sum + v.fipe, 0),
    garantiaTotal: veiculosSelecionados.reduce((sum, v) => sum + v.valorGarantia, 0),
  };

  // Recalcular garantia de todos os veículos quando multiplicador mudar
  const handleMultiplicadorChange = (value: number) => {
    setMultiplicadorFIPE(value);
    // Recalcular garantia de todos os veículos
    const veiculosAtualizados = veiculos.map((veiculo) => ({
      ...veiculo,
      valorGarantia: veiculo.fipe * value,
    }));
    setVeiculos(veiculosAtualizados);
  };

  return (
    <div className="space-y-6">
      {/* Pool Global Fixo no Topo */}
      <PoolGlobal />
      
      <Card title="Veículos - Garantia por FIPE">
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
            <InputPercent
              label="Multiplicador FIPE (%)"
              value={multiplicadorFIPE * 100}
              onChange={(value) => handleMultiplicadorChange(value / 100)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Valor de garantia = FIPE × {multiplicadorFIPE.toFixed(2)} ({((multiplicadorFIPE - 1) * 100).toFixed(0)}% acima da FIPE)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Toggle
                checked={garantia.usarVeiculos}
                onChange={(checked) => setGarantia({ usarVeiculos: checked })}
                label="Usar veículos como garantia"
              />
              <p className="text-sm text-gray-600 mt-2">
                Ative para incluir veículos no cálculo de garantia da operação.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleAtualizarFIPE} 
                size="sm" 
                variant="primary"
                disabled={loadingVeiculosCliente}
                className="font-medium"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingVeiculosCliente ? 'animate-spin' : ''}`} />
                {loadingVeiculosCliente ? 'Atualizando...' : 'Atualizar FIPE'}
              </Button>
              <Button onClick={handleAddVeiculo} size="sm" className="font-medium">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Veículo
              </Button>
              {veiculos.length > 0 && (
                <>
                  <Button
                    onClick={() => {
                      const todosIds = veiculos.map((v) => v.id);
                      setGarantia({ veiculosSelecionados: todosIds });
                    }}
                    variant="outline"
                    size="sm"
                    className="font-medium"
                  >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Selecionar Todos
                  </Button>
                  <Button
                    onClick={() => {
                      setGarantia({ veiculosSelecionados: [] });
                    }}
                    variant="outline"
                    size="sm"
                    className="font-medium"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Limpar Seleção
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Card Lateral: GARANTIA VEÍCULOS */}
          {garantia.usarVeiculos && veiculosSelecionados.length > 0 && (
            <Card title="GARANTIA VEÍCULOS" className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                  <p className="text-sm text-gray-600 mb-1">Total FIPE</p>
                  <p className="text-2xl font-bold text-green-700">{formatBRL(totaisVeiculos.fipeTotal)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-green-400">
                  <p className="text-sm text-gray-600 mb-1">Total Garantia</p>
                  <p className="text-3xl font-bold text-green-800">
                    {formatBRL(totaisVeiculos.garantiaTotal)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                  <p className="text-sm text-gray-600 mb-1">Qtd Veículos</p>
                  <p className="text-2xl font-bold text-green-700">{totaisVeiculos.quantidade}</p>
                </div>
              </div>
            </Card>
          )}

          {loadingVeiculosCliente && veiculos.length === 0 ? (
            <Alert variant="info">
              Carregando veículos do cliente...
            </Alert>
          ) : veiculos.length === 0 ? (
            <Alert variant="info">
              Nenhum veículo cadastrado. Os veículos do cliente serão carregados automaticamente.
            </Alert>
          ) : (
            <div className="space-y-4">
              {/* Tabela de Veículos */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 font-semibold">
                      <th className="border border-gray-300 px-4 py-3 text-left w-12"></th>
                      <th className="border border-gray-300 px-4 py-3 text-center w-20">Incluir</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">Modelo</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">Ano</th>
                      <th className="border border-gray-300 px-4 py-3 text-right">FIPE</th>
                      <th className="border border-gray-300 px-4 py-3 text-right">Garantia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {veiculos.map((veiculo) => {
                      const selecionado = garantia.veiculosSelecionados.includes(veiculo.id);
                      return (
                        <tr
                          key={veiculo.id}
                          className={`hover:bg-gray-50 transition-colors ${
                            selecionado ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                          }`}
                        >
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveVeiculo(veiculo.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={selecionado}
                              onChange={() => toggleVeiculoSelecionado(veiculo.id)}
                              className="w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-3 font-medium">
                            {veiculo.marca} {veiculo.modelo}
                          </td>
                          <td className="border border-gray-300 px-4 py-3">{veiculo.ano}</td>
                          <td className="border border-gray-300 px-4 py-3 text-right font-semibold">
                            {formatBRL(veiculo.fipe)}
                            {veiculo.observacoes && (
                              <span className="text-xs text-gray-500 block">
                                {veiculo.observacoes.includes('FIPE') 
                                  ? veiculo.observacoes.split('FIPE ')[1]?.split(' ')[0] || ''
                                  : veiculo.observacoes.includes('Cache')
                                  ? veiculo.observacoes.split('Cache ')[1]?.split(' ')[0] || ''
                                  : 'Manual'}
                              </span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-right font-bold text-green-700">
                            {formatBRL(veiculo.valorGarantia)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!garantia.usarVeiculos && veiculos.length > 0 && (
            <Alert variant="info">
              Ative "Usar veículos como garantia" para incluir os veículos no cálculo de garantia
              da operação.
            </Alert>
          )}
        </div>
      </Card>

      {/* Modal de Busca de Veículos FIPE */}
      <Modal
        isOpen={showModalBusca}
        onClose={() => {
          setShowModalBusca(false);
          setBuscaModelo('');
          setCodigoFipeInput('');
        }}
        title="Adicionar Veículo - Base FIPE"
        size="lg"
      >
        <div className="space-y-6">
          {/* Busca por Código FIPE (Recomendado) */}
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
            <h3 className="font-semibold mb-2 text-blue-900">Buscar por Código FIPE (Recomendado)</h3>
            <p className="text-sm text-blue-700 mb-3">
              Digite o código FIPE do veículo para buscar o preço atualizado automaticamente da BrasilAPI.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Código FIPE (ex: 001234-5)"
                value={codigoFipeInput}
                onChange={(e) => setCodigoFipeInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleBuscarPorCodigoFIPE();
                  }
                }}
              />
              <Button onClick={handleBuscarPorCodigoFIPE} disabled={loadingFIPE || !codigoFipeInput.trim()}>
                <Search className="w-4 h-4 mr-2" />
                {loadingFIPE ? 'Buscando...' : 'Buscar FIPE'}
              </Button>
            </div>
          </div>

          {/* Busca na Tabela Local (Legado) */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Buscar na Tabela Local</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por modelo (ex: Polo, Gol, Cayenne...)"
                value={buscaModelo}
                onChange={(e) => setBuscaModelo(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleBuscarVeiculos();
                  }
                }}
              />
              <Button onClick={handleBuscarVeiculos} disabled={loadingBusca} variant="outline">
                <Search className="w-4 h-4 mr-2" />
                {loadingBusca ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </div>

          {/* Resultados da Busca Local */}
          {veiculosFIPE.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Marca</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Modelo</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Ano</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold">FIPE</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold">Garantia</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {veiculosFIPE.map((veiculo) => (
                      <tr key={veiculo.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2">{veiculo.marca}</td>
                        <td className="px-4 py-2 font-medium">{veiculo.modelo}</td>
                        <td className="px-4 py-2">{veiculo.ano}</td>
                        <td className="px-4 py-2 text-right">{formatBRL(veiculo.fipe)}</td>
                        <td className="px-4 py-2 text-right font-semibold text-green-700">
                          {formatBRL(veiculo.fipe * multiplicadorFIPE)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleSelecionarVeiculoFIPE(veiculo)}
                          >
                            Selecionar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
