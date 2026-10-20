// ============================================================
// Route Handler — Products (list + create)
// ============================================================
// Used with Pattern 2 (Route Handlers + ORM) or Pattern 3 (BFF).
//
// Fullstack (ORM): Replace fakeProducts calls with your ORM
//   const products = await db.query.products.findMany({ ... })
//
// BFF (proxy): Replace with fetch to your external backend
//   const res = await fetch(`${BACKEND_URL}/products?${searchParams}`, {
//     headers: { Authorization: `Bearer ${token}` }
//   })
//   return NextResponse.json(await res.json())
//
// Current: Mock (in-memory fake data for demo/prototyping)
// ============================================================

import { getProducts, createProduct } from '@/features/products/api/service';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? searchParams.get('perPage') ?? 10);
  const categories =
    searchParams.get('categories') ?? searchParams.get('category') ?? undefined;
  const subcategory = searchParams.get('subcategory') ?? undefined;
  const sub_subcategory = searchParams.get('sub_subcategory') ?? undefined;
  const search = searchParams.get('search') ?? searchParams.get('name') ?? undefined;
  const sort = searchParams.get('sort') ?? undefined;
  const stock_status = searchParams.get('stock_status') ?? undefined;

  try {
    const data = await getProducts({
      page,
      limit,
      categories,
      subcategory,
      sub_subcategory,
      search,
      sort,
      stock_status
    });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await createProduct(body);
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Error al crear producto' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { ids, codigos } = body;
    const targetIds = ids || codigos;

    if (!targetIds || !Array.isArray(targetIds) || targetIds.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere una lista de IDs de productos a eliminar (ids o codigos)' },
        { status: 400 }
      );
    }

    const { deleteStoreProducts } = await import('@/lib/store-service');
    const result = await deleteStoreProducts(targetIds);

    return NextResponse.json({
      success: true,
      deleted_count: result.count,
      message: `${result.count} producto(s) eliminado(s) exitosamente`
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Error al eliminar productos' },
      { status: 500 }
    );
  }
}
