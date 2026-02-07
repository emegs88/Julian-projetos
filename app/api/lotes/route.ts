import { NextRequest, NextResponse } from 'next/server';
import { Lote } from '@/types';

// Simulação de banco de dados (em produção, usar banco real)
let lotesDB: Lote[] = [];

export async function GET() {
  return NextResponse.json({ lotes: lotesDB });
}

export async function POST(request: NextRequest) {
  try {
    const lote: Lote = await request.json();
    
    lote.id = lote.id || `lote-${Date.now()}`;
    lote.selecionado = false;
    
    lotesDB.push(lote);
    
    return NextResponse.json({ lote, message: 'Lote cadastrado com sucesso' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao cadastrar lote' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const lote: Partial<Lote> & { id: string } = await request.json();
    
    const index = lotesDB.findIndex((l) => l.id === lote.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Lote não encontrado' }, { status: 404 });
    }
    
    lotesDB[index] = { ...lotesDB[index], ...lote };
    
    return NextResponse.json({ lote: lotesDB[index] });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar lote' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }
    
    lotesDB = lotesDB.filter((l) => l.id !== id);
    
    return NextResponse.json({ message: 'Lote removido com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover lote' }, { status: 500 });
  }
}
