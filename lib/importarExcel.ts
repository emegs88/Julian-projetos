import * as XLSX from 'xlsx';
import { Lote } from '@/types';

export interface MapeamentoColunas {
  id?: string;
  matricula?: string;
  area?: string;
  valorMercado?: string;
  valorVendaForcada?: string;
  observacoes?: string;
}

/**
 * Detecta automaticamente as colunas do Excel
 */
export function detectarColunas(worksheet: XLSX.WorkSheet): MapeamentoColunas {
  const primeiraLinha = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })[0] as string[];
  
  const mapeamento: MapeamentoColunas = {};
  
  primeiraLinha.forEach((coluna, index) => {
    const colunaLower = coluna.toLowerCase().trim();
    const letra = XLSX.utils.encode_col(index);
    
    // Detectar ID
    if (!mapeamento.id && (colunaLower.includes('id') || colunaLower.includes('lote') || colunaLower.includes('código'))) {
      mapeamento.id = letra;
    }
    
    // Detectar Matrícula
    if (!mapeamento.matricula && (colunaLower.includes('matrícula') || colunaLower.includes('matricula') || colunaLower.includes('registro'))) {
      mapeamento.matricula = letra;
    }
    
    // Detectar Área
    if (!mapeamento.area && (colunaLower.includes('área') || colunaLower.includes('area') || colunaLower.includes('m²') || colunaLower.includes('m2'))) {
      mapeamento.area = letra;
    }
    
    // Detectar Valor Mercado
    if (!mapeamento.valorMercado && (colunaLower.includes('mercado') || colunaLower.includes('valor mercado') || colunaLower.includes('avaliação') || colunaLower.includes('avaliacao'))) {
      mapeamento.valorMercado = letra;
    }
    
    // Detectar Venda Forçada
    if (!mapeamento.valorVendaForcada && (colunaLower.includes('venda forçada') || colunaLower.includes('venda forcada') || colunaLower.includes('forçada') || colunaLower.includes('forcada'))) {
      mapeamento.valorVendaForcada = letra;
    }
    
    // Detectar Observações
    if (!mapeamento.observacoes && (colunaLower.includes('obs') || colunaLower.includes('observação') || colunaLower.includes('observacao') || colunaLower.includes('nota'))) {
      mapeamento.observacoes = letra;
    }
  });
  
  return mapeamento;
}

/**
 * Converte valor do Excel para número
 */
function parseValor(valor: any): number {
  if (typeof valor === 'number') return valor;
  if (typeof valor === 'string') {
    // Remove formatação BR (R$, pontos, vírgulas)
    const limpo = valor
      .replace(/R\$/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim();
    return parseFloat(limpo) || 0;
  }
  return 0;
}

/**
 * Importa lotes do Excel
 */
export function importarLotesExcel(
  file: File,
  mapeamento?: MapeamentoColunas,
  percentualVendaForcada: number = 70
): Promise<{ lotes: Lote[]; mapeamento: MapeamentoColunas }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Erro ao ler o arquivo'));
          return;
        }
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const primeiraAba = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[primeiraAba];
        
        // Detectar colunas se não fornecido
        const mapeamentoFinal = mapeamento || detectarColunas(worksheet);
        
        // Converter para JSON - usar primeira linha como cabeçalho
        const dados = XLSX.utils.sheet_to_json(worksheet, { defval: '', header: 1 }) as any[][];
        
        if (dados.length < 2) {
          reject(new Error('O arquivo Excel está vazio ou não contém dados'));
          return;
        }
        
        // Primeira linha são os cabeçalhos
        const cabecalhos = dados[0].map((h: any) => String(h || '').toLowerCase().trim());
        
        // Encontrar índices das colunas
        const indiceId = mapeamentoFinal.id 
          ? parseInt(mapeamentoFinal.id)
          : cabecalhos.findIndex((h: string) => h.includes('id') || h.includes('lote') || h.includes('código'));
        const indiceMatricula = mapeamentoFinal.matricula
          ? parseInt(mapeamentoFinal.matricula)
          : cabecalhos.findIndex((h: string) => h.includes('matrícula') || h.includes('matricula') || h.includes('registro'));
        const indiceArea = mapeamentoFinal.area
          ? parseInt(mapeamentoFinal.area)
          : cabecalhos.findIndex((h: string) => h.includes('área') || h.includes('area') || h.includes('m²'));
        const indiceValorMercado = mapeamentoFinal.valorMercado
          ? parseInt(mapeamentoFinal.valorMercado)
          : cabecalhos.findIndex((h: string) => h.includes('mercado') || h.includes('avaliação') || h.includes('avaliacao'));
        const indiceVendaForcada = mapeamentoFinal.valorVendaForcada
          ? parseInt(mapeamentoFinal.valorVendaForcada)
          : cabecalhos.findIndex((h: string) => h.includes('venda forçada') || h.includes('venda forcada') || h.includes('forçada'));
        const indiceObservacoes = mapeamentoFinal.observacoes
          ? parseInt(mapeamentoFinal.observacoes)
          : cabecalhos.findIndex((h: string) => h.includes('obs') || h.includes('observação') || h.includes('observacao'));
        
        const lotes: Lote[] = [];
        
        // Processar linhas de dados (pular cabeçalho)
        for (let i = 1; i < dados.length; i++) {
          const linha = dados[i];
          
          const id = indiceId >= 0 ? linha[indiceId] : `LOTE-${i}`;
          const matricula = indiceMatricula >= 0 ? linha[indiceMatricula] : '';
          const area = indiceArea >= 0 ? parseValor(linha[indiceArea]) : 0;
          const valorMercado = indiceValorMercado >= 0 ? parseValor(linha[indiceValorMercado]) : 0;
          const valorVendaForcada = indiceVendaForcada >= 0 
            ? parseValor(linha[indiceVendaForcada])
            : valorMercado * (percentualVendaForcada / 100);
          const observacoes = indiceObservacoes >= 0 ? String(linha[indiceObservacoes] || '') : '';
          
          // Validar dados mínimos
          if (!id || area <= 0 || valorMercado <= 0) {
            continue; // Pular linha inválida
          }
          
          lotes.push({
            id: String(id).trim(),
            matricula: String(matricula || '').trim(),
            area,
            valorMercado,
            valorVendaForcada,
            observacoes: observacoes || undefined,
          });
        }
        
        resolve({ lotes, mapeamento: mapeamentoFinal });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'));
    };
    
    reader.readAsBinaryString(file);
  });
}
