import { NextResponse } from 'next/server';
import { clearAllCache } from '@/lib/bidcon/cache';

/**
 * POST /api/bidcon/marketplace/limpar-cache
 * Limpa todo o cache do marketplace BidCon
 */
export async function POST() {
  try {
    clearAllCache();
    return NextResponse.json({
      success: true,
      message: 'Cache limpo com sucesso',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Erro ao limpar cache:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao limpar cache' },
      { status: 500 }
    );
  }
}
