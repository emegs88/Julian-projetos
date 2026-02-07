import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/fipe/:id - Buscar veículo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const veiculo = await prisma.vehicleFipe.findUnique({
      where: { id: params.id },
    });

    if (!veiculo) {
      return NextResponse.json(
        { error: 'Veículo não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(veiculo);
  } catch (error) {
    console.error('Erro ao buscar veículo FIPE:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar veículo FIPE' },
      { status: 500 }
    );
  }
}

// PUT /api/fipe/:id - Editar valor FIPE
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { fipe, marca, modelo, ano, categoria } = body;

    const updateData: any = {};
    if (fipe !== undefined) updateData.fipe = parseFloat(fipe);
    if (marca) updateData.marca = marca;
    if (modelo) updateData.modelo = modelo;
    if (ano) updateData.ano = parseInt(ano);
    if (categoria !== undefined) updateData.categoria = categoria;

    const veiculo = await prisma.vehicleFipe.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(veiculo);
  } catch (error: any) {
    console.error('Erro ao atualizar veículo FIPE:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar veículo FIPE' },
      { status: 500 }
    );
  }
}

// DELETE /api/fipe/:id - Deletar veículo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.vehicleFipe.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Veículo deletado com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar veículo FIPE:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar veículo FIPE' },
      { status: 500 }
    );
  }
}
