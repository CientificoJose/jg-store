'use client';

import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { useAppForm } from '@/lib/form';
import { categoryOptions } from '@/features/products/constants/product-options';
import { productSchema, type ProductFormValues } from '@/features/products/schemas/product';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createProductMutation, updateProductMutation } from '../api/mutations';
import type { Product } from '../api/types';
import Image from 'next/image';
import { useState } from 'react';

export default function ProductForm({
  initialData,
  pageTitle
}: {
  initialData: Product | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [previewUrl, setPreviewUrl] = useState<string>(
    initialData?.photo_url ||
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
  );

  const createMutation = useMutation({
    ...createProductMutation,
    onSuccess: () => {
      toast.success('Producto creado exitosamente en el catálogo');
      router.push('/dashboard/product');
    },
    onError: () => {
      toast.error('No se pudo crear el producto. Intente nuevamente.');
    }
  });

  const updateMutation = useMutation({
    ...updateProductMutation,
    onSuccess: () => {
      toast.success('Producto actualizado exitosamente');
      router.push('/dashboard/product');
    },
    onError: () => {
      toast.error('No se pudo actualizar el producto. Intente nuevamente.');
    }
  });

  const form = useAppForm({
    defaultValues: {
      sku: initialData?.sku ?? `JG-${Math.floor(100 + Math.random() * 900)}`,
      name: initialData?.name ?? '',
      category: initialData?.category ?? 'bazar',
      retail_price: initialData?.retail_price ?? undefined,
      wholesale_price: initialData?.wholesale_price ?? undefined,
      min_wholesale_qty: initialData?.min_wholesale_qty ?? 6,
      stock: initialData?.stock ?? 50,
      unit: initialData?.unit ?? 'unidad',
      photo_url:
        initialData?.photo_url ??
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      description: initialData?.description ?? ''
    } as ProductFormValues,
    validators: {
      onSubmit: productSchema
    },
    onSubmit: ({ value }) => {
      const payload = {
        sku: value.sku,
        name: value.name,
        category: value.category,
        retail_price: Number(value.retail_price),
        wholesale_price: Number(value.wholesale_price),
        min_wholesale_qty: Number(value.min_wholesale_qty || 6),
        stock: Number(value.stock || 0),
        unit: value.unit || 'unidad',
        photo_url: value.photo_url,
        description: value.description,
        price: Number(value.retail_price)
      };

      if (isEdit) {
        updateMutation.mutate({ id: initialData.id, values: payload });
      } else {
        createMutation.mutate(payload);
      }
    }
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className='mx-auto w-full max-w-4xl border border-border/80 shadow-md font-gotham'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold text-foreground font-gotham'>
          {pageTitle}
        </CardTitle>
        <CardDescription className='text-xs text-[#6C757D]'>
          Administra los datos comerciales, fotos, inventario y la escala de precios dual
          (Minorista / Mayorista) para JG Store Polirubro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className='space-y-6'
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            {/* Renglón 1: SKU y Nombre */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <form.AppField
                name='sku'
                children={(field) => (
                  <field.TextField
                    label='Código SKU'
                    required
                    placeholder='Ej: JG-ARO-001'
                  />
                )}
              />

              <div className='md:col-span-2'>
                <form.AppField
                  name='name'
                  children={(field) => (
                    <field.TextField
                      label='Nombre del Producto'
                      required
                      placeholder='Ej: Difusor Aromático Varillas 250ml'
                    />
                  )}
                />
              </div>
            </div>

            {/* Renglón 2: Rubro y Unidad */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div className='md:col-span-2'>
                <form.AppField
                  name='category'
                  children={(field) => (
                    <field.SelectField
                      label='Rubro / Departamento (24 Oficiales)'
                      required
                      options={categoryOptions}
                      placeholder='Selecciona un departamento'
                    />
                  )}
                />
              </div>

              <form.AppField
                name='unit'
                children={(field) => (
                  <field.TextField
                    label='Unidad de Venta'
                    required
                    placeholder='unidad, docena, pack, bulto'
                  />
                )}
              />
            </div>

            {/* Renglón 3: Precios B2B / B2C y Stock */}
            <div className='p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-4'>
              <div className='text-xs font-bold text-[#E63946] uppercase tracking-wider'>
                Reglas Comerciales: Detal, Mayor y Stock
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <form.AppField
                  name='retail_price'
                  children={(field) => (
                    <field.TextField
                      label='PVP al Detal ($ USD)'
                      required
                      type='number'
                      min={0.01}
                      step={0.01}
                      placeholder='0.00'
                    />
                  )}
                />

                <form.AppField
                  name='wholesale_price'
                  children={(field) => (
                    <field.TextField
                      label='Tarifa Mayorista ($ USD)'
                      required
                      type='number'
                      min={0.01}
                      step={0.01}
                      placeholder='0.00'
                    />
                  )}
                />

                <form.AppField
                  name='min_wholesale_qty'
                  children={(field) => (
                    <field.TextField
                      label='Mínimo Mayorista (Unid.)'
                      required
                      type='number'
                      min={1}
                      step={1}
                      placeholder='6'
                    />
                  )}
                />

                <form.AppField
                  name='stock'
                  children={(field) => (
                    <field.TextField
                      label='Stock Físico en Depósito'
                      required
                      type='number'
                      min={0}
                      step={1}
                      placeholder='50'
                    />
                  )}
                />
              </div>
            </div>

            {/* Renglón 4: Imagen URL y Vista Previa */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 items-center'>
              <div className='md:col-span-3'>
                <form.AppField
                  name='photo_url'
                  children={(field) => (
                    <field.TextField
                      label='URL de la Imagen (HD)'
                      required
                      placeholder='https://...'
                    />
                  )}
                />
              </div>

              <div className='flex flex-col items-center justify-center p-2 rounded-xl border border-border bg-card'>
                <span className='text-[10px] text-[#6C757D] font-bold mb-1 uppercase'>Vista Previa</span>
                <div className='relative w-16 h-16 rounded-lg overflow-hidden border border-border/80 bg-muted/30'>
                  <Image
                    src={previewUrl}
                    alt='Vista previa'
                    fill
                    className='object-cover'
                    onError={() =>
                      setPreviewUrl(
                        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* Renglón 5: Descripción */}
            <form.AppField
              name='description'
              children={(field) => (
                <field.TextareaField
                  label='Descripción Comercial'
                  required
                  placeholder='Detalla las características, material, beneficios y especificaciones del producto...'
                  maxLength={500}
                  rows={4}
                />
              )}
            />
          </FieldGroup>

          <div className='flex justify-end gap-3 pt-4 border-t border-border/80'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.back()}
              className='cursor-pointer'
            >
              Cancelar
            </Button>
            <LoadingButton
              loading={isPending}
              type='submit'
              className='bg-[#E63946] hover:bg-[#d62839] text-white font-semibold cursor-pointer'
            >
              {isEdit ? 'Guardar Cambios' : 'Registrar Producto'}
            </LoadingButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
