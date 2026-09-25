'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StoreProduct } from '@/types/store';
import { fetchStoreProducts } from '@/lib/store-service';
import { useFavoritesStore } from '@/hooks/use-favorites-store';
import { useCartStore } from '@/hooks/use-cart-store';
import { formatPrice, JG_STORE_WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { ProductCard } from './product-card';
import { ProductQuickView } from './product-quick-view';

export function FavoritesView() {
  const { favoriteIds, clearFavorites } = useFavoritesStore();
  const { addItem, setOpen, wholesaleMode } = useCartStore();

  const [allProducts, setAllProducts] = useState<StoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<StoreProduct | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchStoreProducts()
      .then((data) => {
        if (mounted) {
          setAllProducts(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const favoriteProducts = allProducts.filter((p) => favoriteIds.includes(p.id));
  const suggestedProducts = allProducts
    .filter((p) => !favoriteIds.includes(p.id) && p.featured)
    .slice(0, 4);

  // Cálculos acumulados de favoritos
  const totalRetail = favoriteProducts.reduce((acc, p) => acc + p.retail_price, 0);
  const totalWholesale = favoriteProducts.reduce((acc, p) => acc + p.wholesale_price, 0);
  const totalPotentialSavings = totalRetail - totalWholesale;

  // Acciones Masivas
  const handleAddAllToCart = () => {
    if (favoriteProducts.length === 0) return;
    let addedCount = 0;

    favoriteProducts.forEach((p) => {
      if (p.stock > 0) {
        addItem(p, wholesaleMode ? p.min_wholesale_qty : 1);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      toast.success(`Se agregaron ${addedCount} productos al carrito`, {
        description: `Modalidad: ${wholesaleMode ? 'Tarifa Mayorista' : 'Tarifa Detal'}`
      });
      setOpen(true);
    } else {
      toast.error('Los productos seleccionados no tienen stock disponible actualmente.');
    }
  };

  const handleQuoteAllWhatsApp = () => {
    if (favoriteProducts.length === 0) return;

    let msg = `¡Hola JG Store! 👋 Quiero consultar y cotizar mi lista de *Productos Favoritos*:\n\n`;
    favoriteProducts.forEach((p, idx) => {
      msg += `🔹 *${idx + 1}. ${p.name}*\n`;
      msg += `   Código SKU: ${p.sku} | Rubro: ${p.category_name}\n`;
      msg += `   PVP Detal: ${formatPrice(p.retail_price)} | Mayor (${p.min_wholesale_qty}+ ${p.unit}s): ${formatPrice(p.wholesale_price)}\n`;
      msg += `   Disponibilidad: ${p.stock > 0 ? `${p.stock} en depósito` : 'Agotado'}\n\n`;
    });

    msg += `📊 *Total Referencial Detal:* ${formatPrice(totalRetail)}\n`;
    msg += `⭐ *Total Referencial Mayorista:* ${formatPrice(totalWholesale)}\n`;
    if (totalPotentialSavings > 0) {
      msg += `🎉 *Ahorro Estimado al Mayor:* ${formatPrice(totalPotentialSavings)}\n`;
    }
    msg += `\n¿Me confirman disponibilidad y tiempos de entrega? ¡Gracias!`;

    const url = `https://wa.me/${JG_STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleClearAll = () => {
    if (favoriteProducts.length === 0) return;
    if (window.confirm('¿Seguro que deseas eliminar todos los productos de tu lista de favoritos?')) {
      clearFavorites();
      toast.info('Se vació la lista de favoritos');
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-6 sm:py-10 font-gotham transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Migas de Pan */}
        <nav className="flex items-center gap-2 text-xs text-[#6C757D] mb-6">
          <Link href="/" className="hover:text-[#E63946] flex items-center gap-1 transition-colors">
            <Icons.chevronLeft className="w-3.5 h-3.5" />
            <span>Volver a la tienda</span>
          </Link>
          <span className="text-border">/</span>
          <Link href="/" className="hover:text-[#E63946] transition-colors">
            Inicio
          </Link>
          <span className="text-border">/</span>
          <span className="font-semibold text-foreground">Mis Favoritos</span>
        </nav>

        {/* Encabezado Principal de Favoritos */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-9 h-9 rounded-xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center">
                <Icons.heart className="w-5 h-5 fill-current" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-gotham">
                Mis Productos Favoritos
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E63946] text-white">
                {favoriteIds.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6C757D]">
              Guarda tus artículos preferidos para cotizarlos en lote por WhatsApp o agregarlos a tu pedido mayorista.
            </p>
          </div>

          {/* Botones de Acción Masiva */}
          {favoriteProducts.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleQuoteAllWhatsApp}
                className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Icons.whatsapp className="w-4 h-4" />
                <span>Cotizar Todos por WhatsApp</span>
              </button>

              <button
                onClick={handleAddAllToCart}
                className="h-10 px-4 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Icons.cart className="w-4 h-4" />
                <span>Agregar Todos al Carrito</span>
              </button>

              <button
                onClick={handleClearAll}
                title="Vaciar lista de favoritos"
                className="h-10 px-3 rounded-xl border border-border/80 hover:bg-muted text-[#6C757D] hover:text-destructive text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Icons.trash className="w-4 h-4" />
                <span className="hidden sm:inline">Vaciar</span>
              </button>
            </div>
          )}
        </div>

        {/* Resumen de Tarifas si hay favoritos */}
        {favoriteProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
              <span className="text-[11px] font-semibold text-[#6C757D] uppercase tracking-wider block">
                Total Estimado al Detal
              </span>
              <span className="text-2xl font-bold text-foreground font-gotham mt-1 block">
                {formatPrice(totalRetail)}
              </span>
              <span className="text-[11px] text-[#6C757D]">Comprando 1 unidad de cada favorito</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider block">
                  Total Estimado al Mayor
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#D4A017] text-white">
                  VIP B2B
                </span>
              </div>
              <span className="text-2xl font-bold text-foreground font-bebas tracking-wide mt-1 block">
                {formatPrice(totalWholesale)}
              </span>
              <span className="text-[11px] text-[#6C757D]">Aplicando tarifa con mínimos mayoristas</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider block">
                Ahorro Potencial Mayorista
              </span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-gotham mt-1 block">
                {formatPrice(totalPotentialSavings)}
              </span>
              <span className="text-[11px] text-[#6C757D]">Ahorras comprando por bulto comercial</span>
            </div>
          </div>
        )}

        {/* ESTADO DE CARGA */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-3 border-[#E63946] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-[#6C757D]">Cargando tus productos favoritos...</p>
          </div>
        ) : favoriteProducts.length === 0 ? (
          /* ESTADO VACÍO (EMPTY STATE) */
          <div className="bg-card border border-border/80 rounded-2xl p-10 sm:p-16 text-center max-w-2xl mx-auto shadow-sm my-6">
            <div className="w-16 h-16 rounded-full bg-[#E63946]/10 text-[#E63946] flex items-center justify-center mx-auto mb-4">
              <Icons.heart className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2 font-gotham">
              Aún no tienes productos en tus favoritos
            </h2>
            <p className="text-sm text-[#6C757D] max-w-md mx-auto leading-relaxed mb-6">
              Haz clic en el icono del corazón en cualquier producto del catálogo para guardarlo aquí y cotizarlo fácilmente en un solo pedido.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white font-semibold text-sm shadow-md transition-all"
            >
              <Icons.store className="w-4 h-4" />
              <span>Explorar los 24 Departamentos</span>
            </Link>
          </div>
        ) : (
          /* GRILLA DE FAVORITOS */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {favoriteProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        )}

        {/* SECCIÓN DE PRODUCTOS RECOMENDADOS SI LA LISTA TIENE POCOS ARTÍCULOS */}
        {suggestedProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border/80">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground font-gotham">
                  Productos Destacados que te pueden interesar
                </h2>
                <p className="text-xs text-[#6C757D]">
                  Los más vendidos con descuentos especiales por volumen.
                </p>
              </div>
              <Link href="/" className="text-xs font-semibold text-[#E63946] hover:underline">
                Ver todo el catálogo →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {suggestedProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modal de Vista Rápida */}
      <ProductQuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
