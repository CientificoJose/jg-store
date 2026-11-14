'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { useCartStore } from '@/hooks/use-cart-store';
import { JG_STORE_WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { STORE_VISIBILITY } from '@/config/visibility.config';

export { type CarouselSlide } from '@/types/banner';
import { type CarouselSlide, resolveBannerOverlay } from '@/types/banner';
import { FALLBACK_SLIDES } from '@/app/api/banners/route';

export const SLIDES: CarouselSlide[] = FALLBACK_SLIDES;

interface PromoCarouselProps {
  onExploreCatalog: () => void;
  onSelectCategory?: (category: string) => void;
}

export function PromoCarousel({ onExploreCatalog, onSelectCategory }: PromoCarouselProps) {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { wholesaleMode, toggleWholesaleMode } = useCartStore();
  const touchStartX = useRef<number | null>(null);

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch('/api/banners');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data);
          return;
        }
      }
      setSlides((prev) => (prev.length > 0 ? prev : SLIDES));
    } catch {
      // Fallback silencioso a las diapositivas locales solo si falla la red
      setSlides((prev) => (prev.length > 0 ? prev : SLIDES));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();

    const handleUpdate = () => fetchBanners();
    window.addEventListener('banners-updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('banners-updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, [fetchBanners]);

  const totalSlides = slides.length || 1;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Si currentSlide excede el número de diapositivas tras una edición, reajustar
  useEffect(() => {
    if (currentSlide >= totalSlides) {
      setCurrentSlide(0);
    }
  }, [currentSlide, totalSlides]);

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

  if (isLoading || slides.length === 0) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl border border-border/60 shadow-xl bg-card/40 backdrop-blur-md">
        <div className="relative min-h-[360px] sm:min-h-[420px] md:min-h-[460px] lg:min-h-[490px] flex items-center overflow-hidden">
          {/* Resplandor ambiental sutil */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#E63946]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#D4A017]/10 blur-3xl pointer-events-none" />

          {/* Isotipo fantasma JG Store en marca de agua */}
          <div className="absolute right-8 sm:right-14 bottom-8 w-28 h-28 sm:w-36 sm:h-36 opacity-[0.06] dark:opacity-[0.09] pointer-events-none animate-pulse">
            <Image
              src="/icon.png"
              alt="JG Store"
              width={144}
              height={144}
              className="w-full h-full object-contain grayscale"
              unoptimized
            />
          </div>

          {/* Esqueleto transparente pulsante */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-10 md:py-14">
            <div className="max-w-xl space-y-4">
              <div className="h-6 w-48 rounded-full bg-muted/50 border border-border/40 animate-pulse" />
              <div className="space-y-2.5">
                <div className="h-10 sm:h-14 w-3/4 rounded-xl bg-muted/50 animate-pulse" />
                <div className="h-10 sm:h-14 w-1/2 rounded-xl bg-muted/40 animate-pulse" />
              </div>
              <div className="space-y-2 pt-1">
                <div className="h-4 w-full max-w-md rounded-md bg-muted/40 animate-pulse" />
                <div className="h-4 w-2/3 max-w-sm rounded-md bg-muted/30 animate-pulse" />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="h-11 w-40 rounded-xl bg-[#E63946]/25 border border-[#E63946]/20 animate-pulse" />
                <div className="h-11 w-44 rounded-xl bg-muted/40 border border-border/40 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Paginación fantasma inferior */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/40 border border-border/40">
            <div className="h-2 w-8 rounded-full bg-[#E63946]/40 animate-pulse" />
            <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-pulse" />
            <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide] || slides[0] || SLIDES[0];
  const ov = resolveBannerOverlay(slide);
  const hasAnyContent =
    ov.showTag ||
    ov.showTitle ||
    ov.showSubtitle ||
    (ov.showFeatures && slide.features.length > 0) ||
    ov.showPrimaryBtn ||
    ov.showSecondaryBtn;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl border border-border/60 shadow-xl bg-card transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Contenedor Principal del Banner */}
      <div
        className={`relative min-h-[360px] sm:min-h-[420px] md:min-h-[460px] lg:min-h-[490px] flex items-center bg-card/30 backdrop-blur-xs ${
          !hasAnyContent ? 'cursor-pointer' : ''
        }`}
        onClick={() => {
          if (!hasAnyContent) {
            handleAction(slide.primaryActionType, slide.categorySlug);
          }
        }}
      >
        {/* Imágenes de Fondo con Transición Suave */}
        {slides.map((s, idx) => {
          const slideOv = resolveBannerOverlay(s);
          return (
            <div
              key={s.id}
              className={`absolute inset-0 overflow-hidden transition-opacity duration-700 ease-in-out ${
                idx === currentSlide ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
              }`}
            >
              <Image
                src={s.image}
                alt={s.title}
                fill
                priority={idx === 0}
                className={s.imageFit === 'contain' ? 'object-contain' : 'object-cover'}
                style={{
                  objectPosition: `${s.imagePosX ?? 50}% ${s.imagePosY ?? 50}%`,
                  transform: `scale(${(s.imageScale ?? 100) / 100})`,
                  transformOrigin: `${s.imagePosX ?? 50}% ${s.imagePosY ?? 50}%`
                }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1280px"
              />
              {/* Gradientes superpuestos para legibilidad y elegancia */}
              {slideOv.showShadow && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/30 md:to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                </>
              )}
            </div>
          );
        })}

        {/* Contenido Textual del Slide Activo */}
        {hasAnyContent && (
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-10 md:py-14 text-white">
            <div className="max-w-2xl space-y-4">
              {/* Badge de la Promoción */}
              {ov.showTag && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide font-gotham shadow-sm">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: slide.tagColor || '#E63946' }} />
                  <span className="text-white/95">{slide.tag}</span>
                </div>
              )}

              {/* Título en Bebas Neue */}
              {ov.showTitle && (
                <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide leading-[0.98] drop-shadow-md">
                  {slide.title}{' '}
                  {slide.titleAccent && (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF85A2] via-[#E63946] to-[#D4A017]">
                      {slide.titleAccent}
                    </span>
                  )}
                </h2>
              )}

              {/* Subtítulo */}
              {ov.showSubtitle && (
                <p className="text-xs sm:text-sm md:text-base text-white/85 font-gotham leading-relaxed max-w-xl drop-shadow-xs">
                  {slide.subtitle}
                </p>
              )}

              {/* Lista de Beneficios del Slide */}
              {ov.showFeatures && slide.features.length > 0 && (
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
              )}

              {/* Botones de Acción Interactivos */}
              {(ov.showPrimaryBtn || ov.showSecondaryBtn) && (
                <div className="pt-2 flex flex-wrap items-center gap-3 font-gotham">
                  {ov.showPrimaryBtn && (
                    <button
                      onClick={() => handleAction(slide.primaryActionType, slide.categorySlug)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#E63946]/40 hover:shadow-xl hover:shadow-[#E63946]/50 transition-all cursor-pointer transform hover:-translate-y-0.5"
                    >
                      <Icons.product className="w-4 h-4" />
                      <span>{slide.primaryActionLabel}</span>
                    </button>
                  )}

                  {ov.showSecondaryBtn &&
                    (!slide.secondaryActionType ||
                      slide.secondaryActionType !== 'wholesale' ||
                      STORE_VISIBILITY.showWholesalePrices) && (
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
                    )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Flecha Anterior (Left Arrow) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          aria-label="Banner anterior"
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-[#E63946] backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105"
        >
          <Icons.chevronLeft className="w-5 h-5" />
        </button>

        {/* Flecha Siguiente (Right Arrow) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          aria-label="Siguiente banner"
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-[#E63946] backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105"
        >
          <Icons.chevronRight className="w-5 h-5" />
        </button>

        {/* Indicador de Número de Slide (Esquina Superior Derecha) */}
        <div className="absolute top-4 right-5 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-mono text-white/80">
          <span className="font-bold text-white">0{currentSlide + 1}</span>
          <span>/</span>
          <span>0{slides.length}</span>
        </div>

        {/* Barra de Indicadores / Paginación (Pills en la parte inferior) */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15"
          onClick={(e) => e.stopPropagation()}
        >
          {slides.map((_, idx) => (
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
