import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchProductById, fetchStoreProducts } from '@/lib/store-service';
import { ProductDetailPageLayout } from '@/components/storefront/product-detail-page-layout';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    return {
      title: 'Producto no encontrado | JG Store',
      description: 'El producto solicitado no está disponible en el catálogo de JG Store.'
    };
  }

  return {
    title: `${product.name} | JG Store Polirubro`,
    description: `${product.description} - Precios oficiales al detal y mayorista con JG Store Polirubro.`,
    openGraph: {
      title: `${product.name} | JG Store`,
      description: product.description,
      images: [
        {
          url: product.image_url,
          width: 800,
          height: 800,
          alt: product.name
        }
      ]
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  // Cargar productos relacionados dentro de la misma categoría oficial
  const allCategoryProducts = await fetchStoreProducts({ category: product.category_slug });
  const relatedProducts = allCategoryProducts.filter((p) => p.id !== product.id);

  return (
    <ProductDetailPageLayout
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
