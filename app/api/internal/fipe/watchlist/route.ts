import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/internal/fipe/watchlist - Retorna lista de veículos monitorados
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ativo = searchParams.get('ativo');
    const codigoFipe = searchParams.get('codigoFipe');

    const where: any = {};
    if (ativo !== null) {
      where.ativo = ativo === 'true';
    }
    if (codigoFipe) {
      where.codigoFipe = codigoFipe;
    }

    const veiculos = await prisma.vehicleWatchlist.findMany({
      where,
      include: {
        priceHistory: {
          orderBy: { fetchedAt: 'desc' },
          take: 1, // Último preço
        },
      },
      orderBy: [
        { categoria: 'asc' },
        { marca: 'asc' },
        { modelo: 'asc' },
      ],
    });

    return NextResponse.json(veiculos);
  } catch (error) {
    console.error('Erro ao buscar watchlist:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar watchlist' },
      { status: 500 }
    );
  }
}

// POST /api/internal/fipe/watchlist - Cadastra novo veículo monitorado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoria, marca, modelo, anoModelo, codigoFipe, apelido, ativo = true } = body;

    if (!categoria || !marca || !modelo || !anoModelo || !codigoFipe) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: categoria, marca, modelo, anoModelo, codigoFipe' },
        { status: 400 }
      );
    }

    // Validar categoria
    if (!['carros', 'motos', 'caminhoes'].includes(categoria)) {
      return NextResponse.json(
        { error: 'Categoria deve ser: carros, motos ou caminhoes' },
        { status: 400 }
      );
    }

    const veiculo = await prisma.vehicleWatchlist.create({
      data: {
        categoria,
        marca,
        modelo,
        anoModelo: parseInt(anoModelo),
        codigoFipe,
        apelido: apelido || null,
        ativo,
      },
    });

    return NextResponse.json(veiculo, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar veículo na watchlist:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar veículo na watchlist' },
      { status: 500 }
    );
  }
}
