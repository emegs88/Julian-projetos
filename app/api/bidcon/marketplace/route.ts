import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/bidcon/cache';
import { CotaMarketplace } from '@/types/bidcon';

const BIDCON_API_URL = process.env.BIDCON_API_URL || 'https://bidcon.vercel.app';
const BIDCON_API_KEY = process.env.BIDCON_API_KEY || '';

/**
 * GET /api/bidcon/marketplace
 * Consome o endpoint público do BidCon com cache de 5 minutos
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'contemplada';
    const limit = searchParams.get('limit') || '100';
    const sort = searchParams.get('sort') || 'recent';
    const forcarAtualizacao = searchParams.get('atualizar') === 'true';

    // Chave do cache
    const cacheKey = `bidcon-marketplace-${status}-${limit}-${sort}`;

    // Verificar cache (a menos que force atualização)
    if (!forcarAtualizacao) {
      const cached = getCache(cacheKey);
      if (cached) {
        return NextResponse.json({
          data: cached,
          fonte: 'cache',
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Buscar do BidCon
    const url = `${BIDCON_API_URL}/api/public/marketplace?status=${status}&limit=${limit}&sort=${sort}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // Revalida a cada 5 minutos
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar marketplace: ${response.statusText}`);
    }

    const data: CotaMarketplace[] = await response.json();

    // Salvar no cache
    setCache(cacheKey, data);

    return NextResponse.json({
      data,
      fonte: 'bidcon',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Erro ao buscar marketplace BidCon:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar marketplace BidCon' },
      { status: 500 }
    );
  }
}
