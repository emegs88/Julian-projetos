'use client';

import { useMemo } from 'react';
import { useSimuladorStore } from '@/store/useSimuladorStore';
import { Card } from '@/components/ui/Card';
import { calcularLimiteSaldo } from '@/lib/calculos';
import { formatBRL } from '@/lib/utils';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export function PoolGlobal() {
  const {
    lotes,
    veiculos,
    garantia,
    calculos,
  } = useSimuladorStore();

  // Calcular Pool Global
  const poolGlobal = useMemo(() => {
    // Pool Lotes
    const lotesSelecionados = lotes.filter((l) => garantia.lotesSelecionados.includes(l.id));
    const poolLotes = lotesSelecionados.reduce((sum, l) => {
      const valor = garantia.criterioAvaliacao === 'mercado' ? l.valorMercado : l.valorVendaForcada;
      return sum + valor;
    }, 0);

    // Pool Veículos (FIPE * 1.30)
    const veiculosIncluidos = garantia.usarVeiculos
      ? veiculos.filter((v) => garantia.veiculosSelecionados.includes(v.id))
      : [];
    const poolVeiculos = veiculosIncluidos.reduce((sum, v) => sum + v.valorGarantia, 0);

    // Pool Total
    const poolTotal = poolLotes + poolVeiculos;

    // Limite
    const limite = calcularLimiteSaldo(poolTotal, garantia.ltvMaximo);

    // Saldo Pico
    const saldoPico = calculos?.saldoPico || 0;

    // Folga
    const folga = limite - saldoPico;

    // Status
    const percentualCobertura = limite > 0 ? (saldoPico / limite) * 100 : 0;
    const status = saldoPico > limite
      ? { cor: 'vermelho', texto: 'INSUFICIENTE', icon: XCircle }
      : percentualCobertura >= 95
        ? { cor: 'amarelo', texto: 'ATENÇÃO', icon: AlertTriangle }
        : { cor: 'verde', texto: 'SEGURO', icon: CheckCircle };

    return {
      poolLotes,
      poolVeiculos,
      poolTotal,
      limite,
      saldoPico,
      folga,
      status,
      percentualCobertura,
      quantidadeLotes: lotesSelecionados.length,
      quantidadeVeiculos: veiculosIncluidos.length,
    };
  }, [lotes, veiculos, garantia, calculos]);

  const StatusIcon = poolGlobal.status.icon;

  return (
    <Card title="POOL GLOBAL" className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-400">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
          <p className="text-sm text-gray-600 mb-1">Garantia Lotes</p>
          <p className="text-2xl font-bold text-blue-700">{formatBRL(poolGlobal.poolLotes)}</p>
          <p className="text-xs text-gray-500 mt-1">{poolGlobal.quantidadeLotes} lote(s)</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border-2 border-green-300">
          <p className="text-sm text-gray-600 mb-1">Garantia Veículos</p>
          <p className="text-2xl font-bold text-green-700">{formatBRL(poolGlobal.poolVeiculos)}</p>
          <p className="text-xs text-gray-500 mt-1">{poolGlobal.quantidadeVeiculos} veículo(s)</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border-2 border-primary">
          <p className="text-sm text-gray-600 mb-1">Garantia Total</p>
          <p className="text-3xl font-bold text-primary">{formatBRL(poolGlobal.poolTotal)}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
          <p className="text-sm text-gray-600 mb-1">Limite (LTV {garantia.ltvMaximo}%)</p>
          <p className="text-2xl font-bold text-purple-700">{formatBRL(poolGlobal.limite)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
          <p className="text-sm text-gray-600 mb-1">Saldo Pico</p>
          <p className="text-2xl font-bold text-red-700">{formatBRL(poolGlobal.saldoPico)}</p>
          <p className="text-xs text-gray-500 mt-1">Mês {calculos?.mesSaldoPico || 0}</p>
        </div>
        
        <div className={`p-4 rounded-lg border-2 ${
          poolGlobal.folga > 0 
            ? 'bg-green-50 border-green-300' 
            : 'bg-red-50 border-red-300'
        }`}>
          <p className="text-sm text-gray-600 mb-1">Folga</p>
          <p className={`text-2xl font-bold ${
            poolGlobal.folga > 0 ? 'text-green-700' : 'text-red-700'
          }`}>
            {formatBRL(poolGlobal.folga)}
          </p>
        </div>
        
        <div className={`p-6 rounded-lg border-2 text-center ${
          poolGlobal.status.cor === 'verde' 
            ? 'bg-green-50 border-green-400' 
            : poolGlobal.status.cor === 'amarelo'
              ? 'bg-yellow-50 border-yellow-400'
              : 'bg-red-50 border-red-400'
        }`}>
          <p className="text-sm text-gray-600 mb-2">STATUS</p>
          <StatusIcon className={`w-8 h-8 mx-auto mb-2 ${
            poolGlobal.status.cor === 'verde' 
              ? 'text-green-700' 
              : poolGlobal.status.cor === 'amarelo'
                ? 'text-yellow-700'
                : 'text-red-700'
          }`} />
          <p className={`text-2xl font-bold ${
            poolGlobal.status.cor === 'verde' 
              ? 'text-green-700' 
              : poolGlobal.status.cor === 'amarelo'
                ? 'text-yellow-700'
                : 'text-red-700'
          }`}>
            {poolGlobal.status.texto}
          </p>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="bg-gray-200 rounded-full h-6 overflow-hidden relative">
        <div
          className={`h-full transition-all duration-500 ${
            poolGlobal.status.cor === 'verde' 
              ? 'bg-green-500' 
              : poolGlobal.status.cor === 'amarelo'
                ? 'bg-yellow-500'
                : 'bg-red-500'
          }`}
          style={{ width: `${Math.min(100, poolGlobal.percentualCobertura)}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-800">
            Cobertura: {poolGlobal.percentualCobertura.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Alerta se necessário */}
      {poolGlobal.saldoPico > poolGlobal.limite && (
        <div className="mt-4 p-4 bg-red-100 border-2 border-red-400 rounded-lg">
          <p className="font-semibold text-red-800 mb-1">⚠️ Garantia Insuficiente</p>
          <p className="text-sm text-red-700">
            Faltam <strong>{formatBRL(poolGlobal.saldoPico - poolGlobal.limite)}</strong> em garantia.
            Sugestão: adicionar mais lotes ou veículos ao pool.
          </p>
        </div>
      )}
    </Card>
  );
}
