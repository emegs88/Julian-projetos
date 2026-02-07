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
import { importarLotesExcel } from '@/lib/importarExcel';
import { Upload, FileSpreadsheet } from 'lucide-react';

export function AbaEmpreendimento() {
  const { empreendimento, lotes, setEmpreendimento, setLotes } = useSimuladorStore();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setUploadError('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
      return;
    }
    
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    
    try {
      const { lotes: lotesImportados } = await importarLotesExcel(file, undefined, 70);
      setLotes(lotesImportados);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao importar Excel:', error);
      setUploadError(error instanceof Error ? error.message : 'Erro ao importar o arquivo Excel');
    } finally {
      setUploading(false);
    }
  };

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
      
      {/* Importação Excel - Atualizar Avaliação */}
      <Card title="Atualizar Avaliação de Lotes">
        <div className="space-y-4">
          <Alert variant="info">
            Carregue o arquivo Excel "Avaliação Lote Promissão - Lotes.xlsx" para atualizar os dados de avaliação dos lotes.
            Os dados serão usados automaticamente na aba Garantias.
          </Alert>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-dark transition-colors">
              <Upload className="w-5 h-5" />
              <span className="font-medium">Selecionar Arquivo Excel</span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            
            {uploading && (
              <div className="text-sm text-gray-600">
                <span className="animate-pulse">Importando...</span>
              </div>
            )}
            
            {uploadSuccess && (
              <div className="text-sm text-green-600 font-semibold">
                ✅ {lotes.length} lote(s) atualizado(s) com sucesso!
              </div>
            )}
          </div>
          
          {uploadError && (
            <Alert variant="error">
              <p className="font-semibold">Erro ao importar:</p>
              <p className="text-sm">{uploadError}</p>
            </Alert>
          )}
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
