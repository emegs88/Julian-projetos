'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSimuladorStore } from '@/store/useSimuladorStore';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { formatBRL, formatNumber } from '@/lib/utils';

export function AbaEmpreendimento() {
  const { empreendimento, lotes } = useSimuladorStore();
  const [quantidadeLotes, setQuantidadeLotes] = useState<number>(lotes.length);

  // Calcular somas totais baseadas no total de 226 lotes
  // Usar valores médios dos lotes carregados e multiplicar por 226
  const somaTotal = useMemo(() => {
    if (lotes.length === 0) {
      return {
        valorMercado: 0,
        valorVendaForcada: 0,
        area: 0,
      };
    }
    
    // Calcular valores médios dos lotes carregados
    const valorMedioMercado = lotes.reduce((sum, l) => sum + l.valorMercado, 0) / lotes.length;
    const valorMedioVendaForcada = lotes.reduce((sum, l) => sum + l.valorVendaForcada, 0) / lotes.length;
    const areaMedia = lotes.reduce((sum, l) => sum + l.area, 0) / lotes.length;
    
    // Multiplicar pelos 226 lotes totais
    const totalLotes = empreendimento.quantidadeLotesTotal || 226;
    return {
      valorMercado: valorMedioMercado * totalLotes,
      valorVendaForcada: valorMedioVendaForcada * totalLotes,
      area: areaMedia * totalLotes,
    };
  }, [lotes, empreendimento.quantidadeLotesTotal]);

  // Sincronizar quantidade inicial quando lotes mudarem
  useEffect(() => {
    if (quantidadeLotes > lotes.length) {
      setQuantidadeLotes(lotes.length);
    }
  }, [lotes.length, quantidadeLotes]);

  // Filtrar lotes baseado na quantidade selecionada
  const lotesExibidos = useMemo(() => {
    return lotes.slice(0, quantidadeLotes);
  }, [lotes, quantidadeLotes]);

  return (
    <div className="space-y-6">
      {/* Card Fixo: Dados do Empreendimento (Somente Visual) */}
      <Card title="Empreendimento: Cidade Jardim - Promissão/SP" className="bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
            <p className="text-sm text-gray-600 mb-1">Nome</p>
            <p className="text-xl font-bold text-gray-900">{empreendimento.nome}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
            <p className="text-sm text-gray-600 mb-1">Localização</p>
            <p className="text-xl font-bold text-gray-900">{empreendimento.cidade}/{empreendimento.uf}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
            <p className="text-sm text-gray-600 mb-1">Matrícula</p>
            <p className="text-xl font-bold text-gray-900">{empreendimento.matricula}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <p className="text-xl font-bold text-green-600">{empreendimento.status}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
            <p className="text-sm text-gray-600 mb-1">Área Total</p>
            <p className="text-xl font-bold text-gray-900">{formatNumber(empreendimento.areaTotal, 2)} m²</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
            <p className="text-sm text-gray-600 mb-1">Total de Lotes</p>
            <p className="text-xl font-bold text-gray-900">{empreendimento.quantidadeLotesTotal}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
            <p className="text-sm text-gray-600 mb-1">Lotes Residenciais</p>
            <p className="text-xl font-bold text-gray-900">{empreendimento.quantidadeLotesResidenciais}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
            <p className="text-sm text-gray-600 mb-1">Lotes Res/Com</p>
            <p className="text-xl font-bold text-gray-900">{empreendimento.quantidadeLotesResCom}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-300">
          <p className="text-xs text-gray-500 italic">
            * Dados fixos do empreendimento - não editáveis
          </p>
        </div>
      </Card>
      
      {/* Resumo Total dos Lotes */}
      <Card title="Resumo Total dos Lotes">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
            <p className="text-sm text-gray-600 mb-1">Valor Total Mercado</p>
            <p className="text-2xl font-bold text-gray-900">{formatBRL(somaTotal.valorMercado)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
            <p className="text-sm text-gray-600 mb-1">Valor Total Venda Forçada</p>
            <p className="text-2xl font-bold text-gray-900">{formatBRL(somaTotal.valorVendaForcada)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
            <p className="text-sm text-gray-600 mb-1">Área Total</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(somaTotal.area, 2)} m²</p>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Total de Lotes:</strong> {empreendimento.quantidadeLotesTotal || 226} lote(s) cadastrado(s)
          </p>
          {lotes.length < (empreendimento.quantidadeLotesTotal || 226) && (
            <p className="text-xs text-gray-500 mt-1">
              (Exibindo {lotes.length} lote(s) de exemplo para visualização)
            </p>
          )}
        </div>
      </Card>

      {/* Seletor de Quantidade de Lotes */}
      <Card title="Visualização de Lotes">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Quantidade de Lotes a Exibir:
            </label>
            <Input
              type="number"
              min="1"
              max={lotes.length}
              value={quantidadeLotes.toString()}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value >= 1 && value <= lotes.length) {
                  setQuantidadeLotes(value);
                } else if (e.target.value === '') {
                  setQuantidadeLotes(1);
                }
              }}
              className="w-32"
            />
            <span className="text-sm text-gray-500">
              de {lotes.length} lotes disponíveis
            </span>
          </div>
        </div>
      </Card>


      {lotesExibidos.length > 0 ? (
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
                {lotesExibidos.map((lote) => (
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
            Exibindo <strong>{lotesExibidos.length}</strong> de <strong>{lotes.length}</strong> lote(s) de exemplo
            {empreendimento.quantidadeLotesTotal && empreendimento.quantidadeLotesTotal > lotes.length && (
              <span className="text-gray-500"> (Total: {empreendimento.quantidadeLotesTotal} lotes)</span>
            )}
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
