'use client';

import { useState } from 'react';
import { useSimuladorStore } from '@/store/useSimuladorStore';
import { Card } from '@/components/ui/Card';
import { InputMoney } from '@/components/ui/InputMoney';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Building2 } from 'lucide-react';
import { formatBRL } from '@/lib/utils';
import { calcularTotalCustos } from '@/lib/calculos';

interface CustoItem {
  id: string;
  tipo: 'documentacao' | 'registro' | 'itbi' | 'comissao' | 'outros';
  descricao: string;
  valor: number;
  orgao: string;
  observacoes?: string;
}

const tiposCusto = [
  { value: 'documentacao', label: 'Documentação', orgaoPadrao: 'Cartório' },
  { value: 'registro', label: 'Registro', orgaoPadrao: 'Cartório de Registro' },
  { value: 'itbi', label: 'ITBI', orgaoPadrao: 'Prefeitura/Receita' },
  { value: 'comissao', label: 'Comissões', orgaoPadrao: 'Corretor/Intermediário' },
  { value: 'outros', label: 'Outros', orgaoPadrao: 'Outros' },
];

export function CustosDetalhados() {
  const { estrutura, setEstrutura } = useSimuladorStore();
  const [custosAdicionais, setCustosAdicionais] = useState<CustoItem[]>([]);

  const adicionarCusto = () => {
    const novoCusto: CustoItem = {
      id: `custo-${Date.now()}`,
      tipo: 'outros',
      descricao: '',
      valor: 0,
      orgao: '',
    };
    setCustosAdicionais([...custosAdicionais, novoCusto]);
  };

  const removerCusto = (id: string) => {
    setCustosAdicionais(custosAdicionais.filter((c) => c.id !== id));
  };

  const atualizarCusto = (id: string, campo: keyof CustoItem, valor: any) => {
    setCustosAdicionais(
      custosAdicionais.map((c) => (c.id === id ? { ...c, [campo]: valor } : c))
    );
  };

  const totalCustosAdicionais = custosAdicionais.reduce((sum, c) => sum + c.valor, 0);
  const totalGeral = calcularTotalCustos(estrutura) + totalCustosAdicionais;

  return (
    <Card title="Custos Detalhados por Órgão/Registrador">
      <div className="space-y-6">
        {/* Custos Principais */}
        <div>
          <h4 className="font-semibold mb-4">Custos Principais</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <InputMoney
                label="Documentação"
                value={estrutura.custoDocumentacao}
                onChange={(value) => setEstrutura({ custoDocumentacao: value })}
              />
              <p className="text-xs text-gray-500 mt-1">Cartório / Documentação</p>
            </div>
            <div>
              <InputMoney
                label="Registro"
                value={estrutura.custoRegistro}
                onChange={(value) => setEstrutura({ custoRegistro: value })}
              />
              <p className="text-xs text-gray-500 mt-1">Cartório de Registro</p>
            </div>
            <div>
              <InputMoney
                label="ITBI"
                value={estrutura.custoITBI}
                onChange={(value) => setEstrutura({ custoITBI: value })}
              />
              <p className="text-xs text-gray-500 mt-1">Prefeitura / Receita Federal</p>
            </div>
            <div>
              <InputMoney
                label="Comissões"
                value={estrutura.custoComissoes}
                onChange={(value) => setEstrutura({ custoComissoes: value })}
              />
              <p className="text-xs text-gray-500 mt-1">Corretor / Intermediário</p>
            </div>
            <div>
              <InputMoney
                label="Outros Custos"
                value={estrutura.custoOutros}
                onChange={(value) => setEstrutura({ custoOutros: value })}
              />
              <p className="text-xs text-gray-500 mt-1">Outros custos operacionais</p>
            </div>
          </div>
        </div>

        {/* Custos Adicionais por Item */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">Custos Adicionais por Item</h4>
            <Button size="sm" onClick={adicionarCusto}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Custo
            </Button>
          </div>

          {custosAdicionais.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhum custo adicional cadastrado. Clique em "Adicionar Custo" para incluir.
            </p>
          ) : (
            <div className="space-y-4">
              {custosAdicionais.map((custo) => (
                <Card key={custo.id} className="relative">
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removerCusto(custo.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pr-20">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        value={custo.tipo}
                        onChange={(e) => {
                          const tipo = e.target.value as CustoItem['tipo'];
                          atualizarCusto(custo.id, 'tipo', tipo);
                          atualizarCusto(
                            custo.id,
                            'orgao',
                            tiposCusto.find((t) => t.value === tipo)?.orgaoPadrao || ''
                          );
                        }}
                      >
                        {tiposCusto.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Input
                        label="Órgão/Registrador"
                        value={custo.orgao}
                        onChange={(e) => atualizarCusto(custo.id, 'orgao', e.target.value)}
                        placeholder="Ex: Cartório Central"
                      />
                    </div>
                    <div>
                      <Input
                        label="Descrição"
                        value={custo.descricao}
                        onChange={(e) => atualizarCusto(custo.id, 'descricao', e.target.value)}
                        placeholder="Descrição do custo"
                      />
                    </div>
                    <div>
                      <InputMoney
                        label="Valor"
                        value={custo.valor}
                        onChange={(value) => atualizarCusto(custo.id, 'valor', value)}
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-4">
                      <Input
                        label="Observações"
                        value={custo.observacoes || ''}
                        onChange={(e) => atualizarCusto(custo.id, 'observacoes', e.target.value)}
                        placeholder="Observações adicionais"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Resumo de Custos */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold mb-4">Resumo de Custos</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Custos Principais</p>
              <p className="text-xl font-bold">{formatBRL(calcularTotalCustos(estrutura))}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Custos Adicionais</p>
              <p className="text-xl font-bold">{formatBRL(totalCustosAdicionais)}</p>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total de Custos</p>
              <p className="text-2xl font-bold text-primary">{formatBRL(totalGeral)}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
