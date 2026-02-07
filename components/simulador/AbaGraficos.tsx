'use client';

import { useSimuladorStore } from '@/store/useSimuladorStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Download, FileText } from 'lucide-react';
import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatBRL } from '@/lib/utils';

export function AbaGraficos() {
  const { calculos, estrutura } = useSimuladorStore();

  if (!calculos) {
    return (
      <Card>
        <Alert variant="info">
          Calcule a operação primeiro para visualizar os gráficos.
        </Alert>
      </Card>
    );
  }

  // Preparar dados para gráficos
  const dadosFluxoCaixa = calculos.fluxoCaixa.map((fc) => ({
    mes: `M${fc.mes}`,
    entrada: fc.entrada,
    saida: Math.abs(fc.saida),
    saldo: fc.saldo,
  }));

  const dadosSaldoDevedor = calculos.cronograma.map((c) => ({
    mes: `M${c.mes}`,
    saldoDevedor: c.saldoDevedor,
    limite: calculos.limiteSaldo,
  }));


  const handleExportPDF = async () => {
    if (typeof window === 'undefined') return;
    
    const element = document.getElementById('relatorio-completo');
    if (!element) return;

    // Dynamic import
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
      import('jspdf'),
      import('html2canvas'),
    ]);

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('relatorio-captacao.pdf');
  };

  const handleExportCSV = () => {
    const headers = ['Mês', 'Saldo Devedor', 'Parcela', 'Juros', 'Amortização'];
    const rows = calculos.cronograma.map((c) => [
      c.mes,
      c.saldoDevedor.toFixed(2),
      c.parcela.toFixed(2),
      c.juros.toFixed(2),
      c.amortizacao.toFixed(2),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cronograma.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
        <Button onClick={handleExportPDF}>
          <FileText className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      <Card title="Fluxo de Caixa">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dadosFluxoCaixa}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatBRL(value)} />
            <Legend />
            <Bar dataKey="entrada" fill="#22c55e" name="Entrada" />
            <Bar dataKey="saida" fill="#ef4444" name="Saída" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Saldo Devedor vs Limite LTV">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dadosSaldoDevedor}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatBRL(value)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="saldoDevedor"
              stroke="#ef4444"
              strokeWidth={2}
              name="Saldo Devedor"
            />
            <Line
              type="monotone"
              dataKey="limite"
              stroke="#22c55e"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Limite LTV"
            />
          </LineChart>
        </ResponsiveContainer>
        {!calculos.dentroLimiteLTV && (
          <Alert variant="error" className="mt-4">
            O saldo devedor excede o limite LTV em alguns períodos.
          </Alert>
        )}
      </Card>

      <Card title="Gráficos e Alertas (Saldo x Garantia / LTV)">
        <div className="space-y-4">
          <Alert variant="info">
            Visualize a relação entre saldo devedor e garantia disponível, com alertas automáticos quando o LTV é excedido.
          </Alert>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Saldo Pico</p>
              <p className="text-2xl font-bold text-primary">{formatBRL(calculos.saldoPico)}</p>
              <p className="text-xs text-gray-500 mt-1">Mês {calculos.mesSaldoPico}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Limite Pool</p>
              <p className="text-2xl font-bold">{formatBRL(calculos.limiteSaldo)}</p>
              <p className="text-xs text-gray-500 mt-1">LTV: {calculos.valorGarantia > 0 ? ((calculos.saldoPico / calculos.valorGarantia) * 100).toFixed(2) : 0}%</p>
            </div>
          </div>
          {!calculos.dentroLimiteLTV && (
            <Alert variant="error">
              <p className="font-semibold">⚠️ Alerta: Saldo Pico excede o Limite Pool</p>
              <p className="text-sm mt-1">
                Faltam {formatBRL(calculos.saldoPico - calculos.limiteSaldo)} de garantia. 
                Selecione mais {calculos.quantidadeMinimaMatriculas} matrícula(s) ou aumente o valor da garantia.
              </p>
            </Alert>
          )}
        </div>
      </Card>

      {/* Relatório completo (oculto, usado para PDF) */}
      <div id="relatorio-completo" className="hidden">
        <div className="p-8 bg-white">
          <h1 className="text-3xl font-bold mb-4 text-center">Relatório Interno - Portal Captação</h1>
          <div className="space-y-6">
            {/* Dados do Empreendimento */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-bold mb-2">Empreendimento</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p><strong>Nome:</strong> Cidade Jardim</p>
                <p><strong>Localização:</strong> Promissão/SP</p>
                <p><strong>Matrícula:</strong> 13.410</p>
                <p><strong>Área Total:</strong> 84.579,51 m²</p>
                <p><strong>Total de Lotes:</strong> 226 (219 res + 7 mistos)</p>
              </div>
            </div>
            
            {/* Resumo da Operação */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-bold mb-2">Resumo da Operação</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p><strong>Crédito:</strong> {formatBRL(estrutura.credito)}</p>
                <p><strong>Valor Líquido:</strong> {formatBRL(calculos.valorLiquido)}</p>
                <p><strong>Saldo Pico:</strong> {formatBRL(calculos.saldoPico)}</p>
                <p><strong>Mês do Saldo Pico:</strong> {calculos.mesSaldoPico}</p>
                <p><strong>CET Mensal:</strong> {(calculos.cetMensal * 100).toFixed(4)}%</p>
                <p><strong>CET Anual:</strong> {(calculos.cetAnual * 100).toFixed(2)}%</p>
              </div>
            </div>
            
            {/* Pool Global */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-bold mb-2">Pool Global de Garantia</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p><strong>Garantia Lotes:</strong> {formatBRL(calculos.valorGarantia)}</p>
                <p><strong>Garantia Veículos:</strong> {formatBRL(0)}</p>
                <p><strong>Garantia Total:</strong> {formatBRL(calculos.valorGarantia)}</p>
                <p><strong>Limite LTV:</strong> {formatBRL(calculos.limiteSaldo)}</p>
                <p><strong>Folga:</strong> {formatBRL(calculos.limiteSaldo - calculos.saldoPico)}</p>
                <p><strong>Status:</strong> {calculos.dentroLimiteLTV ? 'SEGURO' : 'INSUFICIENTE'}</p>
              </div>
            </div>
            
            {/* Garantias Selecionadas */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-bold mb-2">Garantias Selecionadas</h2>
              <p className="text-sm text-gray-600">Lotes e veículos incluídos no pool de garantia</p>
            </div>
            
            {/* Gráficos serão capturados via html2canvas */}
          </div>
        </div>
      </div>
    </div>
  );
}
