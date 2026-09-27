'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { useCartStore } from '@/hooks/use-cart-store';

interface HeroCarouselProps {
  onExploreCatalog: () => void;
}

interface SlideItem {
  id: string;
  badgeText: string;
  badgeEmoji: string;
  badgeStyle: string;
  titleLight: string;
  titleHighlight: string;
  titleSuffix?: string;
  description: string;
  ctaPrimaryText: string;
  ctaPrimaryAction: 'explore' | 'wholesale';
  ctaSecondaryText?: string;
  ctaSecondaryAction?: 'explore' | 'wholesale';
  image: string;
  accentColor: string;
}

const SLIDES: SlideItem[] = [
  {
    id: 'mayorista',
    badgeText: 'Polirrubro Mayorista & Minorista • República Argentina',
    badgeEmoji: '🇦🇷',
    badgeStyle: 'bg-[#D4A017]/20 border-[#D4A017]/40 text-[#D4A017]',
    titleLight: 'Precios Directos de Distribución',
    titleHighlight: 'al Detal y al Mayor',
    description:
      'Comprá desde 1 unidad al detal o desbloqueá tarifas mayoristas automáticas al superar $ 50.000 ARS en tu canasta. Stock físico en depósito.',
    ctaPrimaryText: 'Explorar Catálogo',
    ctaPrimaryAction: 'explore',
    ctaSecondaryText: 'Ver Precios al Mayor',
    ctaSecondaryAction: 'wholesale',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&auto=format&fit=crop&q=80',
    accentColor: '#D4A017'
  },
  {
    id: 'temporada',
    badgeText: 'Nueva Temporada 2026 • 24 Departamentos',
    badgeEmoji: '🔥',
    badgeStyle: 'bg-[#E63946]/20 border-[#E63946]/40 text-[#FF85A2]',
    titleLight: 'Novedades en Bazar,',
    titleHighlight: 'Aromatización & Deco',
    description:
      'Llegaron los nuevos difusores de varillas, vasos térmicos de acero, organizadores 360° y juguetes con escala de precios por volumen.',
    ctaPrimaryText: 'Ver Novedades',
    ctaPrimaryAction: 'explore',
    ctaSecondaryText: 'Tarifas por Bulto',
    ctaSecondaryAction: 'wholesale',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&auto=format&fit=crop&q=80',
    accentColor: '#E63946'
  },
  {
    id: 'envios',
    badgeText: 'Logística Nacional • Despachos Diarios',
    badgeEmoji: '🚚',
    badgeStyle: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
    titleLight: 'Envíos a Todo el País por',
    titleHighlight: 'Andreani & Expresos',
    description:
      'Despachamos tu pedido embalado y precintado. Entrega en transporte de tu elección en CABA/GBA o envío puerta a puerta a cualquier provincia.',
    ctaPrimaryText: 'Hacer mi Pedido',
    ctaPrimaryAction: 'explore',
    ctaSecondaryText: 'Cotizar por WhatsApp',
    ctaSecondaryAction: 'explore',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1600&auto=format&fit=crop&q=80',
    accentColor: '#3B82F6'
  },
  {
    id: 'pagos',
    badgeText: 'Medios de Pago • Ahorro Asegurado',
    badgeEmoji: '💳',
    badgeStyle: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    titleLight: '10% de Descuento por',
    titleHighlight: 'Transferencia CBU / Alias',
    description:
      'Aboná con CBU/CVU para obtener 10% de descuento directo en tu orden, o pagá en cuotas con Mercado Pago. Emitimos Factura A y Factura B.',
    ctaPrimaryText: 'Aprovechar 10% OFF',
    ctaPrimaryAction: 'explore',
    ctaSecondaryText: 'Ver Modo Mayorista',
    ctaSecondaryAction: 'wholesale',
    image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1600&auto=format&fit=crop&q=80',
    accentColor: '#10B981'
  }
];

export function HeroCarousel({ onExploreCatalog }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { wholesaleMode, toggleWholesaleMode } = useCartStore();
  
  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Autoplay timer (5 segundos)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      nextSlide();
    } else if (distance < -50) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const current = SLIDES[currentSlide];

  return (
    <div className="relative border-b border-border/60 bg-background transition-colors duration-200">
      {/* Carrusel Principal */}
      <div
        className="relative w-full overflow-hidden min-h-[380px] sm:min-h-[440px] md:min-h-[480px] lg:min-h-[520px] flex items-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Fondo de Imágenes con transición suave */}
        {SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
              }`}
            >
              {/* Imagen con Next.js Image (unoptimized para evitar timeouts de proxy del servidor) */}
              <Image
                src={slide.image}
                alt={slide.titleLight}
                fill
                priority={index === 0}
                unoptimized
                className="object-cover object-center transform scale-105 transition-transform duration-10000 ease-out"
              />
              {/* Gradiente oscuro superpuesto para garantizar legibilidad perfecta */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/40 dark:from-[#09090b]/95 dark:via-[#09090b]/80 dark:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
            </div>
          );
        })}

        {/* Contenido del Slide Activo */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
          <div className="max-w-2xl text-left">
            {/* Badge de la diapositiva */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-4 backdrop-blur-md transition-all duration-300 ${current.badgeStyle}`}
            >
              <span className="text-base leading-none">{current.badgeEmoji}</span>
              <span className="font-gotham">{current.badgeText}</span>
            </div>

            {/* Título Display con Bebas Neue Cyrillic */}
            <h1 className="font-bebas text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide text-white leading-[0.98] drop-shadow-md">
              {current.titleLight}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF85A2] via-[#E63946] to-[#D4A017]">
                {current.titleHighlight}
              </span>
            </h1>

            {/* Descripción con Gotham */}
            <p className="mt-4 text-sm sm:text-base text-gray-200 dark:text-gray-300 max-w-xl leading-relaxed font-gotham drop-shadow-sm">
              {current.description}
            </p>

            {/* Botones de Acción */}
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4 font-gotham">
              <button
                onClick={onExploreCatalog}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white font-semibold text-sm shadow-lg shadow-[#E63946]/35 hover:shadow-xl hover:shadow-[#E63946]/50 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Icons.product className="w-4 h-4" />
                <span>{current.ctaPrimaryText}</span>
              </button>

              <button
                onClick={toggleWholesaleMode}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border backdrop-blur-md transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 ${
                  wholesaleMode
                    ? 'bg-[#D4A017] border-[#D4A017] text-black shadow-lg shadow-[#D4A017]/30 ring-2 ring-[#D4A017]/50'
                    : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                }`}
              >
                <Icons.tags className="w-4 h-4" />
                <span>
                  {wholesaleMode ? '✓ Modo Mayorista Activo' : current.ctaSecondaryText}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Flechas de Navegación Izquierda / Derecha */}
        <button
          onClick={prevSlide}
          aria-label="Diapositiva anterior"
          className="absolute left-2 sm:left-4 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/40 hover:bg-[#E63946] text-white border border-white/10 backdrop-blur-sm flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-md"
        >
          <Icons.chevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Siguiente diapositiva"
          className="absolute right-2 sm:right-4 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/40 hover:bg-[#E63946] text-white border border-white/10 backdrop-blur-sm flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-md"
        >
          <Icons.chevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Indicadores de diapositiva (Pills) en la parte inferior */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
          {SLIDES.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Ir a diapositiva ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'w-8 bg-gradient-to-r from-[#E63946] to-[#D4A017] shadow-sm'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* 4 Pilares de Confianza de JG Store */}
      <div className="bg-card/50 backdrop-blur-xs py-4 px-4 sm:px-6 lg:px-8 border-t border-border/40">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 font-gotham">
          <div className="p-3 rounded-xl bg-card border border-border/70 flex items-start gap-2.5 shadow-xs hover:border-[#D4A017]/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#D4A017]/10 text-[#D4A017] flex items-center justify-center shrink-0">
              <Icons.tags className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Tarifa Mayorista</h4>
              <p className="text-[11px] text-[#6C757D] mt-0.5 leading-snug">
                Automática a partir de $ 50.000 o por bulto.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/70 flex items-start gap-2.5 shadow-xs hover:border-[#E63946]/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#E63946]/10 text-[#E63946] flex items-center justify-center shrink-0">
              <Icons.package className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Stock en Depósito</h4>
              <p className="text-[11px] text-[#6C757D] mt-0.5 leading-snug">
                Inventario real en 24 departamentos.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/70 flex items-start gap-2.5 shadow-xs hover:border-emerald-500/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Icons.check className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Mercado Pago & CBU</h4>
              <p className="text-[11px] text-[#6C757D] mt-0.5 leading-snug">
                10% OFF por transferencia bancaria.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/70 flex items-start gap-2.5 shadow-xs hover:border-blue-500/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Icons.truck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Envíos a Todo el País</h4>
              <p className="text-[11px] text-[#6C757D] mt-0.5 leading-snug">
                Andreani, Correo Arg. y Expresos de carga.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
