'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StoreProduct } from '@/types/store';
import { formatPrice, JG_STORE_WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { useCartStore } from '@/hooks/use-cart-store';
import { useFavoritesStore } from '@/hooks/use-favorites-store';
import { useStoreConfigStore } from '@/hooks/use-store-config-store';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { ProductCard } from './product-card';

interface ProductDetailViewProps {
  product: StoreProduct;
  relatedProducts: StoreProduct[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const { addItem, setOpen } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const whatsappNumber = useStoreConfigStore((s) => s.general.whatsappNumber);
  const isFav = isFavorite(product.id);

  // Selector de cantidad
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [selectedVariantColor, setSelectedVariantColor] = useState<string>('Estándar');

  // Miniaturas simuladas (4 fotos en diferentes ángulos como Mercado Libre)
  const galleryImages = [
    product.image_url,
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80'
  ];

  // Cálculos de precios (B2B vs B2C)
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const qualifiesForWholesale = quantity >= product.min_wholesale_qty;
  const activeUnitPrice = qualifiesForWholesale ? product.wholesale_price : product.retail_price;
  const subtotal = Number((activeUnitPrice * quantity).toFixed(2));
  const retailSubtotal = Number((product.retail_price * quantity).toFixed(2));
  const savings = Number((retailSubtotal - subtotal).toFixed(2));
  const wholesaleDiscountPct = Math.round(
    ((product.retail_price - product.wholesale_price) / product.retail_price) * 100
  );

  // Manejadores
  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1) return;
    if (newQty > product.stock) {
      toast.error(`Solo quedan ${product.stock} unidades en stock.`);
      return;
    }
    setQuantity(newQty);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addItem(product, quantity);
    if (res.success) {
      toast.success('Producto agregado al carrito', {
        description: `${quantity}x ${product.name}`
      });
      setOpen(true);
    } else {
      toast.error(res.message || 'No se pudo agregar al carrito');
    }
  };

  const handleBuyNowWhatsApp = () => {
    if (isOutOfStock) return;
    const directMessage = `¡Hola JG Store! Quiero comprar ahora este producto:\n\n📦 *${product.name}*\n🔢 SKU: ${product.sku}\n📊 Cantidad: ${quantity} ${product.unit}(s)\n💰 Precio unitario: ${formatPrice(activeUnitPrice)} (${qualifiesForWholesale ? 'Mayorista' : 'Detal'})\n💵 Total estimado: ${formatPrice(subtotal)}${savings > 0 ? `\n🎉 Ahorro Mayorista: ${formatPrice(savings)}` : ''}\n\n¿Tienen disponibilidad para coordinar el pago y envío?`;
    const cleanPhone = (whatsappNumber || JG_STORE_WHATSAPP_NUMBER).replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(directMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-muted/40 py-6 sm:py-8 font-gotham">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb estilo Mercado Libre */}
        <nav className="flex items-center gap-2 text-xs text-[#6C757D] mb-4 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#E63946] flex items-center gap-1">
            <Icons.chevronLeft className="w-3.5 h-3.5" />
            <span>Volver al catálogo</span>
          </Link>
          <span className="text-border">/</span>
          <Link href="/" className="hover:text-[#E63946]">Inicio</Link>
          <span className="text-border">/</span>
          <span className="font-semibold text-foreground">{product.category_name}</span>
          <span className="text-border">/</span>
          <span className="text-[#6C757D] truncate max-w-xs">{product.name}</span>
        </nav>

        {/* CONTENEDOR PRINCIPAL: Tarjeta Blanca Estilo Mercado Libre */}
        <div className="bg-card rounded-2xl border border-border/80 shadow-sm p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

            {/* COLUMNA 1: Galería de Miniaturas y Foto Principal (5 columnas) */}
            <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4">
              
              {/* Tira de Miniaturas verticales */}
              <div className="flex sm:flex-col gap-2 shrink-0 overflow-x-auto sm:overflow-visible">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 overflow-hidden transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-[#E63946] ring-2 ring-[#E63946]/20'
                        : 'border-border/80 hover:border-[#6C757D]'
                    }`}
                  >
                    <Image
                      src={imgUrl}
                      alt={`${product.name} miniatura ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Visor de Foto Grande con Zoom */}
              <div className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-muted/20 border border-border/60 group">
                <Image
                  src={galleryImages[selectedImageIndex]}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badge de Stock o Descuento */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  {wholesaleDiscountPct > 0 && (
                    <span className="px-3 py-1 rounded-md bg-[#D4A017] text-white text-xs font-black tracking-wider shadow-sm uppercase font-gotham">
                      -{wholesaleDiscountPct}% al Mayor
                    </span>
                  )}
                  {product.featured && (
                    <span className="px-2.5 py-0.5 rounded-md bg-[#E63946] text-white text-[11px] font-bold tracking-wide shadow-sm">
                      MÁS VENDIDO
                    </span>
                  )}
                </div>

                {/* Botón Flotante de Favorito */}
                <button
                  onClick={() => {
                    const added = toggleFavorite(product.id);
                    if (added) {
                      toast.success('Guardado en favoritos', { description: product.name });
                    } else {
                      toast.info('Eliminado de favoritos', { description: product.name });
                    }
                  }}
                  className={`absolute top-3 right-3 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-md ${
                    isFav
                      ? 'bg-[#E63946] text-white shadow-[#E63946]/30'
                      : 'bg-background/90 text-[#6C757D] hover:text-[#E63946]'
                  }`}
                  title={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                >
                  <Icons.heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* COLUMNA 2: Información Central del Producto (6 columnas) */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                {/* Renglón Superior: Estado y Reputación */}
                <div className="flex items-center gap-2 text-xs text-[#6C757D] mb-2">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Nuevo</span>
                  <span>•</span>
                  <span>+500 vendidos</span>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-[#D4A017]">
                    <Icons.star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold">4.9</span>
                    <span className="text-[#6C757D]">(128 opiniones)</span>
                  </div>
                </div>

                {/* Título del Producto */}
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight tracking-tight">
                  {product.name}
                </h1>

                {/* SKU y Categoría */}
                <div className="flex items-center gap-3 mt-2 text-xs text-[#6C757D]">
                  <span>Código SKU: <strong className="font-mono text-foreground">{product.sku}</strong></span>
                  <span>•</span>
                  <span>Rubro: <strong className="text-[#E63946]">{product.category_name}</strong></span>
                </div>

                {/* BLOQUE DE PRECIOS MERCADO LIBRE DUAL (Detal vs Mayor) */}
                <div className="mt-5 p-4 rounded-2xl bg-muted/40 border border-border/80">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                      {formatPrice(activeUnitPrice)}
                    </span>
                    <span className="text-xs text-[#6C757D] font-medium">
                      por {product.unit} ({qualifiesForWholesale ? 'Precio Mayorista' : 'Precio al Detal'})
                    </span>
                  </div>

                  {/* Comparativa Detal vs Mayor */}
                  <div className="mt-3 pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-card border border-border/60">
                      <span className="text-[#6C757D] block text-[11px]">Venta al Detal (1 a {product.min_wholesale_qty - 1} u.):</span>
                      <strong className="text-base text-foreground font-bold">{formatPrice(product.retail_price)}</strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017]">
                      <span className="block text-[11px] font-semibold">Venta al Mayor ({product.min_wholesale_qty}+ u.):</span>
                      <div className="flex items-center justify-between">
                        <strong className="text-base font-bold text-foreground">{formatPrice(product.wholesale_price)}</strong>
                        <span className="px-2 py-0.5 rounded-md bg-[#D4A017] text-white text-[10px] font-black uppercase">
                          -{wholesaleDiscountPct}% OFF
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Aviso de Cuotas y Medios de Pago */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Icons.creditCard className="w-4 h-4 shrink-0" />
                    <span>Mercado Pago, cuotas con tarjeta o 10% OFF por Transferencia (CBU / Alias).</span>
                  </div>
                </div>

                {/* SELECTOR DE VARIANTES / COLOR */}
                <div className="mt-6">
                  <span className="text-xs font-bold text-foreground block mb-2">
                    Color / Modelo: <strong className="text-[#E63946]">{selectedVariantColor}</strong>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {['Negro Mate', 'Azul Marino', 'Rosa Pastel', 'Blanco'].map((col) => (
                      <button
                        key={col}
                        onClick={() => setSelectedVariantColor(col)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          selectedVariantColor === col
                            ? 'bg-[#E63946] text-white border-[#E63946] shadow-sm'
                            : 'bg-card border-border hover:bg-muted text-foreground'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CAJA DE COMPRA (BUY BOX MERCADO LIBRE) */}
                <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-card border-2 border-border/80 shadow-md">
                  
                  {/* Estado de Stock */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${isOutOfStock ? 'bg-[#6C757D]' : 'bg-emerald-500 animate-pulse'}`} />
                      <span className="text-sm font-bold text-foreground">
                        {isOutOfStock ? 'Stock Agotado' : 'Stock Disponible en Depósito'}
                      </span>
                    </div>
                    <span className="text-xs text-[#6C757D]">
                      ({product.stock} disponibles)
                    </span>
                  </div>

                  {/* Selector de Cantidad con Ayuda de Ahorro Mayorista */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-foreground">Cantidad:</label>
                      <span className="text-xs text-[#6C757D]">
                        Umbral Mayorista: <strong className="text-[#D4A017]">{product.min_wholesale_qty} unid.</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-xl border border-border/80 bg-muted/40 p-1">
                        <button
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1 || isOutOfStock}
                          className="w-9 h-9 rounded-lg hover:bg-card flex items-center justify-center text-foreground disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          <Icons.minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                          min={1}
                          max={product.stock}
                          className="w-14 text-center font-bold text-sm bg-transparent outline-none text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => handleQuantityChange(quantity + 1)}
                          disabled={quantity >= product.stock || isOutOfStock}
                          className="w-9 h-9 rounded-lg hover:bg-card flex items-center justify-center text-foreground disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          <Icons.add className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Notificación de ahorro activo */}
                      <div className="flex-1 text-xs">
                        {qualifiesForWholesale ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
                            <Icons.badgeCheck className="w-4 h-4" />
                            ¡Precio Mayorista Activado! Ahorras {formatPrice(savings)}
                          </span>
                        ) : (
                          <span className="text-[#6C757D]">
                            Agrega <strong>{product.min_wholesale_qty - quantity} más</strong> para precio mayorista.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botones de Compra Primarios */}
                  <div className="flex flex-col gap-2.5">
                    {/* Botón Comprar por WhatsApp (Directo) */}
                    <button
                      onClick={handleBuyNowWhatsApp}
                      disabled={isOutOfStock}
                      className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-muted disabled:text-[#6C757D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <Icons.whatsapp className="w-5 h-5" />
                      <span>Comprar Ahora por WhatsApp</span>
                    </button>

                    {/* Botón Agregar al Carrito */}
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className="w-full h-12 rounded-xl bg-[#E63946] hover:bg-[#d62839] disabled:bg-muted disabled:text-[#6C757D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#E63946]/20 transition-all cursor-pointer"
                    >
                      <Icons.cart className="w-5 h-5" />
                      <span>Agregar al Carrito • {formatPrice(subtotal)}</span>
                    </button>
                  </div>

                  {/* Beneficios de Compra Protegida */}
                  <div className="mt-5 pt-4 border-t border-border/60 space-y-2.5 text-xs text-[#6C757D]">
                    <div className="flex items-start gap-2.5">
                      <Icons.truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-foreground">Envíos a todo el país:</strong>
                        <p className="text-[11px] leading-snug">Despachos por expreso al interior, Andreani o retiro en depósito.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Icons.shieldCheck className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-foreground">Compra Protegida JG Store:</strong>
                        <p className="text-[11px] leading-snug">Garantía oficial y control de calidad previo al empaque.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* SECCIÓN INFERIOR: Descripción Detallada y Especificaciones */}
          <div className="mt-12 pt-8 border-t border-border/80 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Descripción Extensa */}
            <div className="lg:col-span-8">
              <h2 className="text-xl font-bold text-foreground mb-4 font-gotham">
                Descripción del Producto
              </h2>
              <div className="prose dark:prose-invert max-w-none text-sm text-[#6C757D] leading-relaxed space-y-4">
                <p>{product.description}</p>
                <p>
                  Producto original distribuido por <strong>JG Store Polirubro</strong>. Diseñado con altos estándares de resistencia, durabilidad y funcionalidad para el consumidor final y comerciantes revendedores.
                </p>
                
                <h3 className="text-base font-bold text-foreground pt-2">Ventajas Principales:</h3>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                  <li>Calidad garantizada bajo control de inventario físico.</li>
                  <li>Doble escala de precios: compra por unidad o por bulto mayorista.</li>
                  <li>Atención comercial directa y personalizada vía WhatsApp.</li>
                  <li>Embalaje reforzado para protección durante el transporte.</li>
                </ul>
              </div>
            </div>

            {/* Ficha Técnica / Características */}
            <div className="lg:col-span-4">
              <h2 className="text-lg font-bold text-foreground mb-4 font-gotham">
                Características Técnicas
              </h2>
              <div className="rounded-xl border border-border/80 overflow-hidden divide-y divide-border/60 text-xs">
                <div className="flex justify-between p-3 bg-muted/30">
                  <span className="text-[#6C757D]">SKU Oficial</span>
                  <span className="font-mono font-bold text-foreground">{product.sku}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-[#6C757D]">Rubro</span>
                  <span className="font-semibold text-foreground">{product.category_name}</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/30">
                  <span className="text-[#6C757D]">Unidad de Venta</span>
                  <span className="font-semibold text-foreground capitalize">{product.unit}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-[#6C757D]">Mínimo Mayorista</span>
                  <span className="font-bold text-[#D4A017]">{product.min_wholesale_qty} unidades</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/30">
                  <span className="text-[#6C757D]">Disponibilidad</span>
                  <span className="font-semibold text-emerald-600">{product.stock} en depósito</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-[#6C757D]">Garantía</span>
                  <span className="font-semibold text-foreground">30 días de fábrica</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* SECCIÓN RELACIONADOS: Quienes vieron este producto también compraron */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground font-gotham">
                Quienes vieron este producto también compraron
              </h2>
              <Link href="/" className="text-xs font-semibold text-[#E63946] hover:underline">
                Ver más en {product.category_name} →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.slice(0, 4).map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  onQuickView={() => {}}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
