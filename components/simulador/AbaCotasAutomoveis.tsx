'use client';

import { useState } from 'react';
import { useSimuladorStore } from '@/store/useSimuladorStore';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { InputMoney } from '@/components/ui/InputMoney';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Toggle } from '@/components/ui/Toggle';
import { Plus, Trash2, FileText, Car } from 'lucide-react';
import { CotaAutomovel } from '@/types';
import { formatBRL } from '@/lib/utils';

export function AbaCotasAutomoveis() {
  const {
    cotasAutomoveis,
    garantia,
    setGarantia,
    addCotaAutomovel,
    updateCotaAutomovel,
    removeCotaAutomovel,
    toggleCotaAutomovelSelecionado,
  } = useSimuladorStore();

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddCota = () => {
    try {
      const novaCota: CotaAutomovel = {
        id: `cota-auto-${Date.now()}`,
        grupo: '',
        cota: '',
        marca: '',
        modelo: '',
        ano: new Date().getFullYear(),
        valorContemplacao: 0,
        fipe: 0,
        valorGarantia: 0,
        placa: '',
        chassi: '',
        dataContemplacao: new Date(),
        observacoes: '',
        selecionado: false,
      };
      addCotaAutomovel(novaCota);
      setEditingId(novaCota.id);
    } catch (error) {
      console.error('Erro ao adicionar cota:', error);
    }
  };

  const handleUpdateCota = (id: string, field: keyof CotaAutomovel, value: any) => {
    const cota = cotasAutomoveis.find((c) => c.id === id);
    if (!cota) return;

    const updates: Partial<CotaAutomovel> = { [field]: value };

    // Se atualizar FIPE, recalcular valor de garantia (130% da FIPE)
    if (field === 'fipe') {
      updates.valorGarantia = value * 1.3; // 130% da FIPE
    }

    updateCotaAutomovel(id, updates);
  };

  const handleRemoveCota = (id: string) => {
    removeCotaAutomovel(id);
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

  // Calcular totais das cotas selecionadas
  const cotasSelecionadas = cotasAutomoveis.filter((c) =>
    garantia.veiculosSelecionados.includes(c.id)
  );

  const totaisCotas = {
    quantidade: cotasSelecionadas.length,
    valorContemplacaoTotal: cotasSelecionadas.reduce((sum, c) => sum + c.valorContemplacao, 0),
    fipeTotal: cotasSelecionadas.reduce((sum, c) => sum + c.fipe, 0),
    garantiaTotal: cotasSelecionadas.reduce((sum, c) => sum + c.valorGarantia, 0),
  };

  return (
    <div className="space-y-6">
      <Card title="Cotas Contempladas de Automóveis - Transferência de Cota">
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-700">
              <strong>Transferência de Cota Contemplada:</strong> Gerencie cotas contempladas de consórcio de automóveis.
              O valor de garantia é calculado automaticamente como <strong>130% do valor FIPE</strong> do veículo.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Toggle
                checked={garantia.usarVeiculos}
                onChange={(checked) => setGarantia({ usarVeiculos: checked })}
                label="Usar cotas de automóveis como garantia"
              />
              <p className="text-sm text-gray-600 mt-2">
                Ative para incluir as cotas contempladas no cálculo de garantia da operação.
              </p>
            </div>
            <Button onClick={handleAddCota} size="sm" className="font-medium">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Cota
            </Button>
          </div>

          {garantia.usarVeiculos && cotasSelecionadas.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Resumo das Cotas Selecionadas</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Quantidade</p>
                  <p className="text-2xl font-bold text-primary">{totaisCotas.quantidade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Contemplação Total</p>
                  <p className="text-2xl font-bold">{formatBRL(totaisCotas.valorContemplacaoTotal)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">FIPE Total</p>
                  <p className="text-2xl font-bold">{formatBRL(totaisCotas.fipeTotal)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Garantia Total (130% FIPE)</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatBRL(totaisCotas.garantiaTotal)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {cotasAutomoveis.length === 0 ? (
            <Alert variant="info">
              Nenhuma cota contemplada cadastrada. Clique em "Adicionar Cota" para começar.
            </Alert>
          ) : (
            <div className="space-y-4">
              {cotasAutomoveis.map((cota) => {
                const selecionado = garantia.veiculosSelecionados.includes(cota.id);
                return (
                  <Card key={cota.id} className="relative">
                    <div className="absolute top-4 right-4 flex gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selecionado}
                          onChange={() => toggleCotaAutomovelSelecionado(cota.id)}
                        />
                        <span className="text-sm font-medium">Usar como Garantia</span>
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveCota(cota.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-40">
                      <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-300">
                        <p className="text-xs text-gray-600 mb-1">Dados da Cota</p>
                        <Input
                          label="Grupo"
                          value={cota.grupo}
                          onChange={(e) => handleUpdateCota(cota.id, 'grupo', e.target.value)}
                          placeholder="Ex: 12345"
                        />
                        <Input
                          label="Número da Cota"
                          value={cota.cota}
                          onChange={(e) => handleUpdateCota(cota.id, 'cota', e.target.value)}
                          placeholder="Ex: 001"
                          className="mt-2"
                        />
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg border-2 border-gray-300">
                        <p className="text-xs text-gray-600 mb-1">Dados do Veículo</p>
                        <Input
                          label="Marca"
                          value={cota.marca}
                          onChange={(e) => handleUpdateCota(cota.id, 'marca', e.target.value)}
                          placeholder="Ex: Toyota"
                        />
                        <Input
                          label="Modelo"
                          value={cota.modelo}
                          onChange={(e) => handleUpdateCota(cota.id, 'modelo', e.target.value)}
                          placeholder="Ex: Corolla"
                          className="mt-2"
                        />
                        <Input
                          label="Ano"
                          type="number"
                          value={cota.ano}
                          onChange={(e) =>
                            handleUpdateCota(cota.id, 'ano', parseInt(e.target.value) || 0)
                          }
                          placeholder="Ex: 2020"
                          className="mt-2"
                        />
                      </div>

                      <div className="bg-green-50 p-3 rounded-lg border-2 border-green-300">
                        <p className="text-xs text-gray-600 mb-1">Valores</p>
                        <InputMoney
                          label="Valor da Contemplação"
                          value={cota.valorContemplacao}
                          onChange={(value) => handleUpdateCota(cota.id, 'valorContemplacao', value)}
                        />
                        <InputMoney
                          label="Valor FIPE"
                          value={cota.fipe}
                          onChange={(value) => handleUpdateCota(cota.id, 'fipe', value)}
                          className="mt-2"
                        />
                      </div>

                      <Input
                        label="Placa"
                        value={cota.placa || ''}
                        onChange={(e) => handleUpdateCota(cota.id, 'placa', e.target.value)}
                        placeholder="Ex: ABC-1234"
                      />
                      <Input
                        label="Chassi"
                        value={cota.chassi || ''}
                        onChange={(e) => handleUpdateCota(cota.id, 'chassi', e.target.value)}
                        placeholder="Chassi do veículo"
                      />
                      <Input
                        label="Data de Contemplação"
                        type="date"
                        value={cota.dataContemplacao ? new Date(cota.dataContemplacao).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleUpdateCota(cota.id, 'dataContemplacao', new Date(e.target.value))}
                      />
                      <div className="md:col-span-2 lg:col-span-3">
                        <Input
                          label="Observações"
                          value={cota.observacoes || ''}
                          onChange={(e) =>
                            handleUpdateCota(cota.id, 'observacoes', e.target.value)
                          }
                          placeholder="Observações sobre a cota contemplada"
                        />
                      </div>
                    </div>

                    {/* Resumo da Cota */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Grupo/Cota: </span>
                          <span className="font-semibold">
                            {cota.grupo || '-'} / {cota.cota || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Veículo: </span>
                          <span className="font-semibold">
                            {cota.marca || '-'} {cota.modelo || '-'} {cota.ano || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">FIPE: </span>
                          <span className="font-semibold">{formatBRL(cota.fipe)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Garantia (130%): </span>
                          <span className="font-semibold text-green-700">
                            {formatBRL(cota.valorGarantia)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {!garantia.usarVeiculos && cotasAutomoveis.length > 0 && (
            <Alert variant="info">
              Ative "Usar cotas de automóveis como garantia" para incluir as cotas no cálculo de garantia
              da operação.
            </Alert>
          )}
        </div>
      </Card>
    </div>
  );
}
