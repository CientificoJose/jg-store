import { NextRequest } from 'next/server';
import { updateStoreProductMarginsMassive } from '@/lib/store-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { scope = 'all', category, retail_margin, wholesale_margin } = body;

    const retailMarginNum = retail_margin !== undefined ? Number(retail_margin) : undefined;
    const wholesaleMarginNum =
      wholesale_margin !== undefined ? Number(wholesale_margin) : undefined;

    if (retailMarginNum === undefined && wholesaleMarginNum === undefined) {
      return Response.json(
        { error: 'Debes especificar al menos un margen a actualizar (detal o mayorista)' },
        { status: 400 }
      );
    }

    const result = await updateStoreProductMarginsMassive({
      scope,
      category,
      retailMargin: retailMarginNum,
      wholesaleMargin: wholesaleMarginNum
    });

    return Response.json(result);
  } catch (error: any) {
    console.error('Error en /api/products/margins:', error);
    return Response.json(
      { error: error?.message || 'Error interno al actualizar márgenes' },
      { status: 500 }
    );
  }
}
