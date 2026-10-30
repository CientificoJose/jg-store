import { NextRequest, NextResponse } from 'next/server';
import { updateStoreProductsStock } from '@/lib/store-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { ids, codigos, stock, selectAll, filters } = body;
    const targetIds = ids || codigos;

    if (stock === undefined || stock === null || isNaN(Number(stock))) {
      return NextResponse.json(
        { error: 'Se requiere un valor numérico válido para el stock' },
        { status: 400 }
      );
    }

    if (!selectAll && (!targetIds || !Array.isArray(targetIds) || targetIds.length === 0)) {
      return NextResponse.json(
        { error: 'Se requiere una lista de IDs de productos o el modo selectAll' },
        { status: 400 }
      );
    }

    const safeStock = Math.min(15, Math.max(0, Number(stock)));

    const result = await updateStoreProductsStock({
      ids: targetIds,
      stock: safeStock,
      selectAll: Boolean(selectAll),
      filters
    });

    return NextResponse.json({
      success: true,
      updated_count: result.count,
      message: `Stock actualizado a ${safeStock} en ${result.count} productos (máx. permitido: 15)`
    });
  } catch (error: any) {
    console.error('Error en /api/products/stock:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno al actualizar stock' },
      { status: 500 }
    );
  }
}
