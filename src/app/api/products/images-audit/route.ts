import { NextRequest, NextResponse } from 'next/server';
import { auditProductImages } from '@/lib/product-audit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const filter = searchParams.get('filter') || 'all'; // 'all' | 'with_image' | 'without_image' | 'broken'
    const summaryOnly = searchParams.get('summary_only') === 'true';
    const verifyStorage = searchParams.get('verify_storage') !== 'false';
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(1000, Math.max(1, Number(searchParams.get('limit') || 100)));

    const audit = await auditProductImages({
      verifyStorage,
      category,
      search
    });

    if (summaryOnly) {
      return NextResponse.json({
        success: true,
        summary: audit.summary
      });
    }

    let items: any[] = [];
    if (filter === 'with_image') {
      items = audit.products_with_image;
    } else if (filter === 'without_image') {
      items = [...audit.products_without_image, ...audit.products_broken_storage];
    } else if (filter === 'broken') {
      items = audit.products_broken_storage;
    } else {
      // 'all'
      items = [
        ...audit.products_with_image,
        ...audit.products_without_image,
        ...audit.products_broken_storage
      ];
    }

    const totalItems = items.length;
    const offset = (page - 1) * limit;
    const paginatedItems = items.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      summary: audit.summary,
      filter,
      total_filtered: totalItems,
      page,
      limit,
      total_pages: Math.ceil(totalItems / limit),
      products: paginatedItems
    });
  } catch (error: any) {
    console.error('Error en /api/products/images-audit:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error inesperado al auditar imágenes'
      },
      { status: 500 }
    );
  }
}
