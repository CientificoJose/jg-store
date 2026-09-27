'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { useCartStore } from '@/hooks/use-cart-store';
import { JG_STORE_WHATSAPP_NUMBER } from '@/lib/whatsapp';

export interface CarouselSlide {
  id: string;
  tag: string;
  tagColor?: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  image: string;
  primaryActionLabel: string;
  primaryActionType: 'explore' | 'category' | 'wholesale' | 'whatsapp';
  categorySlug?: string;
  secondaryActionLabel: string;
  secondaryActionType: 'explore' | 'category' | 'wholesale' | 'whatsapp';
  features: string[];
}

export const SLIDES: CarouselSlide[] = [
  {
    id: 'slide-1',
    tag: '🇦🇷 DISTRIBUIDORA POLIRRUBRO • BUENOS AIRES',
    tagColor: '#E63946',
    title: 'COMPRÁ AL MAYOR',
    titleAccent: 'DESDE $ 50.000 ARS',
    subtitle:
      'Desbloqueá tarifas mayoristas en toda tu compra al alcanzar el monto global de $ 50.000 o comprando por bulto cerrado. Despachos a todo el país.',
    image:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&auto=format&fit=crop&q=80',
    primaryActionLabel: 'Explorar Catálogo',
    primaryActionType: 'explore',
    secondaryActionLabel: 'Activar Modo Mayorista',
    secondaryActionType: 'wholesale',
    features: ['Factura A con CUIT', 'Despacho por Expresos', 'Mínimo Mayorista $ 50.000']
  },
  {
    id: 'slide-2',
    tag: '✨ TENDENCIAS & TEMPORADA BAZAR',
    tagColor: '#D4A017',
    title: 'AROMATIZACIÓN, BAZAR',
    titleAccent: '& DECORACIÓN',
    subtitle:
      'Difusores varillas 250ml, velas aromáticas, vasos térmicos de acero y organizadores giratorios 360° con hasta 25% OFF llevando por docena.',
    image:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1600&auto=format&fit=crop&q=80',
    primaryActionLabel: 'Ver Aromatización & Velas',
    primaryActionType: 'category',
    categorySlug: 'aromatizacion-velas',
    secondaryActionLabel: 'Cotizar por WhatsApp',
    secondaryActionType: 'whatsapp',
    features: ['Hasta 25% OFF por Bulto', 'Fragancias Importadas', 'Stock Inmediato']
  },
  {
    id: 'slide-3',
    tag: '🎧 GADGETS & TECNOLOGÍA SMART',
    tagColor: '#FF85A2',
    title: 'AURICULARES & GADGETS',
    titleAccent: 'SMART DIGITAL',
    subtitle:
      'Auriculares inalámbricos Bluetooth JG Sound, termos digitales con pantalla LED touch y accesorios de última generación con garantía asegurada.',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
    primaryActionLabel: 'Ver Bazar & Gadgets',
    primaryActionType: 'category',
    categorySlug: 'bazar-cocina',
    secondaryActionLabel: 'Consultar Stock por WhatsApp',
    secondaryActionType: 'whatsapp',
    features: ['Sonido de Alta Fidelidad', 'Display Digital LED', 'Garantía Oficial JG']
  },
  {
    id: 'slide-4',
    tag: '💳 MEDIOS DE PAGO NACIONALES',
    tagColor: '#25D366',
    title: '10% DE DESCUENTO EN',
    titleAccent: 'TRANSFERENCIAS CBU / ALIAS',
    subtitle:
      'Aboná por CBU, CVU o Alias y obtené 10% OFF directo en tu orden. También podés pagar en cuotas con Mercado Pago y todas las tarjetas.',
    image:
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1600&auto=format&fit=crop&q=80',
    primaryActionLabel: 'Comprar con 10% OFF',
    primaryActionType: 'explore',
    secondaryActionLabel: 'Hablar con un Asesor',
    secondaryActionType: 'whatsapp',
    features: ['10% OFF Inmediato', 'Mercado Pago en Cuotas', 'Factura A y B AFIP']
  }
];

interface PromoCarouselProps {
  onExploreCatalog: () => void;
  onSelectCategory?: (category: string) => void;
}

export function PromoCarousel({ onExploreCatalog, onSelectCategory }: PromoCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { wholesaleMode, toggleWholesaleMode } = useCartStore();
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-play cada 5.5 segundos (pausa si el usuario tiene el cursor encima)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const handleAction = (type: string, categorySlug?: string) => {
    if (type === 'explore') {
      onExploreCatalog();
    } else if (type === 'category' && categorySlug) {
      if (onSelectCategory) {
        onSelectCategory(categorySlug);
      }
      onExploreCatalog();
    } else if (type === 'wholesale') {
      toggleWholesaleMode();
    } else if (type === 'whatsapp') {
      const url = `https://wa.me/${JG_STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
        '¡Hola JG Store! Vi los banners promocionales en la tienda y quiero hacer una consulta sobre precios mayoristas y catálogo.'
      )}`;
      window.open(url, '_blank');
    }
  };

  // Soporte para gestos táctiles
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  const slide = SLIDES[currentSlide];

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl border border-border/60 shadow-xl bg-card transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Contenedor Principal del Banner */}
      <div className="relative min-h-[360px] sm:min-h-[420px] md:min-h-[460px] lg:min-h-[490px] flex items-center">
        {/* Imágenes de Fondo con Transición Suave */}
        {SLIDES.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
            }`}
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              priority={idx === 0}
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1280px"
            />
            {/* Gradientes superpuestos para legibilidad y elegancia */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/30 md:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          </div>
        ))}

        {/* Contenido Textual del Slide Activo */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-10 md:py-14 text-white">
          <div className="max-w-2xl space-y-4">
            {/* Badge de la Promoción */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide font-gotham shadow-sm">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: slide.tagColor || '#E63946' }} />
              <span className="text-white/95">{slide.tag}</span>
            </div>

            {/* Título en Bebas Neue */}
            <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide leading-[0.98] drop-shadow-md">
              {slide.title}{' '}
              {slide.titleAccent && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF85A2] via-[#E63946] to-[#D4A017]">
                  {slide.titleAccent}
                </span>
              )}
            </h2>

            {/* Subtítulo */}
            <p className="text-xs sm:text-sm md:text-base text-white/85 font-gotham leading-relaxed max-w-xl drop-shadow-xs">
              {slide.subtitle}
            </p>

            {/* Lista de Beneficios del Slide */}
            <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
              {slide.features.map((feat, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-white/10 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/15 text-white/90"
                >
                  <Icons.check className="w-3 h-3 text-[#25D366]" />
                  {feat}
                </span>
              ))}
            </div>

            {/* Botones de Acción Interactivos */}
            <div className="pt-2 flex flex-wrap items-center gap-3 font-gotham">
              <button
                onClick={() => handleAction(slide.primaryActionType, slide.categorySlug)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#E63946]/40 hover:shadow-xl hover:shadow-[#E63946]/50 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Icons.product className="w-4 h-4" />
                <span>{slide.primaryActionLabel}</span>
              </button>

              <button
                onClick={() => handleAction(slide.secondaryActionType, slide.categorySlug)}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm backdrop-blur-md border transition-all cursor-pointer transform hover:-translate-y-0.5 ${
                  slide.secondaryActionType === 'wholesale' && wholesaleMode
                    ? 'bg-[#D4A017] border-[#D4A017] text-black font-bold shadow-lg shadow-[#D4A017]/30'
                    : 'bg-white/15 hover:bg-white/25 border-white/30 text-white'
                }`}
              >
                {slide.secondaryActionType === 'wholesale' ? (
                  <>
                    <Icons.tags className="w-4 h-4" />
                    <span>{wholesaleMode ? '✓ Tarifa Mayorista Activa' : slide.secondaryActionLabel}</span>
                  </>
                ) : (
                  <>
                    <Icons.whatsapp className="w-4 h-4 text-[#25D366] fill-current" />
                    <span>{slide.secondaryActionLabel}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Flecha Anterior (Left Arrow) */}
        <button
          onClick={prevSlide}
          aria-label="Banner anterior"
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-[#E63946] backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105"
        >
          <Icons.chevronLeft className="w-5 h-5" />
        </button>

        {/* Flecha Siguiente (Right Arrow) */}
        <button
          onClick={nextSlide}
          aria-label="Siguiente banner"
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-[#E63946] backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105"
        >
          <Icons.chevronRight className="w-5 h-5" />
        </button>

        {/* Indicador de Número de Slide (Esquina Superior Derecha) */}
        <div className="absolute top-4 right-5 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-mono text-white/80">
          <span className="font-bold text-white">0{currentSlide + 1}</span>
          <span>/</span>
          <span>0{SLIDES.length}</span>
        </div>

        {/* Barra de Indicadores / Paginación (Pills en la parte inferior) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Ir al slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide
                  ? 'w-8 bg-[#E63946] shadow-sm shadow-[#E63946]'
                  : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
