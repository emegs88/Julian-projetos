import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/garantia - Calcular garantia de veículo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vehicleId, multiplicador = 1.3 } = body;

    if (!vehicleId) {
      return NextResponse.json(
        { error: 'vehicleId é obrigatório' },
        { status: 400 }
      );
    }

    const veiculo = await prisma.vehicleFipe.findUnique({
      where: { id: vehicleId },
    });

    if (!veiculo) {
      return NextResponse.json(
        { error: 'Veículo não encontrado' },
        { status: 404 }
      );
    }

    const garantia = veiculo.fipe * multiplicador;

    return NextResponse.json({
      fipe: veiculo.fipe,
      garantia,
      multiplicador,
      veiculo: {
        id: veiculo.id,
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        ano: veiculo.ano,
      },
    });
  } catch (error) {
    console.error('Erro ao calcular garantia:', error);
    return NextResponse.json(
      { error: 'Erro ao calcular garantia' },
      { status: 500 }
    );
  }
}
