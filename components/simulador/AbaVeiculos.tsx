'use client';

import { useState } from 'react';
import { useSimuladorStore } from '@/store/useSimuladorStore';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { InputMoney } from '@/components/ui/InputMoney';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Toggle } from '@/components/ui/Toggle';
import { Plus, Trash2, Car } from 'lucide-react';
import { Veiculo } from '@/types';
import { formatBRL } from '@/lib/utils';

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

  const handleAddVeiculo = () => {
    const novoVeiculo: Veiculo = {
      id: `veiculo-${Date.now()}`,
      marca: '',
      modelo: '',
      ano: new Date().getFullYear(),
      placa: '',
      chassi: '',
      fipe: 0,
      valorGarantia: 0,
      observacoes: '',
      selecionado: false,
    };
    addVeiculo(novoVeiculo);
    setEditingId(novoVeiculo.id);
  };

  const handleUpdateVeiculo = (id: string, field: keyof Veiculo, value: any) => {
    const veiculo = veiculos.find((v) => v.id === id);
    if (!veiculo) return;

    const updates: Partial<Veiculo> = { [field]: value };

    // Se atualizar FIPE, recalcular valor de garantia (130% da FIPE)
    if (field === 'fipe') {
      updates.valorGarantia = value * 1.3; // 130% da FIPE
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

  return (
    <div className="space-y-6">
      <Card title="Captação com Veículos - Garantia 130% FIPE">
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-700">
              <strong>Garantia por Veículos:</strong> O valor de garantia é calculado automaticamente como{' '}
              <strong>130% do valor FIPE</strong> de cada veículo.
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
            <Button onClick={handleAddVeiculo} size="sm" className="font-medium">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Veículo
            </Button>
          </div>

          {garantia.usarVeiculos && veiculosSelecionados.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Resumo dos Veículos Selecionados</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Quantidade</p>
                  <p className="text-2xl font-bold text-primary">{totaisVeiculos.quantidade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">FIPE Total</p>
                  <p className="text-2xl font-bold">{formatBRL(totaisVeiculos.fipeTotal)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Garantia Total (130% FIPE)</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatBRL(totaisVeiculos.garantiaTotal)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {veiculos.length === 0 ? (
            <Alert variant="info">
              Nenhum veículo cadastrado. Clique em "Adicionar Veículo" para começar.
            </Alert>
          ) : (
            <div className="space-y-4">
              {veiculos.map((veiculo) => {
                const selecionado = garantia.veiculosSelecionados.includes(veiculo.id);
                return (
                  <Card key={veiculo.id} className="relative">
                    <div className="absolute top-4 right-4 flex gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selecionado}
                          onChange={() => toggleVeiculoSelecionado(veiculo.id)}
                        />
                        <span className="text-sm font-medium">Usar como Garantia</span>
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveVeiculo(veiculo.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-40">
                      <Input
                        label="Marca"
                        value={veiculo.marca}
                        onChange={(e) => handleUpdateVeiculo(veiculo.id, 'marca', e.target.value)}
                        placeholder="Ex: Toyota"
                      />
                      <Input
                        label="Modelo"
                        value={veiculo.modelo}
                        onChange={(e) => handleUpdateVeiculo(veiculo.id, 'modelo', e.target.value)}
                        placeholder="Ex: Corolla"
                      />
                      <Input
                        label="Ano"
                        type="number"
                        value={veiculo.ano}
                        onChange={(e) =>
                          handleUpdateVeiculo(veiculo.id, 'ano', parseInt(e.target.value) || 0)
                        }
                        placeholder="Ex: 2020"
                      />
                      <Input
                        label="Placa"
                        value={veiculo.placa || ''}
                        onChange={(e) => handleUpdateVeiculo(veiculo.id, 'placa', e.target.value)}
                        placeholder="Ex: ABC-1234"
                      />
                      <Input
                        label="Chassi"
                        value={veiculo.chassi || ''}
                        onChange={(e) => handleUpdateVeiculo(veiculo.id, 'chassi', e.target.value)}
                        placeholder="Chassi do veículo"
                      />
                      <InputMoney
                        label="Valor FIPE"
                        value={veiculo.fipe}
                        onChange={(value) => handleUpdateVeiculo(veiculo.id, 'fipe', value)}
                      />
                      <div className="md:col-span-2 lg:col-span-3">
                        <Input
                          label="Observações"
                          value={veiculo.observacoes || ''}
                          onChange={(e) =>
                            handleUpdateVeiculo(veiculo.id, 'observacoes', e.target.value)
                          }
                          placeholder="Observações sobre o veículo"
                        />
                      </div>
                    </div>

                    {/* Resumo do Veículo */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Veículo: </span>
                          <span className="font-semibold">
                            {veiculo.marca || '-'} {veiculo.modelo || '-'} {veiculo.ano || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">FIPE: </span>
                          <span className="font-semibold">{formatBRL(veiculo.fipe)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Garantia (130%): </span>
                          <span className="font-semibold text-green-700">
                            {formatBRL(veiculo.valorGarantia)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
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
    </div>
  );
}
