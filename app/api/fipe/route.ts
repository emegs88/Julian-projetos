import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/fipe - Retorna todos os veículos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const modelo = searchParams.get('modelo');
    const marca = searchParams.get('marca');
    const ano = searchParams.get('ano');

    let where: any = {};

    if (modelo) {
      where.modelo = {
        contains: modelo,
        mode: 'insensitive',
      };
    }

    if (marca) {
      where.marca = {
        contains: marca,
        mode: 'insensitive',
      };
    }

    if (ano) {
      where.ano = parseInt(ano);
    }

    const veiculos = await prisma.vehicleFipe.findMany({
      where,
      orderBy: [
        { marca: 'asc' },
        { modelo: 'asc' },
        { ano: 'desc' },
      ],
    });

    return NextResponse.json(veiculos);
  } catch (error) {
    console.error('Erro ao buscar veículos FIPE:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar veículos FIPE' },
      { status: 500 }
    );
  }
}

// POST /api/fipe - Criar novo veículo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marca, modelo, ano, fipe, categoria } = body;

    if (!marca || !modelo || !ano || !fipe) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: marca, modelo, ano, fipe' },
        { status: 400 }
      );
    }

    const veiculo = await prisma.vehicleFipe.create({
      data: {
        marca,
        modelo,
        ano: parseInt(ano),
        fipe: parseFloat(fipe),
        categoria: categoria || null,
      },
    });

    return NextResponse.json(veiculo, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar veículo FIPE:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar veículo FIPE' },
      { status: 500 }
    );
  }
}
