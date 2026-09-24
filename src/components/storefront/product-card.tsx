'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { StoreProduct } from '@/types/store';
import { formatPrice } from '@/lib/whatsapp';
import { useCartStore } from '@/hooks/use-cart-store';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

interface ProductCardProps {
  product: StoreProduct;
  onQuickView: (product: StoreProduct) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem, wholesaleMode } = useCartStore();
  const [quantity, setQuantity] = useState<number>(
    wholesaleMode ? product.min_wholesale_qty : 1
  );

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const qualifiesForWholesale = quantity >= product.min_wholesale_qty;
  const discountPercent = Math.round(
    ((product.retail_price - product.wholesale_price) / product.retail_price) * 100
  );

  const currentUnitPrice = qualifiesForWholesale
    ? product.wholesale_price
    : product.retail_price;

  const currentTotal = Number((currentUnitPrice * quantity).toFixed(2));

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
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
      toast.success(`Agregado al carrito`, {
        description: `${quantity}x ${product.name} (${qualifiesForWholesale ? 'Precio Mayorista' : 'Precio Detal'})`
      });
    } else {
      toast.error(res.message || 'No se pudo agregar al carrito');
    }
  };

  return (
    <div className="group flex flex-col justify-between rounded-2xl bg-card border border-border/70 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden">
      {/* Contenedor Superior: Imagen y Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges superiores */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-md bg-rose-600/95 text-white text-[11px] font-bold tracking-wide shadow-sm">
              Agotado
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 rounded-md bg-amber-500/95 text-white text-[11px] font-bold tracking-wide shadow-sm">
              Últimas {product.stock} unid.
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md bg-emerald-600/90 text-white text-[11px] font-semibold tracking-wide shadow-sm">
              {product.stock} en stock
            </span>
          )}

          {discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-blue-600/95 text-white text-[10px] font-bold tracking-wide shadow-sm">
              -{discountPercent}% x Mayor
            </span>
          )}
        </div>

        {/* Botón de Vista Rápida */}
        <button
          onClick={() => onQuickView(product)}
          aria-label="Ver detalles"
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-background/80 backdrop-blur-md text-foreground hover:text-blue-500 hover:bg-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md cursor-pointer"
        >
          <Icons.search className="w-4 h-4" />
        </button>
      </div>

      {/* Contenido Central: Info y Precios */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {product.category_name}
            </span>
            <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
              {product.sku}
            </span>
          </div>

          <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Bloque de Precios Detal vs Mayor */}
        <div className="mt-4 pt-3 border-t border-border/60">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Precio Detal
              </span>
              <span className="text-lg font-bold text-foreground">
                {formatPrice(product.retail_price)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider block">
                Mayor (desde {product.min_wholesale_qty} unid.)
              </span>
              <span className="text-base font-bold text-blue-600 dark:text-cyan-400">
                {formatPrice(product.wholesale_price)}
              </span>
            </div>
          </div>

          {/* Banner de Estado de Tarifa según la cantidad seleccionada */}
          <div className="mt-2.5">
            {qualifiesForWholesale ? (
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-cyan-400 text-[11px] font-medium">
                <Icons.tags className="w-3.5 h-3.5 shrink-0" />
                <span>
                  ¡Tarifa Mayorista aplicada! Ahorras{' '}
                  {formatPrice((product.retail_price - product.wholesale_price) * quantity)}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/40 p-1.5 rounded-lg">
                <span>
                  Lleva <strong className="text-foreground">{product.min_wholesale_qty - quantity} más</strong> para precio mayor
                </span>
                <span className="text-blue-600 dark:text-cyan-400 font-semibold">
                  {formatPrice(product.wholesale_price)} c/u
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controles Inferiores: Selector de Cantidad y Botón Carrito */}
      <div className="p-4 pt-0">
        <div className="flex items-center gap-2">
          {/* Selector de cantidad */}
          <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden shrink-0">
            <button
              onClick={handleDecrease}
              disabled={isOutOfStock || quantity <= 1}
              className="w-8 h-9 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Icons.minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-9 text-center text-xs font-bold text-foreground">
              {quantity}
            </span>
            <button
              onClick={handleIncrease}
              disabled={isOutOfStock || quantity >= product.stock}
              className="w-8 h-9 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Icons.add className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Botón Agregar */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 h-9 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 active:scale-[0.98]'
            }`}
          >
            <Icons.cart className="w-4 h-4" />
            <span>{isOutOfStock ? 'Sin Stock' : `Agregar • ${formatPrice(currentTotal)}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
