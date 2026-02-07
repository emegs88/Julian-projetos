'use client';

import { useSimuladorStore } from '@/store/useSimuladorStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { InputPercent } from '@/components/ui/InputPercent';
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
  const [cdiMensal, setCdiMensal] = useState(1.0);

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

  // Simulação CDI
  const simularCDI = () => {
    const parcela = estrutura.parcelaMensal;
    const prazo = estrutura.prazoTotal;
    const taxaMensal = cdiMensal / 100;
    let acumulado = 0;

    const resultado = [];
    for (let mes = 1; mes <= prazo; mes++) {
      acumulado = acumulado * (1 + taxaMensal) + parcela;
      resultado.push({
        mes: `M${mes}`,
        acumulado,
      });
    }
    return resultado;
  };

  const dadosCDI = simularCDI();

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

      <Card title="Comparação com CDI">
        <div className="mb-4">
          <InputPercent
            label="CDI Mensal (%)"
            value={cdiMensal}
            onChange={(value) => setCdiMensal(value)}
          />
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dadosCDI}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatBRL(value)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="acumulado"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Acumulado CDI"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-gray-600">
          <p>
            Simulação: Se você aplicasse o valor da parcela mensal ({formatBRL(estrutura.parcelaMensal)}) no CDI
            de {cdiMensal.toFixed(2)}% ao mês, teria acumulado{' '}
            {formatBRL(dadosCDI[dadosCDI.length - 1]?.acumulado || 0)} após {estrutura.prazoTotal} meses.
          </p>
        </div>
      </Card>

      {/* Relatório completo (oculto, usado para PDF) */}
      <div id="relatorio-completo" className="hidden">
        <div className="p-8 bg-white">
          <h1 className="text-3xl font-bold mb-4">Relatório de Captação</h1>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Resumo da Operação</h2>
              <p>Valor Líquido: {formatBRL(calculos.valorLiquido)}</p>
              <p>Saldo Pico: {formatBRL(calculos.saldoPico)} (Mês {calculos.mesSaldoPico})</p>
              <p>CET Anual: {calculos.cetAnual * 100}%</p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Garantias</h2>
              <p>Valor da Garantia: {formatBRL(calculos.valorGarantia)}</p>
              <p>Limite LTV: {formatBRL(calculos.limiteSaldo)}</p>
              <p>Dentro do Limite: {calculos.dentroLimiteLTV ? 'Sim' : 'Não'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
