'use client';

import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { useAppForm } from '@/lib/form';
import { useStore } from '@tanstack/react-form';
import {
  categoryOptions,
  getSubcategoryOptions,
  getSubSubcategoryOptions
} from '@/features/products/constants/product-options';
import { formatCategoryBreadcrumb } from '@/constants/categories';
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
      category: initialData?.category ?? 'bazar-cocina',
      subcategory: initialData?.subcategory_slug ?? '',
      sub_subcategory: initialData?.sub_subcategory_slug ?? '',
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
        subcategory: value.subcategory || undefined,
        sub_subcategory: value.sub_subcategory || undefined,
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

  // Seguimiento reactivo de los 3 niveles de jerarquía
  const selectedCategory = useStore(form.store, (s) => s.values.category);
  const selectedSubcategory = useStore(form.store, (s) => s.values.subcategory);
  const selectedSubSubcategory = useStore(form.store, (s) => s.values.sub_subcategory);

  const subcategoryOptions = getSubcategoryOptions(selectedCategory);
  const subSubcategoryOptions = getSubSubcategoryOptions(
    selectedCategory,
    selectedSubcategory || ''
  );

  const breadcrumbPreview = formatCategoryBreadcrumb(
    selectedCategory,
    selectedSubcategory,
    selectedSubSubcategory
  );

  return (
    <Card className='mx-auto w-full max-w-4xl border border-border/80 shadow-md font-gotham'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold text-foreground font-gotham'>
          {pageTitle}
        </CardTitle>
        <CardDescription className='text-xs text-[#6C757D]'>
          Administra los datos comerciales, jerarquía de 3 niveles, inventario y precios duales
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

            {/* Renglón 2: Jerarquía de Clasificación en 3 Niveles */}
            <div className='p-4 rounded-2xl bg-muted/20 border border-border/70 space-y-3'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <div className='text-xs font-bold text-[#E63946] uppercase tracking-wider'>
                  Jerarquía de Catálogo en 3 Niveles
                </div>
                {breadcrumbPreview && (
                  <div className='text-[11px] font-medium text-foreground/80 bg-background px-3 py-1 rounded-full border border-border/60 shadow-xs flex items-center gap-1.5'>
                    <span className='w-1.5 h-1.5 rounded-full bg-[#E63946]' />
                    <span>Ruta: <strong>{breadcrumbPreview}</strong></span>
                  </div>
                )}
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                {/* Nivel 1: Categoría Principal */}
                <form.AppField
                  name='category'
                  listeners={{
                    onChange: () => {
                      form.setFieldValue('subcategory', '');
                      form.setFieldValue('sub_subcategory', '');
                    }
                  }}
                  children={(field) => (
                    <field.SelectField
                      label='1. Rubro / Departamento (24)'
                      required
                      options={categoryOptions}
                      placeholder='Selecciona un departamento'
                    />
                  )}
                />

                {/* Nivel 2: Subcategoría Comercial */}
                <form.AppField
                  name='subcategory'
                  listeners={{
                    onChange: () => {
                      form.setFieldValue('sub_subcategory', '');
                    }
                  }}
                  children={(field) => (
                    <field.SelectField
                      label='2. Subcategoría Comercial'
                      options={subcategoryOptions}
                      placeholder={
                        subcategoryOptions.length > 0
                          ? 'Selecciona subcategoría'
                          : 'Sin subcategorías'
                      }
                      disabled={subcategoryOptions.length === 0}
                    />
                  )}
                />

                {/* Nivel 3: Sub-subcategoría / Línea Específica */}
                <form.AppField
                  name='sub_subcategory'
                  children={(field) => (
                    <field.SelectField
                      label='3. Línea de Producto (Nivel 3)'
                      options={subSubcategoryOptions}
                      placeholder={
                        subSubcategoryOptions.length > 0
                          ? 'Selecciona línea de producto'
                          : selectedSubcategory
                          ? 'Sin líneas adicionales'
                          : 'Elige subcategoría primero'
                      }
                      disabled={subSubcategoryOptions.length === 0}
                    />
                  )}
                />
              </div>
            </div>

            {/* Renglón 3: Unidad de Venta */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
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
