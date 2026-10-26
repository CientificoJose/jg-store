import { NextRequest, NextResponse } from 'next/server';
import { uploadBufferToSupabaseStorage } from '@/lib/supabase-storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const categorySlug = (formData.get('slug') as string) || 'categoria';

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const fileName = `cat_${categorySlug}_${Date.now()}.jpg`;
    const publicUrl = await uploadBufferToSupabaseStorage(buffer, fileName, file.type || 'image/jpeg');

    if (!publicUrl) {
      return NextResponse.json(
        { error: 'Error al subir la imagen al almacenamiento' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error('Error subiendo imagen de categoría:', error);
    return NextResponse.json(
      { error: error.message || 'Error inesperado al subir imagen' },
      { status: 500 }
    );
  }
}
