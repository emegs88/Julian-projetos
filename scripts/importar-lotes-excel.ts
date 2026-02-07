/**
 * Script para importar lotes de um arquivo Excel/CSV
 * 
 * USO:
 * 1. Coloque o arquivo Excel na pasta /public/
 * 2. Execute: npx ts-node scripts/importar-lotes-excel.ts
 * 3. O script gerará o arquivo data/promissao-lotes.ts atualizado
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface LoteRow {
  id?: string;
  matricula?: string;
  area?: number;
  valorMercado?: number;
  valorVendaForcada?: number;
  observacoes?: string;
}

function processarExcel(caminhoArquivo: string): LoteRow[] {
  const workbook = XLSX.readFile(caminhoArquivo);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const dados = XLSX.utils.sheet_to_json(worksheet);

  return dados.map((row: any, index: number) => {
    // Mapear colunas (ajustar conforme necessário)
    const id = row['ID'] || row['id'] || row['Lote'] || `LOTE-${String(index + 1).padStart(3, '0')}`;
    const matricula = row['Matrícula'] || row['matricula'] || row['Matricula'] || '';
    const area = parseFloat(row['Área'] || row['area'] || row['Area'] || '0');
    const valorMercado = parseFloat(
      String(row['Valor Mercado'] || row['valorMercado'] || row['ValorMercado'] || '0')
        .replace(/[^\d,.-]/g, '')
        .replace(',', '.')
    );
    const valorVendaForcada = parseFloat(
      String(row['Valor Venda Forçada'] || row['valorVendaForcada'] || row['ValorVendaForcada'] || '0')
        .replace(/[^\d,.-]/g, '')
        .replace(',', '.')
    );
    const observacoes = row['Observações'] || row['observacoes'] || row['Observacoes'] || '';

    return {
      id,
      matricula,
      area,
      valorMercado,
      valorVendaForcada,
      observacoes,
    };
  });
}

function gerarArquivoTypeScript(lotes: LoteRow[]): string {
  const header = `/**
 * Dados específicos dos lotes do empreendimento Cidade Jardim - Promissão/SP
 * Dados reais importados do Excel
 * Total: ${lotes.length} lotes
 * Gerado automaticamente em ${new Date().toLocaleString('pt-BR')}
 */

import { Lote } from '@/types';

export const lotesPromissao: Lote[] = [
`;

  const lotesCode = lotes
    .map((lote) => {
      return `  { id: '${lote.id}', matricula: '${lote.matricula}', area: ${lote.area}, valorMercado: ${lote.valorMercado}, valorVendaForcada: ${lote.valorVendaForcada}, observacoes: '${lote.observacoes || ''}' },`;
    })
    .join('\n');

  const estatisticas = `
// Estatísticas do empreendimento
export const estatisticasPromissao = {
  totalLotes: ${lotes.length},
  lotesResidenciais: ${lotes.filter((l) => !l.id?.includes('RC')).length},
  lotesResComercial: ${lotes.filter((l) => l.id?.includes('RC')).length},
  areaTotal: ${lotes.reduce((sum, l) => sum + (l.area || 0), 0).toFixed(2)},
  valorTotalMercado: lotesPromissao.reduce((sum, l) => sum + l.valorMercado, 0),
  valorTotalVendaForcada: lotesPromissao.reduce((sum, l) => sum + l.valorVendaForcada, 0),
  valorMedioMercado: lotesPromissao.reduce((sum, l) => sum + l.valorMercado, 0) / lotesPromissao.length,
  areaMedia: lotesPromissao.reduce((sum, l) => sum + l.area, 0) / lotesPromissao.length,
};

// Informações do empreendimento
export const empreendimentoPromissao = {
  nome: 'Cidade Jardim',
  cidade: 'Promissão',
  uf: 'SP',
  status: 'Aprovado',
  matricula: '13.410 – CRI Promissão',
  areaTotal: ${lotes.reduce((sum, l) => sum + (l.area || 0), 0).toFixed(2)},
  quantidadeLotesTotal: ${lotes.length},
  quantidadeLotesResidenciais: ${lotes.filter((l) => !l.id?.includes('RC')).length},
  quantidadeLotesResCom: ${lotes.filter((l) => l.id?.includes('RC')).length},
  localizacao: 'Promissão/SP',
  registro: '13.410',
  tipo: 'Loteamento Residencial e Residencial/Comercial',
  fase: 'Fase 1 - Aprovada',
};
`;

  return header + lotesCode + '\n];\n' + estatisticas;
}

// Executar
const arquivoExcel = process.argv[2] || path.join(__dirname, '../public/lotes-promissao.xlsx');

if (!fs.existsSync(arquivoExcel)) {
  console.error(`❌ Arquivo não encontrado: ${arquivoExcel}`);
  console.log('\n📋 Como usar:');
  console.log('1. Coloque o arquivo Excel na pasta /public/ com o nome "lotes-promissao.xlsx"');
  console.log('2. Ou execute: npx ts-node scripts/importar-lotes-excel.ts <caminho-do-arquivo>');
  console.log('\n📊 Formato esperado do Excel:');
  console.log('- Colunas: ID, Matrícula, Área, Valor Mercado, Valor Venda Forçada, Observações');
  process.exit(1);
}

try {
  console.log(`📂 Lendo arquivo: ${arquivoExcel}`);
  const lotes = processarExcel(arquivoExcel);
  console.log(`✅ ${lotes.length} lotes encontrados`);

  const arquivoSaida = path.join(__dirname, '../data/promissao-lotes.ts');
  const codigo = gerarArquivoTypeScript(lotes);
  
  fs.writeFileSync(arquivoSaida, codigo, 'utf-8');
  console.log(`✅ Arquivo gerado: ${arquivoSaida}`);
  console.log(`\n📊 Estatísticas:`);
  console.log(`- Total de lotes: ${lotes.length}`);
  console.log(`- Lotes residenciais: ${lotes.filter((l) => !l.id?.includes('RC')).length}`);
  console.log(`- Lotes res/comercial: ${lotes.filter((l) => l.id?.includes('RC')).length}`);
  console.log(`- Área total: ${lotes.reduce((sum, l) => sum + (l.area || 0), 0).toFixed(2)} m²`);
  console.log(`\n🎉 Dados importados com sucesso!`);
} catch (error) {
  console.error('❌ Erro ao processar:', error);
  process.exit(1);
}
