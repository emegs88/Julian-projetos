import { NextRequest, NextResponse } from 'next/server';
import { Veiculo } from '@/types';

// Simulação de banco de dados (em produção, usar banco real)
let veiculosDB: Veiculo[] = [];

export async function GET() {
  return NextResponse.json({ veiculos: veiculosDB });
}

export async function POST(request: NextRequest) {
  try {
    const veiculo: Veiculo = await request.json();
    
    // Calcular garantia (130% FIPE)
    veiculo.valorGarantia = veiculo.fipe * 1.3;
    veiculo.id = veiculo.id || `veiculo-${Date.now()}`;
    veiculo.selecionado = false;
    
    veiculosDB.push(veiculo);
    
    return NextResponse.json({ veiculo, message: 'Veículo cadastrado com sucesso' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao cadastrar veículo' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const veiculo: Partial<Veiculo> & { id: string } = await request.json();
    
    const index = veiculosDB.findIndex((v) => v.id === veiculo.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Veículo não encontrado' }, { status: 404 });
    }
    
    // Recalcular garantia se FIPE mudou
    if (veiculo.fipe !== undefined) {
      veiculo.valorGarantia = veiculo.fipe * 1.3;
    }
    
    veiculosDB[index] = { ...veiculosDB[index], ...veiculo };
    
    return NextResponse.json({ veiculo: veiculosDB[index] });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar veículo' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }
    
    veiculosDB = veiculosDB.filter((v) => v.id !== id);
    
    return NextResponse.json({ message: 'Veículo removido com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover veículo' }, { status: 500 });
  }
}
