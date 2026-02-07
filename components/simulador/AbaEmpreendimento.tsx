'use client';

import { useState } from 'react';
import { useSimuladorStore } from '@/store/useSimuladorStore';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Lote } from '@/types';
import { formatBRL, formatNumber } from '@/lib/utils';
import { InfoPromissao } from './InfoPromissao';

export function AbaEmpreendimento() {
  const { empreendimento, lotes, setEmpreendimento } = useSimuladorStore();

  return (
    <div className="space-y-6">
      <InfoPromissao />
      
      <Card title="Dados do Empreendimento">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome"
            value={empreendimento.nome}
            onChange={(e) => setEmpreendimento({ nome: e.target.value })}
          />
          <Input
            label="Cidade/UF"
            value={`${empreendimento.cidade}/${empreendimento.uf}`}
            onChange={(e) => {
              const [cidade, uf] = e.target.value.split('/');
              setEmpreendimento({ cidade: cidade?.trim() || '', uf: uf?.trim() || '' });
            }}
          />
          <Input
            label="Status"
            value={empreendimento.status}
            onChange={(e) => setEmpreendimento({ status: e.target.value })}
          />
          <Input
            label="Matrícula"
            value={empreendimento.matricula}
            onChange={(e) => setEmpreendimento({ matricula: e.target.value })}
          />
          <Input
            label="Área Total (m²)"
            type="number"
            value={empreendimento.areaTotal}
            onChange={(e) => setEmpreendimento({ areaTotal: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="Quantidade Total de Lotes"
            type="number"
            value={empreendimento.quantidadeLotesTotal}
            onChange={(e) => setEmpreendimento({ quantidadeLotesTotal: parseInt(e.target.value) || 0 })}
          />
          <Input
            label="Lotes Residenciais"
            type="number"
            value={empreendimento.quantidadeLotesResidenciais}
            onChange={(e) => setEmpreendimento({ quantidadeLotesResidenciais: parseInt(e.target.value) || 0 })}
          />
          <Input
            label="Lotes Residencial/Comercial"
            type="number"
            value={empreendimento.quantidadeLotesResCom}
            onChange={(e) => setEmpreendimento({ quantidadeLotesResCom: parseInt(e.target.value) || 0 })}
          />
        </div>
      </Card>


      {lotes.length > 0 ? (
        <Card title="Tabela de Lotes">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">ID</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Matrícula</th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Área (m²)</th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Valor Mercado</th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Venda Forçada</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Observações</th>
                </tr>
              </thead>
              <tbody>
                {lotes.map((lote) => (
                  <tr key={lote.id} className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-300 px-4 py-2 font-medium">{lote.id}</td>
                    <td className="border border-gray-300 px-4 py-2">{lote.matricula}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {formatNumber(lote.area, 2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                      {formatBRL(lote.valorMercado)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {formatBRL(lote.valorVendaForcada)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                      {lote.observacoes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Total: <strong>{lotes.length}</strong> lote(s) cadastrado(s)
          </div>
        </Card>
      ) : (
        <Card title="Tabela de Lotes">
          <div className="text-center py-8 text-gray-500">
            Nenhum lote cadastrado.
          </div>
        </Card>
      )}
    </div>
  );
}
