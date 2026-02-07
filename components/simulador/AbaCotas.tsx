'use client';

import { useState } from 'react';
import { useSimuladorStore } from '@/store/useSimuladorStore';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { InputMoney } from '@/components/ui/InputMoney';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Toggle } from '@/components/ui/Toggle';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { Cota } from '@/types';
import { formatBRL } from '@/lib/utils';

export function AbaCotas() {
  const {
    cotas,
    usarMultiplasCotas,
    setCotas,
    addCota,
    updateCota,
    removeCota,
    setUsarMultiplasCotas,
    setEstrutura,
  } = useSimuladorStore();

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddCota = () => {
    const novaCota: Cota = {
      id: `cota-${Date.now()}`,
      grupo: '',
      cota: '',
      credito: 0,
      parcelaMensal: 0,
      saldoDevedor: 0,
      prazo: 0,
      observacoes: '',
    };
    addCota(novaCota);
    setEditingId(novaCota.id);
  };

  const handleUpdateCota = (id: string, field: keyof Cota, value: any) => {
    updateCota(id, { [field]: value });
  };

  const handleRemoveCota = (id: string) => {
    removeCota(id);
    if (editingId === id) {
      setEditingId(null);
    }
  };

  // Calcular totais
  const totais = {
    credito: cotas.reduce((sum, c) => sum + c.credito, 0),
    parcelaMensal: cotas.reduce((sum, c) => sum + c.parcelaMensal, 0),
    saldoDevedor: cotas.reduce((sum, c) => sum + c.saldoDevedor, 0),
    quantidade: cotas.length,
  };

  // Aplicar totais à estrutura quando usar múltiplas cotas
  const handleAplicarTotais = () => {
    if (usarMultiplasCotas && totais.credito > 0) {
      setEstrutura({
        credito: totais.credito,
        parcelaMensal: totais.parcelaMensal,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Gerenciamento de Cotas de Consórcio">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Toggle
                checked={usarMultiplasCotas}
                onChange={setUsarMultiplasCotas}
                label="Usar múltiplas cotas (junção de várias cotas)"
              />
              <p className="text-sm text-gray-600 mt-2">
                Ative para gerenciar múltiplas cotas de consórcio e calcular os totais automaticamente.
              </p>
            </div>
          </div>

          {usarMultiplasCotas && (
            <>
              <div className="flex gap-4">
            <Button onClick={handleAddCota} size="sm" className="font-medium">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Cota
            </Button>
                {totais.credito > 0 && (
                  <Button onClick={handleAplicarTotais} variant="primary" size="sm">
                    <Calculator className="w-4 h-4 mr-2" />
                    Aplicar Totais à Estrutura
                  </Button>
                )}
              </div>

              {cotas.length === 0 ? (
                <Alert variant="info">
                  Nenhuma cota cadastrada. Clique em "Adicionar Cota" para começar.
                </Alert>
              ) : (
                <>
                  {/* Resumo dos Totais */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Resumo dos Totais</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Quantidade de Cotas</p>
                        <p className="text-xl font-bold">{totais.quantidade}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Crédito Total</p>
                        <p className="text-xl font-bold text-primary">{formatBRL(totais.credito)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Parcela Mensal Total</p>
                        <p className="text-xl font-bold">{formatBRL(totais.parcelaMensal)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Saldo Devedor Total</p>
                        <p className="text-xl font-bold">{formatBRL(totais.saldoDevedor)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Cotas */}
                  <div className="space-y-4">
                    {cotas.map((cota) => (
                      <Card key={cota.id} className="relative">
                        <div className="absolute top-4 right-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveCota(cota.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-20">
                          <Input
                            label="Grupo"
                            value={cota.grupo}
                            onChange={(e) =>
                              handleUpdateCota(cota.id, 'grupo', e.target.value)
                            }
                            placeholder="Ex: 12345"
                          />
                          <Input
                            label="Número da Cota"
                            value={cota.cota}
                            onChange={(e) =>
                              handleUpdateCota(cota.id, 'cota', e.target.value)
                            }
                            placeholder="Ex: 001"
                          />
                          <InputMoney
                            label="Crédito"
                            value={cota.credito}
                            onChange={(value) =>
                              handleUpdateCota(cota.id, 'credito', value)
                            }
                          />
                          <InputMoney
                            label="Parcela Mensal"
                            value={cota.parcelaMensal}
                            onChange={(value) =>
                              handleUpdateCota(cota.id, 'parcelaMensal', value)
                            }
                          />
                          <InputMoney
                            label="Saldo Devedor"
                            value={cota.saldoDevedor}
                            onChange={(value) =>
                              handleUpdateCota(cota.id, 'saldoDevedor', value)
                            }
                          />
                          <Input
                            label="Prazo (meses)"
                            type="number"
                            value={cota.prazo}
                            onChange={(e) =>
                              handleUpdateCota(cota.id, 'prazo', parseInt(e.target.value) || 0)
                            }
                          />
                          <div className="md:col-span-2 lg:col-span-3">
                            <Input
                              label="Observações"
                              value={cota.observacoes || ''}
                              onChange={(e) =>
                                handleUpdateCota(cota.id, 'observacoes', e.target.value)
                              }
                              placeholder="Observações sobre esta cota"
                            />
                          </div>
                        </div>

                        {/* Resumo da Cota */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Grupo/Cota: </span>
                              <span className="font-semibold">
                                {cota.grupo || '-'} / {cota.cota || '-'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Crédito: </span>
                              <span className="font-semibold">{formatBRL(cota.credito)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Parcela: </span>
                              <span className="font-semibold">{formatBRL(cota.parcelaMensal)}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {!usarMultiplasCotas && (
            <Alert variant="info">
              Ative "Usar múltiplas cotas" para gerenciar várias cotas de consórcio e calcular os
              totais automaticamente.
            </Alert>
          )}
        </div>
      </Card>
    </div>
  );
}
