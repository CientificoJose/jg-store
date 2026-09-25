'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { StoreProduct } from '@/types/store';
import { formatPrice } from '@/lib/whatsapp';
import { useCartStore } from '@/hooks/use-cart-store';
import { useFavoritesStore } from '@/hooks/use-favorites-store';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

interface ProductQuickViewProps {
  product: StoreProduct | null;
  onClose: () => void;
}

export function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
  const { addItem } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const [quantity, setQuantity] = useState<number>(product?.min_wholesale_qty || 1);

  if (!product) return null;

  const isFav = isFavorite(product.id);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-gotham">
      <div className="relative w-full max-w-2xl bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 hover:bg-background text-[#6C757D] hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
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
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E63946]/10 text-[#E63946]">
                {product.category_name}
              </span>
              <span
                className={`text-xs font-medium ${
                  isOutOfStock
                    ? 'text-[#6C757D]'
                    : product.stock <= 10
                    ? 'text-[#E63946]'
                    : 'text-emerald-600'
                }`}
              >
                {isOutOfStock
                  ? 'Agotado'
                  : `Disponibles: ${product.stock} ${product.unit}(s)`}
              </span>
            </div>

            <h2 className="text-2xl font-bebas tracking-wide text-foreground">{product.name}</h2>
            <p className="text-xs sm:text-sm text-[#6C757D] mt-2 leading-relaxed">
              {product.description}
            </p>

            {/* Escala de precios */}
            <div className="mt-5 rounded-xl border border-border/80 p-3 bg-muted/20 space-y-2">
              <div className="text-xs font-bold text-foreground">
                Escala de Precios:
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6C757D]">
                  Al Detal (1 a {product.min_wholesale_qty - 1} unid.):
                </span>
                <span className="font-bold text-foreground">
                  {formatPrice(product.retail_price)} c/u
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                <span className="text-[#D4A017] font-semibold">
                  Al Mayor ({product.min_wholesale_qty}+ unid.):
                </span>
                <span className="font-bold text-[#D4A017] font-bebas text-base">
                  {formatPrice(product.wholesale_price)} c/u
                </span>
              </div>
            </div>
          </div>

          {/* Controles de Compra */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-[#6C757D]">Cantidad seleccionada:</span>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                  className="w-7 h-7 flex items-center justify-center hover:bg-muted text-[#6C757D] disabled:opacity-40"
                >
                  <Icons.minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center font-bold text-xs">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={quantity >= product.stock}
                  className="w-7 h-7 flex items-center justify-center hover:bg-muted text-[#6C757D] disabled:opacity-40"
                >
                  <Icons.add className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-4">
              <div>
                <span className="text-[10px] text-[#6C757D] uppercase font-bold block">
                  Total Estimado
                </span>
                <span className="text-2xl font-bebas tracking-wide text-[#E63946]">
                  {formatPrice(subtotal)}
                </span>
              </div>
              {qualifiesForWholesale && (
                <span className="text-xs text-[#D4A017] font-semibold bg-[#D4A017]/15 px-2 py-1 rounded">
                  Ahorras {formatPrice(savings)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-3 rounded-xl bg-[#E63946] hover:bg-[#d62839] disabled:bg-muted disabled:text-[#6C757D] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#E63946]/20 transition-all cursor-pointer font-gotham"
              >
                <Icons.cart className="w-4 h-4" />
                <span>{isOutOfStock ? 'Producto Agotado' : 'Agregar al Carrito'}</span>
              </button>

              <button
                onClick={() => {
                  const added = toggleFavorite(product.id);
                  if (added) {
                    toast.success('Guardado en favoritos', { description: product.name });
                  } else {
                    toast.info('Eliminado de favoritos', { description: product.name });
                  }
                }}
                title={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  isFav
                    ? 'bg-[#E63946] text-white border-[#E63946] shadow-sm shadow-[#E63946]/20'
                    : 'bg-card border-border hover:bg-muted text-[#6C757D] hover:text-[#E63946]'
                }`}
              >
                <Icons.heart className={`w-5 h-5 transition-transform duration-200 ${isFav ? 'fill-current scale-110' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
