import { NextRequest, NextResponse } from 'next/server';
import { veiculosCliente } from '@/data/veiculosCliente';
import { buscarCodigoFipe } from '@/lib/fipe/buscarCodigoFipe';

/**
 * POST /api/fipe/buscar-codigos
 * Busca códigos FIPE automaticamente para todos os veículos que não têm código
 */
export async function POST(request: NextRequest) {
  try {
    const resultados = await Promise.all(
      veiculosCliente.map(async (veiculo) => {
        // Se já tem código FIPE, pular
        if (veiculo.codigoFipe && veiculo.codigoFipe.trim() !== '') {
          return {
            id: veiculo.id,
            nome: veiculo.nome,
            codigoFipe: veiculo.codigoFipe,
            status: 'já_tem_codigo',
          };
        }
        
        // Determinar tipo baseado no tipo do veículo
        let tipo: 'carros' | 'caminhoes' | 'motos' = 'carros';
        if (veiculo.tipo === 'caminhao') {
          tipo = 'caminhoes';
        } else if (veiculo.tipo === 'maquina') {
          // Máquinas não têm FIPE, retornar sem buscar
          return {
            id: veiculo.id,
            nome: veiculo.nome,
            codigoFipe: null,
            status: 'maquina_sem_fipe',
            erro: 'Máquinas não têm FIPE oficial',
          };
        }
        
        // Extrair marca e modelo do nome
        const partes = veiculo.nome.split(' ');
        const marca = partes[0]; // Primeira palavra é a marca
        const modelo = partes.slice(1).join(' '); // Resto é o modelo
        
        // Buscar código FIPE
        const resultado = await buscarCodigoFipe(
          marca,
          modelo,
          veiculo.ano,
          tipo
        );
        
        return {
          id: veiculo.id,
          nome: veiculo.nome,
          codigoFipe: resultado.codigoFipe,
          status: resultado.codigoFipe ? 'encontrado' : 'nao_encontrado',
          erro: resultado.erro,
          marca: resultado.marca,
          modelo: resultado.modelo,
        };
      })
    );
    
    return NextResponse.json({
      sucesso: true,
      resultados,
      total: resultados.length,
      encontrados: resultados.filter((r) => r.codigoFipe).length,
      naoEncontrados: resultados.filter((r) => !r.codigoFipe && r.status !== 'já_tem_codigo' && r.status !== 'maquina_sem_fipe').length,
    });
  } catch (error: any) {
    console.error('Erro ao buscar códigos FIPE:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar códigos FIPE' },
      { status: 500 }
    );
  }
}
