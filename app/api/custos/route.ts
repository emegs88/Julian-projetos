import { NextRequest, NextResponse } from 'next/server';

export interface CustoItem {
  id: string;
  tipo: 'documentacao' | 'registro' | 'itbi' | 'comissao' | 'outros';
  descricao: string;
  valor: number;
  orgao?: string; // Órgão responsável (ex: Cartório, Receita Federal, etc.)
  observacoes?: string;
  data: Date;
}

// Simulação de banco de dados
let custosDB: CustoItem[] = [];

export async function GET() {
  return NextResponse.json({ custos: custosDB });
}

export async function POST(request: NextRequest) {
  try {
    const custo: CustoItem = await request.json();
    
    custo.id = custo.id || `custo-${Date.now()}`;
    custo.data = new Date(custo.data || Date.now());
    
    custosDB.push(custo);
    
    return NextResponse.json({ custo, message: 'Custo cadastrado com sucesso' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao cadastrar custo' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const custo: Partial<CustoItem> & { id: string } = await request.json();
    
    const index = custosDB.findIndex((c) => c.id === custo.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Custo não encontrado' }, { status: 404 });
    }
    
    custosDB[index] = { ...custosDB[index], ...custo };
    
    return NextResponse.json({ custo: custosDB[index] });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar custo' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }
    
    custosDB = custosDB.filter((c) => c.id !== id);
    
    return NextResponse.json({ message: 'Custo removido com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover custo' }, { status: 500 });
  }
}
