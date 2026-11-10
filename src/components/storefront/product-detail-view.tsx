'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StoreProduct } from '@/types/store';
import { formatPrice, JG_STORE_WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { useCartStore } from '@/hooks/use-cart-store';
import { useFavoritesStore } from '@/hooks/use-favorites-store';
import { useStoreConfigStore } from '@/hooks/use-store-config-store';
import { STORE_VISIBILITY } from '@/config/visibility.config';
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
  const [isBuyingNow, setIsBuyingNow] = useState<boolean>(false);

  // Galería de imágenes reales del producto
  const galleryImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [
          product.image_url ||
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
        ];

  // Cálculos de precios (B2B vs B2C)
  const isOutOfStock = product.stock <= 0;
  const qualifiesForWholesale = STORE_VISIBILITY.showWholesalePrices && quantity >= product.min_wholesale_qty;
  const activeUnitPrice = qualifiesForWholesale ? product.wholesale_price : product.retail_price;
  const subtotal = Number((activeUnitPrice * quantity).toFixed(2));
  const retailSubtotal = Number((product.retail_price * quantity).toFixed(2));
  const savings = Number((retailSubtotal - subtotal).toFixed(2));
  const wholesaleDiscountPct = Math.round(
    ((product.retail_price - product.wholesale_price) / product.retail_price) * 100
  );

  const paymentPromoText =
    useStoreConfigStore((s) => s.landing.paymentPromoText) ||
    'Cualquier tipo de pago • 3 cuotas sin interés con tarjeta • 10% OFF por transferencia';
  const transferDiscountPct = useStoreConfigStore((s) => s.landing.transferDiscountPct) ?? 10;
  const showPaymentPromo = useStoreConfigStore((s) => s.landing.showPaymentPromo) ?? true;
  const transferPrice = Number((activeUnitPrice * (1 - transferDiscountPct / 100)).toFixed(2));

  // Manejadores
  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1) return;
    if (newQty > product.stock) {
      toast.error(
        STORE_VISIBILITY.showLowStockAlerts
          ? `Solo quedan ${product.stock} unidades en stock.`
          : 'Stock máximo disponible alcanzado.'
      );
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

  const handleBuyNowWhatsApp = async () => {
    if (isOutOfStock || isBuyingNow) return;
    setIsBuyingNow(true);

    let orderNumber = `JG-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              product,
              quantity,
              unit_price: activeUnitPrice,
              is_wholesale: qualifiesForWholesale,
              subtotal,
              savings
            }
          ],
          customer: {
            name: 'Cliente Consulta Web Directa',
            phone: '+54 9 11 (WhatsApp)',
            delivery_type: 'shipping',
            invoice_type: qualifiesForWholesale ? 'A' : 'B'
          },
          notes: `Compra directa desde detalle de producto: ${product.name} (Cant: ${quantity})`
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.order?.order_number) {
          orderNumber = data.order.order_number;
        }
      }
    } catch (err) {
      console.warn('Error al persistir orden rápida en backend:', err);
    } finally {
      setIsBuyingNow(false);
    }

    const pricingTag = STORE_VISIBILITY.showWholesalePrices ? ` (${qualifiesForWholesale ? 'Mayorista' : 'Detal'})` : '';
    const savingsTag = STORE_VISIBILITY.showWholesalePrices && savings > 0 ? `\n🎉 Ahorro Mayorista: ${formatPrice(savings)}` : '';
    const directMessage = `¡Hola JG Store! Quiero comprar ahora este producto:\n\n📋 *Pedido Oficial:* #${orderNumber}\n📦 *${product.name}*\n🔢 SKU: ${product.sku}\n📊 Cantidad: ${quantity} ${product.unit}(s)\n💰 Precio unitario: ${formatPrice(activeUnitPrice)}${pricingTag}\n💵 Total estimado: ${formatPrice(subtotal)}${savingsTag}\n\n¿Tienen disponibilidad para coordinar el pago y envío?`;
    const cleanPhone = (whatsappNumber || JG_STORE_WHATSAPP_NUMBER).replace(/[^0-9]/g, '');
    const cleanMessage = directMessage.replace(/\uFE0F/g, '');
    const url = `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(cleanMessage)}`;
    window.open(url, '_blank');
    toast.success(`Pedido #${orderNumber} registrado con éxito.`);
  };

  return (
    <div className='min-h-screen bg-muted/40 py-6 sm:py-8 font-gotham'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Breadcrumb estilo Mercado Libre con soporte de 3 niveles */}
        <nav className='flex items-center gap-2 text-xs text-[#6C757D] mb-4 overflow-x-auto whitespace-nowrap'>
          <Link href='/' className='hover:text-[#E63946] flex items-center gap-1'>
            <Icons.chevronLeft className='w-3.5 h-3.5' />
            <span>Volver al catálogo</span>
          </Link>
          <span className='text-border'>/</span>
          <Link href='/' className='hover:text-[#E63946]'>
            Inicio
          </Link>
          <span className='text-border'>/</span>
          <Link
            href={`/?category=${product.category_slug}`}
            className='hover:text-[#E63946] font-medium'
          >
            {product.category_name}
          </Link>
          {product.subcategory_name && (
            <>
              <span className='text-border'>/</span>
              <span className='text-[#6C757D] font-medium'>{product.subcategory_name}</span>
            </>
          )}
          {product.sub_subcategory_name && (
            <>
              <span className='text-border'>/</span>
              <span className='text-[#6C757D] font-medium'>{product.sub_subcategory_name}</span>
            </>
          )}
          <span className='text-border'>/</span>
          <span className='font-semibold text-foreground truncate max-w-xs'>{product.name}</span>
        </nav>

        {/* CONTENEDOR PRINCIPAL: Tarjeta Blanca Estilo Mercado Libre */}
        <div className='bg-card rounded-2xl border border-border/80 shadow-sm p-4 sm:p-6 lg:p-8'>
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10'>
            {/* COLUMNA 1: Galería de Miniaturas y Foto Principal (5 columnas) */}
            <div className='lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4'>
              {/* Tira de Miniaturas verticales */}
              <div className='flex sm:flex-col gap-2 shrink-0 overflow-x-auto sm:overflow-visible'>
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 overflow-hidden transition-all cursor-pointer bg-white dark:bg-card p-1 ${
                      selectedImageIndex === idx
                        ? 'border-[#E63946] ring-2 ring-[#E63946]/20'
                        : 'border-border/80 hover:border-[#6C757D]'
                    }`}
                  >
                    <div className='relative w-full h-full'>
                      <Image
                        src={imgUrl}
                        alt={`${product.name} miniatura ${idx + 1}`}
                        fill
                        sizes='64px'
                        className='object-contain'
                      />
                    </div>
                  </button>
                ))}
              </div>

              {/* Visor de Foto Grande Proporcional (Sin deformar ni cortar la imagen) */}
              <div className='relative flex-1 aspect-square rounded-2xl overflow-hidden bg-white dark:bg-card border border-border/60 group p-4 sm:p-6 flex items-center justify-center'>
                <div className='relative w-full h-full'>
                  <Image
                    src={galleryImages[selectedImageIndex]}
                    alt={product.name}
                    fill
                    priority
                    sizes='(max-width: 1024px) 100vw, 50vw'
                    className='object-contain transition-transform duration-300 group-hover:scale-105'
                  />
                </div>

                {/* Badge de Stock o Descuento */}
                <div className='absolute top-3 left-3 flex flex-col gap-1.5 z-10'>
                  {STORE_VISIBILITY.showWholesalePrices && wholesaleDiscountPct > 0 && (
                    <span className='px-3 py-1 rounded-md bg-[#D4A017] text-white text-xs font-black tracking-wider shadow-sm uppercase font-gotham'>
                      -{wholesaleDiscountPct}% al Mayor
                    </span>
                  )}
                  {product.featured && (
                    <span className='px-2.5 py-0.5 rounded-md bg-[#E63946] text-white text-[11px] font-bold tracking-wide shadow-sm'>
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
                  title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                >
                  <Icons.heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* COLUMNA 2: Información Central del Producto (6 columnas) */}
            <div className='lg:col-span-6 flex flex-col justify-between'>
              <div>
                {/* Renglón Superior: Estado */}
                <div className='flex items-center gap-2 text-xs text-[#6C757D] mb-2'>
                  <span className='font-semibold text-emerald-600 dark:text-emerald-400'>
                    Nuevo
                  </span>
                </div>

                {/* Título del Producto */}
                <h1 className='text-2xl sm:text-3xl font-bold text-foreground leading-tight tracking-tight'>
                  {product.name}
                </h1>

                {/* Categoría y Código de Barras */}
                <div className='flex flex-wrap items-center gap-3 mt-2 text-xs text-[#6C757D]'>
                  <span>
                    Rubro: <strong className='text-[#E63946]'>{product.category_name}</strong>
                  </span>
                  {product.barcode && (
                    <>
                      <span>•</span>
                      <span className='inline-flex items-center gap-1 font-mono'>
                        <Icons.barcode className='w-3.5 h-3.5 text-foreground/70' />
                        EAN: <strong className='text-foreground'>{product.barcode}</strong>
                      </span>
                    </>
                  )}
                </div>

                {/* BLOQUE DE PRECIOS */}
                <div className='mt-5 p-4 rounded-2xl bg-muted/40 border border-border/80'>
                  <div className='flex items-baseline gap-3'>
                    <span className='text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight'>
                      {formatPrice(activeUnitPrice)}
                    </span>
                    <span className='text-xs text-[#6C757D] font-medium'>
                      por {product.unit}
                      {STORE_VISIBILITY.showWholesalePrices && (
                        <span> ({qualifiesForWholesale ? 'Precio Mayorista' : 'Precio al Detal'})</span>
                      )}
                    </span>
                  </div>

                  {/* Comparativa Detal vs Mayor si está habilitada */}
                  {STORE_VISIBILITY.showWholesalePrices && (
                    <div className='mt-3 pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs'>
                      <div className='p-2.5 rounded-xl bg-card border border-border/60'>
                        <span className='text-[#6C757D] block text-[11px]'>
                          Venta al Detal (1 a {product.min_wholesale_qty - 1} u.):
                        </span>
                        <strong className='text-base text-foreground font-bold'>
                          {formatPrice(product.retail_price)}
                        </strong>
                      </div>

                      <div className='p-2.5 rounded-xl bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017]'>
                        <span className='block text-[11px] font-semibold'>
                          Venta al Mayor ({product.min_wholesale_qty}+ u.):
                        </span>
                        <div className='flex items-center justify-between'>
                          <strong className='text-base font-bold text-foreground'>
                            {formatPrice(product.wholesale_price)}
                          </strong>
                          <span className='px-2 py-0.5 rounded-md bg-[#D4A017] text-white text-[10px] font-black uppercase'>
                            -{wholesaleDiscountPct}% OFF
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Aviso de Cuotas y Medios de Pago Dinámico */}
                  {showPaymentPromo && (
                    <div className='mt-3 pt-3 border-t border-border/60 space-y-1.5'>
                      <div className='flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold'>
                        <Icons.creditCard className='w-4 h-4 shrink-0 text-emerald-500' />
                        <span>{paymentPromoText}</span>
                      </div>
                      {transferDiscountPct > 0 && (
                        <div className='flex items-center gap-2 text-xs'>
                          <span className='text-[#6C757D]'>Abonando por transferencia:</span>
                          <strong className='font-bold text-emerald-600 dark:text-emerald-400 text-sm font-mono'>
                            {formatPrice(transferPrice)}
                          </strong>
                          <span className='px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 uppercase'>
                            {transferDiscountPct}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>


                {/* CAJA DE COMPRA (BUY BOX) */}
                <div className='mt-6 p-4 sm:p-5 rounded-2xl bg-card border-2 border-border/80 shadow-md'>
                  {/* Estado de Stock */}
                  <div className='flex items-center justify-between mb-4 pb-3 border-b border-border/60'>
                    <div className='flex items-center gap-2'>
                      <span
                        className={`w-3 h-3 rounded-full ${isOutOfStock ? 'bg-[#6C757D]' : 'bg-emerald-500 animate-pulse'}`}
                      />
                      <span className='text-sm font-bold text-foreground'>
                        {isOutOfStock ? 'Stock Agotado' : 'Stock Disponible'}
                      </span>
                    </div>
                    {STORE_VISIBILITY.showExactStockNumbers && (
                      <span className='text-xs text-[#6C757D]'>({product.stock} disponibles)</span>
                    )}
                  </div>

                  {/* Selector de Cantidad */}
                  <div className='mb-5'>
                    <div className='flex items-center justify-between mb-1.5'>
                      <label className='text-xs font-bold text-foreground'>Cantidad:</label>
                      {STORE_VISIBILITY.showWholesalePrices && (
                        <span className='text-xs text-[#6C757D]'>
                          Umbral Mayorista:{' '}
                          <strong className='text-[#D4A017]'>
                            {product.min_wholesale_qty} unid.
                          </strong>
                        </span>
                      )}
                    </div>

                    <div className='flex items-center gap-3'>
                      <div className='flex items-center rounded-xl border border-border/80 bg-muted/40 p-1'>
                        <button
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1 || isOutOfStock}
                          className='w-9 h-9 rounded-lg hover:bg-card flex items-center justify-center text-foreground disabled:opacity-40 transition-colors cursor-pointer'
                        >
                          <Icons.minus className='w-4 h-4' />
                        </button>
                        <input
                          type='number'
                          value={quantity}
                          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                          min={1}
                          max={product.stock}
                          className='w-14 text-center font-bold text-sm bg-transparent outline-none text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                        />
                        <button
                          onClick={() => handleQuantityChange(quantity + 1)}
                          disabled={quantity >= product.stock || isOutOfStock}
                          className='w-9 h-9 rounded-lg hover:bg-card flex items-center justify-center text-foreground disabled:opacity-40 transition-colors cursor-pointer'
                        >
                          <Icons.add className='w-4 h-4' />
                        </button>
                      </div>

                      {/* Notificación de ahorro activo (solo si modo mayorista está activo) */}
                      {STORE_VISIBILITY.showWholesalePrices && (
                        <div className='flex-1 text-xs'>
                          {qualifiesForWholesale ? (
                            <span className='inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20'>
                              <Icons.badgeCheck className='w-4 h-4' />
                              ¡Precio Mayorista Activado! Ahorras {formatPrice(savings)}
                            </span>
                          ) : (
                            <span className='text-[#6C757D]'>
                              Agrega <strong>{product.min_wholesale_qty - quantity} más</strong> para
                              precio mayorista.
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botones de Compra Primarios */}
                  <div className='flex flex-col gap-2.5'>
                    {/* Botón Comprar por WhatsApp (Directo) */}
                    <button
                      onClick={handleBuyNowWhatsApp}
                      disabled={isOutOfStock || isBuyingNow}
                      className='w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-muted disabled:text-[#6C757D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer'
                    >
                      {isBuyingNow ? (
                        <Icons.spinner className='w-5 h-5 animate-spin' />
                      ) : (
                        <Icons.whatsapp className='w-5 h-5' />
                      )}
                      <span>
                        {isBuyingNow ? 'Generando Pedido...' : 'Comprar Ahora por WhatsApp'}
                      </span>
                    </button>

                    {/* Botón Agregar al Carrito */}
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className='w-full h-12 rounded-xl bg-[#E63946] hover:bg-[#d62839] disabled:bg-muted disabled:text-[#6C757D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#E63946]/20 transition-all cursor-pointer'
                    >
                      <Icons.cart className='w-5 h-5' />
                      <span>Agregar al Carrito • {formatPrice(subtotal)}</span>
                    </button>
                  </div>

                  {/* Beneficios de Compra Protegida */}
                  <div className='mt-5 pt-4 border-t border-border/60 space-y-2.5 text-xs text-[#6C757D]'>
                    <div className='flex items-start gap-2.5'>
                      <Icons.truck className='w-4 h-4 text-emerald-600 shrink-0 mt-0.5' />
                      <div>
                        <strong className='text-foreground'>Envíos a todo el país:</strong>
                        <p className='text-[11px] leading-snug'>
                          Despachos por expreso al interior, Andreani o retiro en depósito.
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start gap-2.5'>
                      <Icons.shieldCheck className='w-4 h-4 text-[#D4A017] shrink-0 mt-0.5' />
                      <div>
                        <strong className='text-foreground'>Compra Protegida JG Store:</strong>
                        <p className='text-[11px] leading-snug'>
                          Garantía oficial y control de calidad previo al empaque.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN INFERIOR: Descripción Detallada y Especificaciones */}
          <div className='mt-12 pt-8 border-t border-border/80 grid grid-cols-1 lg:grid-cols-12 gap-8'>
            {/* Descripción Extensa */}
            <div className='lg:col-span-8'>
              <h2 className='text-xl font-bold text-foreground mb-4 font-gotham'>
                Descripción del Producto
              </h2>
              <div className='prose dark:prose-invert max-w-none text-sm text-[#6C757D] leading-relaxed space-y-4'>
                <p>{product.description}</p>
                <p>
                  Producto original distribuido por <strong>JG Store Polirubro</strong>. Diseñado
                  con altos estándares de resistencia, durabilidad y funcionalidad para el
                  consumidor final y comerciantes revendedores.
                </p>

                <h3 className='text-base font-bold text-foreground pt-2'>Ventajas Principales:</h3>
                <ul className='list-disc pl-5 space-y-1 text-xs sm:text-sm'>
                  <li>Calidad garantizada bajo control de inventario físico.</li>
                  {STORE_VISIBILITY.showWholesalePrices && (
                    <li>Doble escala de precios: compra por unidad o por bulto mayorista.</li>
                  )}
                  <li>Atención comercial directa y personalizada vía WhatsApp.</li>
                  <li>Embalaje reforzado para protección durante el transporte.</li>
                </ul>
              </div>
            </div>

            {/* Ficha Técnica / Características */}
            <div className='lg:col-span-4'>
              <h2 className='text-lg font-bold text-foreground mb-4 font-gotham'>
                Características Técnicas
              </h2>
              <div className='rounded-xl border border-border/80 overflow-hidden divide-y divide-border/60 text-xs'>
                <div className='flex justify-between p-3'>
                  <span className='text-[#6C757D]'>Rubro</span>
                  <span className='font-semibold text-foreground'>{product.category_name}</span>
                </div>
                <div className='flex justify-between p-3 bg-muted/30'>
                  <span className='text-[#6C757D]'>Unidad de Venta</span>
                  <span className='font-semibold text-foreground capitalize'>{product.unit}</span>
                </div>
                {STORE_VISIBILITY.showWholesalePrices && (
                  <div className='flex justify-between p-3'>
                    <span className='text-[#6C757D]'>Mínimo Mayorista</span>
                    <span className='font-bold text-[#D4A017]'>
                      {product.min_wholesale_qty} unidades
                    </span>
                  </div>
                )}
                <div className='flex justify-between p-3 bg-muted/30'>
                  <span className='text-[#6C757D]'>Disponibilidad</span>
                  <span className='font-semibold text-emerald-600'>
                    {STORE_VISIBILITY.showExactStockNumbers
                      ? `${product.stock} en depósito`
                      : isOutOfStock
                      ? 'Sin stock'
                      : 'Stock disponible'}
                  </span>
                </div>
                <div className='flex justify-between p-3'>
                  <span className='text-[#6C757D]'>Garantía</span>
                  <span className='font-semibold text-foreground'>30 días de fábrica</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN RELACIONADOS: Quienes vieron este producto también compraron */}
        {relatedProducts.length > 0 && (
          <div className='mt-12'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl sm:text-2xl font-bold text-foreground font-gotham'>
                Quienes vieron este producto también compraron
              </h2>
              <Link href='/' className='text-xs font-semibold text-[#E63946] hover:underline'>
                Ver más en {product.category_name} →
              </Link>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'>
              {relatedProducts.slice(0, 4).map((rel) => (
                <ProductCard key={rel.id} product={rel} onQuickView={() => {}} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
