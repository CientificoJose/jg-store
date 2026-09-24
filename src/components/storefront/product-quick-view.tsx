'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { StoreProduct } from '@/types/store';
import { formatPrice } from '@/lib/whatsapp';
import { useCartStore } from '@/hooks/use-cart-store';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

interface ProductQuickViewProps {
  product: StoreProduct | null;
  onClose: () => void;
}

export function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState<number>(product?.min_wholesale_qty || 1);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const qualifiesForWholesale = quantity >= product.min_wholesale_qty;
  const unitPrice = qualifiesForWholesale
    ? product.wholesale_price
    : product.retail_price;
  const subtotal = Number((unitPrice * quantity).toFixed(2));
  const savings = Number(
    ((product.retail_price - product.wholesale_price) * quantity).toFixed(2)
  );

  const handleDecrease = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  const handleIncrease = () => {
    if (quantity < product.stock) {
      setQuantity((q) => q + 1);
    } else {
      toast.info(`Stock máximo alcanzado (${product.stock} unidades)`);
    }
  };

  const handleAddToCart = () => {
    const res = addItem(product, quantity);
    if (res.success) {
      toast.success('Producto agregado al carrito', {
        description: `${quantity}x ${product.name}`
      });
      onClose();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
        >
          <Icons.close className="w-4 h-4" />
        </button>

        {/* Imagen del producto */}
        <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto bg-muted/30">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
          <div className="absolute bottom-3 left-3 flex flex-col gap-1">
            <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-white text-xs font-mono">
              SKU: {product.sku}
            </span>
          </div>
        </div>

        {/* Detalles */}
        <div className="p-6 w-full md:w-1/2 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {product.category_name}
              </span>
              <span
                className={`text-xs font-medium ${
                  isOutOfStock
                    ? 'text-rose-600'
                    : product.stock <= 10
                    ? 'text-amber-500'
                    : 'text-emerald-600'
                }`}
              >
                {isOutOfStock
                  ? 'Agotado'
                  : `Disponibles: ${product.stock} ${product.unit}(s)`}
              </span>
            </div>

            <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              {product.description}
            </p>

            {/* Escala de precios */}
            <div className="mt-5 rounded-xl border border-border/70 p-3 bg-muted/20 space-y-2">
              <div className="text-xs font-bold text-foreground">
                Escala de Precios:
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Al Detal (1 a {product.min_wholesale_qty - 1} unid.):
                </span>
                <span className="font-bold text-foreground">
                  {formatPrice(product.retail_price)} c/u
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                <span className="text-amber-500 font-semibold">
                  Al Mayor ({product.min_wholesale_qty}+ unid.):
                </span>
                <span className="font-bold text-blue-600 dark:text-cyan-400">
                  {formatPrice(product.wholesale_price)} c/u
                </span>
              </div>
            </div>
          </div>

          {/* Controles de Compra */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-muted-foreground">Cantidad seleccionada:</span>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                  className="w-7 h-7 flex items-center justify-center hover:bg-muted text-muted-foreground disabled:opacity-40"
                >
                  <Icons.minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center font-bold text-xs">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={quantity >= product.stock}
                  className="w-7 h-7 flex items-center justify-center hover:bg-muted text-muted-foreground disabled:opacity-40"
                >
                  <Icons.add className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-4">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                  Total Estimado
                </span>
                <span className="text-xl font-extrabold text-foreground">
                  {formatPrice(subtotal)}
                </span>
              </div>
              {qualifiesForWholesale && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded">
                  Ahorras {formatPrice(savings)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-muted disabled:text-muted-foreground text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Icons.cart className="w-4 h-4" />
              <span>{isOutOfStock ? 'Producto Agotado' : 'Agregar al Carrito'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
