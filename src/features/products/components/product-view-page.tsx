'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import type { Product } from '../api/types';
import { notFound } from 'next/navigation';
import ProductForm from './product-form';
import { productByIdOptions } from '../api/queries';

type TProductViewPageProps = {
  productId: string;
};

export default function ProductViewPage({ productId }: TProductViewPageProps) {
  if (productId === 'new') {
    return <ProductForm initialData={null} pageTitle='Registrar Nuevo Producto' />;
  }

  return <EditProductView productId={productId} />;
}

function EditProductView({ productId }: { productId: string }) {
  const { data } = useSuspenseQuery(productByIdOptions(productId));

  if (!data?.success || !data?.product) {
    notFound();
  }

  return (
    <ProductForm
      initialData={data.product as Product}
      pageTitle={`Editar Producto: ${data.product.name}`}
    />
  );
}
