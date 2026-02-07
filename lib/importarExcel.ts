import * as XLSX from 'xlsx';
import { Lote } from '@/types';
import { parseBRLToNumber, safeNumber, normalizeHeader, mapColumnName, validateLote, calculateVendaForcada } from '@/lib/parsing';

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
 * Converte valor do Excel para número (usando parsing robusto)
 */
function parseValor(valor: any): number {
  if (typeof valor === 'number') {
    return safeNumber(valor, 0);
  }
  if (typeof valor === 'string') {
    return parseBRLToNumber(valor);
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
        
        // Primeira linha são os cabeçalhos - usar normalização robusta
        const cabecalhos = dados[0].map((h: any) => String(h || '').trim());
        const cabecalhosNormalizados = cabecalhos.map(normalizeHeader);
        
        // Encontrar índices das colunas usando mapeamento inteligente
        const encontrarIndice = (nomePadrao: string, fallbackKeywords: string[]): number => {
          // Tentar mapeamento fornecido primeiro
          if (mapeamentoFinal[nomePadrao as keyof MapeamentoColunas]) {
            const coluna = mapeamentoFinal[nomePadrao as keyof MapeamentoColunas];
            if (coluna) {
              const indice = XLSX.utils.decode_col(coluna);
              if (indice >= 0) return indice;
            }
          }
          
          // Tentar mapeamento automático
          for (let i = 0; i < cabecalhosNormalizados.length; i++) {
            const mapped = mapColumnName(cabecalhos[i]);
            if (mapped === nomePadrao) {
              return i;
            }
          }
          
          // Fallback: buscar por palavras-chave
          for (let i = 0; i < cabecalhosNormalizados.length; i++) {
            const header = cabecalhosNormalizados[i];
            if (fallbackKeywords.some(keyword => header.includes(normalizeHeader(keyword)))) {
              return i;
            }
          }
          
          return -1;
        };
        
        const indiceId = encontrarIndice('id', ['id', 'lote', 'codigo', 'numero']);
        const indiceMatricula = encontrarIndice('matricula', ['matricula', 'registro', 'mat']);
        const indiceArea = encontrarIndice('area', ['area', 'm2', 'metros']);
        const indiceValorMercado = encontrarIndice('valor_mercado', ['mercado', 'avaliacao', 'valor']);
        const indiceVendaForcada = encontrarIndice('valor_venda_forcada', ['venda_forcada', 'forcada', 'vf']);
        const indiceObservacoes = encontrarIndice('observacoes', ['obs', 'observacao', 'nota']);
        
        const lotes: Lote[] = [];
        
        // Processar linhas de dados (pular cabeçalho e linhas vazias)
        let linhasValidas = 0;
        let linhasIgnoradas = 0;
        const erros: string[] = [];
        
        for (let i = 1; i < dados.length; i++) {
          const linha = dados[i];
          
          // Pular linhas completamente vazias
          if (!linha || linha.every((cell: any) => !cell || String(cell).trim() === '')) {
            continue;
          }
          
          const id = indiceId >= 0 ? String(linha[indiceId] || '').trim() : `LOTE-${String(i).padStart(3, '0')}`;
          const matricula = indiceMatricula >= 0 ? String(linha[indiceMatricula] || '').trim() : '';
          const area = indiceArea >= 0 ? parseValor(linha[indiceArea]) : 0;
          const valorMercado = indiceValorMercado >= 0 ? parseValor(linha[indiceValorMercado]) : 0;
          const valorVendaForcadaRaw = indiceVendaForcada >= 0 ? parseValor(linha[indiceVendaForcada]) : null;
          const valorVendaForcada = calculateVendaForcada(valorMercado, valorVendaForcadaRaw, percentualVendaForcada / 100);
          const observacoes = indiceObservacoes >= 0 ? String(linha[indiceObservacoes] || '').trim() : '';
          
          // Validar lote usando função robusta
          const validacao = validateLote({ valorMercado, valorVendaForcada });
          
          if (!validacao.valid) {
            linhasIgnoradas++;
            erros.push(`Linha ${i + 1} (ID: ${id}): ${validacao.error}`);
            continue;
          }
          
          // Validar dados mínimos adicionais
          if (!id || id === 'LOTE-000' || area <= 0) {
            linhasIgnoradas++;
            erros.push(`Linha ${i + 1}: ID ou área inválidos`);
            continue;
          }
          
          lotes.push({
            id,
            matricula: matricula || '',
            area: safeNumber(area, 0),
            valorMercado: safeNumber(valorMercado, 0),
            valorVendaForcada: safeNumber(valorVendaForcada, 0),
            observacoes: observacoes || '',
          });
          
          linhasValidas++;
        }
        
        // Log de avisos (sem quebrar a importação)
        if (linhasIgnoradas > 0) {
          console.warn(`Importação: ${linhasIgnoradas} linha(s) ignorada(s)`, erros);
        }
        
        if (lotes.length === 0) {
          reject(new Error('Nenhum lote válido foi encontrado no arquivo. Verifique os dados.'));
          return;
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
