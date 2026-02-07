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
import { veiculosBase, getValorBase } from '@/data/veiculosBase';

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
  const [progressFIPE, setProgressFIPE] = useState<{ atual: number; total: number } | null>(null);
  const [showModalResolver, setShowModalResolver] = useState(false);
  const [erroResolver, setErroResolver] = useState<{ veiculoId: string; erro: string; sugestoes?: any[] } | null>(null);

  // Carregar veículos do cliente ao abrir a aba
  useEffect(() => {
    // Inicializar veículos do catálogo apenas se não existirem no store
    veiculosBase.forEach((vBase) => {
      const existe = veiculos.find(v => v.id === vBase.id);
      if (!existe) {
        const partes = vBase.modelo.split(' ');
        const marca = partes[0] || '';
        const modelo = partes.slice(1).join(' ') || vBase.modelo;
        const multiplicador = 1.3;
        const garantia = vBase.valorBase * multiplicador;
        
        addVeiculo({
          id: vBase.id,
          marca,
          modelo,
          ano: vBase.ano,
          placa: '',
          chassi: '',
          fipe: vBase.valorBase, // Inicializar com catálogo
          fipeBase: vBase.valorBase,
          fipeAtual: undefined,
          fonteFipe: 'CATALOGO',
          multiplicador,
          valorGarantia: garantia,
          observacoes: `${vBase.tipo} - CATÁLOGO`,
          selecionado: false,
        });
      }
    });
    
    // Depois tentar atualizar pela API (apenas atualizar, não adicionar duplicados)
    // Usar timeout para evitar race condition
    const timeout = setTimeout(() => {
      carregarVeiculosCliente(true);
    }, 100);
    
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executar apenas uma vez ao montar

  // Carregar veículos do cliente da API
  const carregarVeiculosCliente = async (buscarCodigos: boolean = true) => {
    setLoadingVeiculosCliente(true);
    try {
      // Sempre buscar códigos FIPE se não tiverem
      const url = buscarCodigos 
        ? '/api/fipe/veiculos?buscar_codigos=true'
        : '/api/fipe/veiculos';
      console.log('🔄 Carregando veículos da API:', url);
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao carregar veículos: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log('✅ Veículos carregados:', data.length, 'itens');
      setVeiculosCliente(data);
      
      // Converter para formato Veiculo e adicionar ao store se não existirem
      const novosVeiculos: Veiculo[] = data.map((v: any) => {
        const fipeBase = getValorBase(v.id) || v.fipe || 0;
        const fipeAtual = v.fonte === 'brasilapi' || v.fonte === 'cache' ? v.fipe : undefined;
        const fipe = fipeAtual ?? fipeBase; // Usar atual se existir, senão base
        const fonteFipe = fipeAtual ? 'API' : 'CATALOGO';
        const multiplicador = v.multiplicador || 1.3;
        const garantia = fipe * multiplicador;
        
        return {
          id: v.id,
          marca: v.nome.split(' ')[0] || '',
          modelo: v.nome.split(' ').slice(1).join(' ') || v.nome,
          ano: v.ano,
          placa: '',
          chassi: '',
          fipe,
          fipeBase,
          fipeAtual,
          fonteFipe,
          mesReferencia: v.mesReferencia,
          codigoFipe: v.codigoFipe,
          multiplicador,
          valorGarantia: garantia,
          observacoes: `${v.tipo} - ${fonteFipe}${v.mesReferencia ? ` ${v.mesReferencia}` : ''}`,
          selecionado: false,
        };
      });

      // Atualizar veículos existentes ou adicionar apenas se não existirem
      // Usar o estado atualizado do store para evitar duplicação
      novosVeiculos.forEach((novo) => {
        // Verificar no store atual (não no estado antigo)
        const existe = veiculos.find((v) => v.id === novo.id);
        if (!existe) {
          // Adicionar apenas se realmente não existir
          addVeiculo(novo);
        } else {
          // Sempre atualizar com dados mais recentes (mesmo que não mudou)
          // Mas verificar se realmente precisa atualizar para evitar loops
          const precisaAtualizar = 
            existe.fipe !== novo.fipe ||
            existe.fipeBase !== novo.fipeBase ||
            existe.fipeAtual !== novo.fipeAtual ||
            existe.fonteFipe !== novo.fonteFipe ||
            existe.valorGarantia !== novo.valorGarantia;
          
          if (precisaAtualizar) {
            updateVeiculo(novo.id, {
              fipe: novo.fipe,
              fipeBase: novo.fipeBase,
              fipeAtual: novo.fipeAtual,
              fonteFipe: novo.fonteFipe,
              mesReferencia: novo.mesReferencia,
              codigoFipe: novo.codigoFipe,
              multiplicador: novo.multiplicador,
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

  // Atualizar FIPE PRO (automático)
  const handleAtualizarFIPEPRO = async () => {
    setLoadingFIPE(true);
    setProgressFIPE({ atual: 0, total: veiculosCliente.length || veiculos.length });
    
    try {
      // Preparar lista de veículos para a API (usar veículos do store, não duplicar)
      const vehiclesList = veiculos.map((v) => {
        // Determinar tipo baseado no ID ou modelo
        let tipo: 'carros' | 'caminhoes' | 'maquinas' | 'outros' = 'carros';
        if (v.id.startsWith('TRK')) tipo = 'caminhoes';
        else if (v.id.startsWith('EQP') || v.id.startsWith('EMP')) tipo = 'maquinas';
        else if (v.id.startsWith('BAU') || v.id.startsWith('PLT')) tipo = 'outros';
        
        return {
          id: v.id,
          tipo,
          marcaTexto: v.marca,
          modeloTexto: v.modelo,
          ano: v.ano,
          fipeAtual: v.fipeAtual ?? v.fipeBase, // Usar atual se existir, senão base
          codigoFipe: v.codigoFipe,
          fonte: v.fonteFipe === 'API' ? 'api' : 'manual',
          multiplicador: v.multiplicador || multiplicadorFIPE,
          incluir: garantia.veiculosSelecionados.includes(v.id),
        };
      });

      // Chamar API PRO
      const response = await fetch('/api/fipe/update-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicles: vehiclesList }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao atualizar FIPE');
      }

      const data = await response.json();

      if (!data.success || !data.resultados) {
        throw new Error('Resposta inválida da API');
      }

      // Processar resultados
      let atualizados = 0;
      let erros = 0;
      const errosComSugestoes: Array<{ veiculoId: string; erro: string; sugestoes?: any[] }> = [];

      for (let i = 0; i < data.resultados.length; i++) {
        const resultado = data.resultados[i];
        setProgressFIPE({ atual: i + 1, total: data.resultados.length });

        if (!resultado.ok) {
          erros++;
          if (resultado.sugestoes && resultado.sugestoes.length > 0) {
            errosComSugestoes.push({
              veiculoId: resultado.id,
              erro: resultado.erro || 'Erro desconhecido',
              sugestoes: resultado.sugestoes,
            });
          }
          continue;
        }

        // Atualizar veículo no store
        const veiculoExistente = veiculos.find((veic) => veic.id === resultado.id);
        
        const fipeBase = resultado.fipeBase || getValorBase(resultado.id) || 0;
        const fipeAtual = resultado.fipeAtual;
        const fipe = fipeAtual ?? fipeBase; // Usar atual se existir, senão base
        const fonteFipe = resultado.fonteFipe || (fipeAtual ? 'API' : 'CATALOGO');
        const multiplicador = multiplicadorFIPE;
        const garantia = resultado.garantia || (fipe * multiplicador);
        
        if (veiculoExistente) {
          updateVeiculo(resultado.id, {
            fipe,
            fipeBase,
            fipeAtual,
            fonteFipe,
            mesReferencia: resultado.mesReferencia,
            codigoFipe: resultado.codigoFipe,
            multiplicador,
            valorGarantia: garantia,
            observacoes: `${fonteFipe}${resultado.mesReferencia ? ` ${resultado.mesReferencia}` : ''}`.trim(),
          });
        } else {
          // Adicionar novo veículo
          const veiculoCliente = veiculosCliente.find((v: any) => v.id === resultado.id);
          if (veiculoCliente) {
            const partes = veiculoCliente.nome.split(' ');
            addVeiculo({
              id: resultado.id,
              marca: partes[0] || '',
              modelo: partes.slice(1).join(' ') || veiculoCliente.nome,
              ano: veiculoCliente.ano,
              placa: '',
              chassi: '',
              fipe,
              fipeBase,
              fipeAtual,
              fonteFipe,
              mesReferencia: resultado.mesReferencia,
              codigoFipe: resultado.codigoFipe,
              multiplicador,
              valorGarantia: garantia,
              observacoes: `${fonteFipe}${resultado.mesReferencia ? ` ${resultado.mesReferencia}` : ''}`.trim(),
              selecionado: false,
            });
          }
        }
        
        atualizados++;
      }

      // Se houver erros com sugestões, mostrar modal
      if (errosComSugestoes.length > 0) {
        setErroResolver(errosComSugestoes[0]);
        setShowModalResolver(true);
      }

      // Mensagem de resultado (amigável, sem assustar)
      const mantidosCatalogo = data.resultados.filter((r: any) => r.fonteFipe === 'CATALOGO').length;
      const atualizadosAPI = data.resultados.filter((r: any) => r.fonteFipe === 'API').length;
      
      if (atualizadosAPI > 0 && mantidosCatalogo > 0) {
        alert(`✅ FIPE atualizada: ${atualizadosAPI} veículo(s) atualizado(s) pela API e ${mantidosCatalogo} mantido(s) pelo catálogo.`);
      } else if (atualizadosAPI > 0) {
        alert(`✅ FIPE atualizada com sucesso! ${atualizadosAPI} veículo(s) atualizado(s) pela API.`);
      } else {
        alert(`ℹ️ FIPE mantida pelo catálogo para todos os veículos.`);
      }
    } catch (error: any) {
      console.error('Erro ao atualizar FIPE PRO:', error);
      alert(`❌ Erro ao atualizar FIPE: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoadingFIPE(false);
      setProgressFIPE(null);
    }
  };

  // Manter função antiga para compatibilidade
  const handleAtualizarFIPE = handleAtualizarFIPEPRO;

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

      const fipeBase = fipeAtual || 0; // Se não tiver base, usar o atual
      const multiplicador = multiplicadorFIPE;
      const novoVeiculo: Veiculo = {
        id: `veiculo-${Date.now()}`,
        marca: veiculoInfo?.marca || '',
        modelo: veiculoInfo?.modelo || '',
        ano: veiculoInfo?.anoModelo || new Date().getFullYear(),
        placa: '',
        chassi: '',
        fipe: fipeAtual,
        fipeBase,
        fipeAtual: fipeAtual,
        fonteFipe: 'API',
        mesReferencia,
        multiplicador,
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

      const fipeBase = fipe || 0;
      const multiplicador = multiplicadorFIPE;
      const novoVeiculo: Veiculo = {
        id: `veiculo-${Date.now()}`,
        marca: veiculoFIPE.marca,
        modelo: veiculoFIPE.modelo,
        ano: veiculoFIPE.ano,
        placa: '',
        chassi: '',
        fipe,
        fipeBase,
        fipeAtual: fipe,
        fonteFipe: 'API',
        multiplicador,
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

    // Recalcular valorGarantia se FIPE ou multiplicador mudou
    if (field === 'fipe' || field === 'multiplicador') {
      const fipe = field === 'fipe' 
        ? (value || veiculo.fipeBase || 0) 
        : ((veiculo.fipeAtual ?? veiculo.fipeBase) || 0);
      const mult = field === 'multiplicador' ? (value || 1.3) : (veiculo.multiplicador || 1.3);
      updates.valorGarantia = fipe * mult;
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
                onClick={handleAtualizarFIPEPRO}
                size="sm" 
                variant="primary"
                disabled={loadingFIPE}
                className="font-medium"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingFIPE ? 'animate-spin' : ''}`} />
                {loadingFIPE 
                  ? (progressFIPE ? `Atualizando ${progressFIPE.atual}/${progressFIPE.total}...` : 'Atualizando...')
                  : 'Atualizar FIPE (PRO)'}
              </Button>
              {progressFIPE && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progressFIPE.atual / progressFIPE.total) * 100}%` }}
                  ></div>
                </div>
              )}
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
                            <div className="flex items-center justify-end gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                veiculo.fonteFipe === 'API' 
                                  ? 'bg-blue-100 text-blue-700 font-medium'
                                  : veiculo.fonteFipe === 'CATALOGO'
                                  ? 'bg-gray-100 text-gray-700 font-medium'
                                  : 'bg-yellow-100 text-yellow-700 font-medium'
                              }`}>
                                {veiculo.fonteFipe || 'CATÁLOGO'}
                              </span>
                              {veiculo.mesReferencia && (
                                <span className="text-xs text-gray-500">
                                  {veiculo.mesReferencia}
                                </span>
                              )}
                            </div>
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

      {/* Modal de Resolução de FIPE */}
      <Modal
        isOpen={showModalResolver}
        onClose={() => {
          setShowModalResolver(false);
          setErroResolver(null);
        }}
        title="Resolver FIPE - Sugestões"
        size="lg"
      >
        {erroResolver && (
          <div className="space-y-4">
            <Alert variant="warning">
              <p className="font-semibold">Erro ao resolver código FIPE automaticamente:</p>
              <p className="text-sm">{erroResolver.erro}</p>
            </Alert>
            
            {erroResolver.sugestoes && erroResolver.sugestoes.length > 0 && (
              <div>
                <p className="font-semibold mb-3">Sugestões encontradas:</p>
                <div className="space-y-2">
                  {erroResolver.sugestoes.map((sugestao, index) => (
                    <div
                      key={index}
                      className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={async () => {
                        // Salvar código FIPE escolhido
                        try {
                          const response = await fetch('/api/fipe/update-pro', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              vehicles: [{
                                id: erroResolver.veiculoId,
                                codigoFipe: sugestao.codigoFipe,
                                // Outros campos necessários
                              }],
                            }),
                          });
                          
                          if (response.ok) {
                            alert('✅ Código FIPE salvo com sucesso!');
                            setShowModalResolver(false);
                            setErroResolver(null);
                            // Recarregar veículos
                            handleAtualizarFIPEPRO();
                          }
                        } catch (error: any) {
                          alert(`Erro ao salvar código FIPE: ${error.message}`);
                        }
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{sugestao.marca} {sugestao.modelo}</p>
                          <p className="text-sm text-gray-600">Ano: {sugestao.ano}</p>
                          <p className="text-xs text-gray-500">Código FIPE: {sugestao.codigoFipe}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-blue-600">
                            Score: {(sugestao.score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Clique em uma sugestão para salvar o código FIPE e atualizar o veículo.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

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
