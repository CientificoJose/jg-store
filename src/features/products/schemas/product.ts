import * as z from 'zod';

export const productSchema = z.object({
  sku: z.string().min(2, 'El código SKU es obligatorio (ej: JG-ARO-001)'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  category: z.string().min(1, 'Selecciona un rubro/departamento'),
  subcategory: z.string().optional(),
  sub_subcategory: z.string().optional(),
  retail_price: z.number().min(0.01, 'El precio al detal debe ser mayor a 0'),
  wholesale_price: z.number().min(0.01, 'El precio mayorista debe ser mayor a 0'),
  min_wholesale_qty: z.number().min(1, 'El mínimo mayorista debe ser al menos 1'),
  stock: z.number().min(0, 'El stock no puede ser negativo'),
  unit: z.string().min(1, 'Especifica la unidad (unidad, docena, pack, bulto, kilo)'),
  photo_url: z.string().min(1, 'Ingresa la URL de la imagen del producto'),
  description: z.string().min(5, 'La descripción debe tener al menos 5 caracteres')
});

export type ProductFormValues = {
  sku: string;
  name: string;
  category: string;
  subcategory?: string;
  sub_subcategory?: string;
  retail_price: number | undefined;
  wholesale_price: number | undefined;
  min_wholesale_qty: number | undefined;
  stock: number | undefined;
  unit: string;
  photo_url: string;
  description: string;
};
