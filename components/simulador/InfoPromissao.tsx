'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { InputMoney } from '@/components/ui/InputMoney';
import { Button } from '@/components/ui/Button';
import { MapPin, Building2, FileText, CheckCircle, Filter, RefreshCw } from 'lucide-react';
import { empreendimentoPromissao, estatisticasPromissao } from '@/data/promissao-lotes';
import { useSimuladorStore } from '@/store/useSimuladorStore';
import { formatBRL, formatNumber } from '@/lib/utils';

export function InfoPromissao() {
  const { lotes, empreendimento, setEmpreendimento } = useSimuladorStore();
  
  // Estado local para quantidade de lotes e preço médio personalizados
  const [quantidadeLotesSelecionada, setQuantidadeLotesSelecionada] = useState(
    empreendimento.quantidadeLotesTotal || 226
  );
  const [precoMedioMercado, setPrecoMedioMercado] = useState(
    estatisticasPromissao.valorMedioMercado
  );
  const [precoMedioVendaForcada, setPrecoMedioVendaForcada] = useState(
    estatisticasPromissao.valorTotalVendaForcada / estatisticasPromissao.totalLotes
  );
  const [filtroAplicado, setFiltroAplicado] = useState(false);
  
  // Calcular valor total baseado nos valores selecionados
  const valorTotalGarantiaMercado = precoMedioMercado * quantidadeLotesSelecionada;
  const valorTotalGarantiaVendaForcada = precoMedioVendaForcada * quantidadeLotesSelecionada;
  
  // Calcular percentual de venda forçada baseado no mercado
  const percentualVendaForcada = precoMedioMercado > 0 
    ? (precoMedioVendaForcada / precoMedioMercado) * 100 
    : 0;
  
  const handleAplicarFiltro = () => {
    setFiltroAplicado(true);
    // Aqui você pode adicionar lógica adicional se necessário
    setTimeout(() => setFiltroAplicado(false), 2000);
  };
  
  return (
    <Card title="Empreendimento: Cidade Jardim - Promissão/SP" className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary mt-1" />
          <div>
            <p className="text-sm text-gray-600">Localização</p>
            <p className="font-semibold">{empreendimentoPromissao.localizacao}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-primary mt-1" />
          <div>
            <p className="text-sm text-gray-600">Matrícula/Registro</p>
            <p className="font-semibold">{empreendimentoPromissao.registro}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-semibold text-green-600">{empreendimentoPromissao.status}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 text-primary mt-1" />
          <div>
            <p className="text-sm text-gray-600">Tipo</p>
            <p className="font-semibold">{empreendimentoPromissao.tipo}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold mb-4">Estatísticas do Empreendimento</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Área Total</p>
            <p className="text-lg font-bold">{formatNumber(empreendimentoPromissao.areaTotal, 2)} m²</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total de Lotes</p>
            <p className="text-lg font-bold">{empreendimentoPromissao.quantidadeLotesTotal}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Lotes Residenciais</p>
            <p className="text-lg font-bold">{empreendimentoPromissao.quantidadeLotesResidenciais}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Lotes Res/Com</p>
            <p className="text-lg font-bold">{empreendimentoPromissao.quantidadeLotesResCom}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-lg">Cálculo de Garantia</h4>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setQuantidadeLotesSelecionada(empreendimentoPromissao.quantidadeLotesTotal);
                setPrecoMedioMercado(estatisticasPromissao.valorMedioMercado);
                setPrecoMedioVendaForcada(estatisticasPromissao.valorTotalVendaForcada / estatisticasPromissao.totalLotes);
              }}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Restaurar Padrão
            </Button>
          </div>
        </div>
        
        {/* Seletor de Quantidade e Preço Médio */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg mb-6 border-2 border-gray-300 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Quantidade de Lotes
              </label>
              <Input
                type="number"
                min="1"
                max={empreendimentoPromissao.quantidadeLotesTotal}
                value={quantidadeLotesSelecionada.toString()}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  const max = empreendimentoPromissao.quantidadeLotesTotal;
                  setQuantidadeLotesSelecionada(Math.min(Math.max(1, value), max));
                }}
                className="text-xl font-bold text-center"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Máximo: {empreendimentoPromissao.quantidadeLotesTotal} lotes
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Preço Médio por Lote (Mercado)
              </label>
              <InputMoney
                value={precoMedioMercado}
                onChange={setPrecoMedioMercado}
                className="text-xl font-bold"
              />
              <p className="text-xs text-gray-500 mt-2">
                Padrão: {formatBRL(estatisticasPromissao.valorMedioMercado)}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Preço Médio por Lote (Venda Forçada)
              </label>
              <InputMoney
                value={precoMedioVendaForcada}
                onChange={setPrecoMedioVendaForcada}
                className="text-xl font-bold"
              />
              <p className="text-xs text-gray-500 mt-2">
                {percentualVendaForcada.toFixed(1)}% do valor de mercado
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleAplicarFiltro}
              variant="primary"
              size="lg"
              className={`font-semibold px-8 transition-all ${
                filtroAplicado ? 'bg-green-600 hover:bg-green-700' : ''
              }`}
            >
              {filtroAplicado ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Filtro Aplicado!
                </>
              ) : (
                <>
                  <Filter className="w-5 h-5 mr-2" />
                  Aplicar Filtro
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-4">
          <h5 className="font-semibold text-gray-700 mb-3">Resumo dos Resultados</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Valor Médio por Lote</p>
              <p className="text-xl font-bold text-primary">{formatBRL(precoMedioMercado)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Área Média</p>
              <p className="text-xl font-bold">{formatNumber(estatisticasPromissao.areaMedia, 2)} m²</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Lotes Selecionados</p>
              <p className="text-xl font-bold">{quantidadeLotesSelecionada}</p>
              <p className="text-xs text-gray-500 mt-1">de {empreendimentoPromissao.quantidadeLotesTotal} totais</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-400 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Valor Total Garantia (Mercado)</p>
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  MERCADO
                </div>
              </div>
              <p className="text-3xl font-bold text-green-700 mb-3">{formatBRL(valorTotalGarantiaMercado)}</p>
              <div className="bg-white/70 p-3 rounded-lg">
                <p className="text-xs text-gray-700 font-medium">
                  {quantidadeLotesSelecionada} lotes × {formatBRL(precoMedioMercado)}
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-400 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Valor Total Garantia (Venda Forçada)</p>
                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  VENDA FORÇADA
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-700 mb-3">{formatBRL(valorTotalGarantiaVendaForcada)}</p>
              <div className="bg-white/70 p-3 rounded-lg">
                <p className="text-xs text-gray-700 font-medium">
                  {quantidadeLotesSelecionada} lotes × {formatBRL(precoMedioVendaForcada)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
