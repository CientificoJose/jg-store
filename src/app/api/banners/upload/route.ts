import { NextRequest, NextResponse } from 'next/server';
import { uploadBufferToSupabaseStorage } from '@/lib/supabase-storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bannerTag = (formData.get('tag') as string) || 'banner';

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const cleanTag = bannerTag.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20);
    const fileName = `banner_${cleanTag}_${Date.now()}.jpg`;
    const publicUrl = await uploadBufferToSupabaseStorage(buffer, fileName, file.type || 'image/jpeg');

    if (!publicUrl) {
      return NextResponse.json(
        { error: 'Error al subir la imagen del banner al almacenamiento' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error('Error subiendo imagen de banner:', error);
    return NextResponse.json(
      { error: error.message || 'Error inesperado al subir imagen' },
      { status: 500 }
    );
  }
}
