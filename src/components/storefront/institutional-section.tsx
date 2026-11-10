'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStoreConfigStore } from '@/hooks/use-store-config-store';
import { Icons } from '@/components/icons';

export function InstitutionalSection() {
  const aboutUs = useStoreConfigStore((s) => s.landing?.aboutUs);

  const [activeTab, setActiveTab] = useState<'mision' | 'vision' | 'equipo' | 'valores' | 'historia'>('mision');
  const [photoIndex, setPhotoIndex] = useState(0);
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  // Sincronizar pestaña y scroll con el hash de la URL (#mision, #equipo, #local-fisico, #preguntas-frecuentes)
  useEffect(() => {
    const handleHash = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (!hash) return;

      if (['mision', 'vision', 'equipo', 'valores', 'historia'].includes(hash)) {
        setActiveTab(hash as any);
        setTimeout(() => {
          const el = document.getElementById('sobre-nosotros');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else if (hash === 'local-fisico') {
        setTimeout(() => {
          const el = document.getElementById('local-fisico');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else if (hash === 'preguntas-frecuentes') {
        setTimeout(() => {
          const el = document.getElementById('preguntas-frecuentes');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Fallback defaults
  const mission =
    aboutUs?.mission ||
    'Proveer a nuestros clientes la más alta variedad de productos al mejor precio del mercado, garantizando calidad, rapidez en las entregas y atención cercana y transparente.';
  const vision =
    aboutUs?.vision ||
    'Convertirnos en la tienda y polirrubro de referencia nacional, innovando continuamente en catálogo, tecnología de compras y servicio personalizado.';
  const team =
    aboutUs?.team ||
    'Contamos con un equipo apasionado de especialistas comerciales, logística y atención al cliente, listos para asesorarte en cada compra y garantizar que tus productos lleguen en tiempo y forma.';
  const values =
    aboutUs?.values ||
    'Confianza, transparencia, compromiso con nuestros clientes, pasión por el servicio y precios justos.';
  const history =
    aboutUs?.history ||
    'Nacidos con la visión de acercar los mejores productos directo a familias y clientes, crecimos paso a paso gracias a la confianza de miles de compradores que nos eligen día a día.';

  const photos =
    aboutUs?.storePhotos && aboutUs.storePhotos.length > 0
      ? aboutUs.storePhotos
      : [
          'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&auto=format&fit=crop&q=80'
        ];

  const faqs = aboutUs?.faqs || [
    {
      id: 'faq-1',
      question: '¿Cuáles son los medios de pago aceptados?',
      answer:
        'Aceptamos cualquier tipo de pago: Mercado Pago, tarjetas de crédito y débito (hasta 3 cuotas sin interés), y transferencia bancaria directa (CBU / Alias) con descuento especial.'
    },
    {
      id: 'faq-2',
      question: '¿Cómo accedo al 10% OFF por transferencia?',
      answer:
        'Al momento de abonar por transferencia bancaria (CBU / Alias) o coordinar tu pedido por WhatsApp, se aplica automáticamente el descuento del 10% sobre tu total.'
    },
    {
      id: 'faq-3',
      question: '¿Tienen local físico para retiro presencial?',
      answer:
        '¡Sí! Contamos con local físico y depósito central donde podés retirar tus compras coordinadas sin costo adicional dentro de los horarios de atención.'
    },
    {
      id: 'faq-4',
      question: '¿Cómo se realizan los envíos y cuáles son los tiempos de entrega?',
      answer:
        'Despachamos rápidamente a todo el país mediante correo Andreani y expresos al interior con número de seguimiento en tiempo real.'
    },
    {
      id: 'faq-5',
      question: '¿Los productos tienen garantía?',
      answer:
        'Todos nuestros artículos cuentan con control previo de empaque y garantía oficial de fábrica ante cualquier defecto.'
    }
  ];

  const handleNextPhoto = () => {
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = () => {
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const tabs = [
    { id: 'mision', label: 'Misión', icon: Icons.shieldCheck, content: mission },
    { id: 'vision', label: 'Visión', icon: Icons.trendingUp, content: vision },
    { id: 'equipo', label: 'Nuestro Equipo', icon: Icons.user, content: team },
    { id: 'valores', label: 'Valores & Propósitos', icon: Icons.heart, content: values },
    { id: 'historia', label: 'Historia', icon: Icons.clock, content: history }
  ] as const;

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];
  const CurrentIcon = currentTab.icon;

  return (
    <section id="sobre-nosotros" className="w-full py-12 sm:py-16 bg-muted/30 border-t border-border/80 font-gotham">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* PARTE 1: Bloque Institucional (Misión, Visión, Equipo, Valores, Historia) */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20">
              Nuestra Identidad
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Conocé Nuestra Empresa
            </h2>
            <p className="text-xs sm:text-sm text-[#6C757D]">
              Compromiso, solidez y cercanía para brindarte la mejor experiencia de compra.
            </p>
          </div>

          {/* Selector de Pestañas */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (typeof window !== 'undefined') {
                      window.history.replaceState(null, '', '#' + tab.id);
                    }
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/25 scale-105'
                      : 'bg-card text-[#6C757D] hover:text-foreground border border-border/80 hover:bg-muted'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tarjeta de Contenido Activo */}
          <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl bg-card border-2 border-border/80 shadow-md">
            <div className="flex items-center gap-3 mb-4 text-[#E63946]">
              <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 flex items-center justify-center">
                <CurrentIcon className="w-5 h-5 text-[#E63946]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                {currentTab.label}
              </h3>
            </div>
            <p className="text-sm sm:text-base text-[#6C757D] leading-relaxed">
              {currentTab.content}
            </p>
          </div>
        </div>

        {/* PARTE 2: Carrusel de Fotos del Local Físico */}
        <div id="local-fisico">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#D4A017]/15 text-[#D4A017] border border-[#D4A017]/30">
              Instalaciones Reales
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Nuestro Local Físico & Depósito Central
            </h2>
            <p className="text-xs sm:text-sm text-[#6C757D]">
              Ubicación física y stock preparado para atención presencial y despachos a todo el país.
            </p>
            <div className="pt-1">
              <Link
                href="/dashboard/config/landing#fotos-local"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-card border border-border/80 hover:border-[#D4A017] text-[#6C757D] hover:text-[#D4A017] transition-all cursor-pointer shadow-xs"
                title="Subir o cambiar fotos del local desde el panel de control"
              >
                <Icons.settings className="w-3.5 h-3.5 text-[#D4A017]" />
                <span>Gestionar / Cambiar Fotos</span>
              </Link>
            </div>
          </div>

          {/* Visor del Carrusel */}
          <div className="max-w-4xl mx-auto relative rounded-3xl overflow-hidden bg-black/90 shadow-2xl border-2 border-border/80 group">
            <div className="relative aspect-video sm:aspect-[21/9] w-full">
              <Image
                src={photos[photoIndex]}
                alt={`Local físico y depósito - Foto ${photoIndex + 1}`}
                fill
                className="object-cover transition-all duration-700 group-hover:scale-102"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            </div>

            {/* Controles de Navegación Flechas */}
            <button
              onClick={handlePrevPhoto}
              title="Foto anterior"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg"
            >
              <Icons.chevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNextPhoto}
              title="Foto siguiente"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg"
            >
              <Icons.chevronRight className="w-6 h-6" />
            </button>

            {/* Pie del Visor */}
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-2">
                <Icons.store className="w-4 h-4 text-[#D4A017]" />
                <span className="font-bold">Instalaciones Comerciales JG Store</span>
              </div>
              <span className="font-mono bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-md font-bold">
                {photoIndex + 1} / {photos.length}
              </span>
            </div>
          </div>

          {/* Tira de Miniaturas */}
          <div className="flex items-center justify-center gap-3 mt-4 overflow-x-auto py-2">
            {photos.map((src, idx) => (
              <button
                key={idx}
                onClick={() => setPhotoIndex(idx)}
                className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                  photoIndex === idx
                    ? 'border-[#E63946] ring-2 ring-[#E63946]/30 scale-105'
                    : 'border-border/80 opacity-60 hover:opacity-100'
                }`}
              >
                <Image src={src} alt={`Miniatura ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* PARTE 3: Preguntas Frecuentes (FAQ) */}
        <div id="preguntas-frecuentes">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Centro de Ayuda
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Preguntas Frecuentes
            </h2>
            <p className="text-xs sm:text-sm text-[#6C757D]">
              Respuestas rápidas a las consultas más habituales sobre compras, pagos y envíos.
            </p>
          </div>

          {/* Acordeón de FAQs */}
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all ${
                    isOpen
                      ? 'border-[#E63946]/40 bg-card shadow-sm'
                      : 'border-border/80 bg-card hover:border-border'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-bold text-xs sm:text-sm text-foreground">
                      {faq.question}
                    </span>
                    <Icons.chevronDown
                      className={`w-4 h-4 text-[#6C757D] shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-[#E63946]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-[#6C757D] leading-relaxed border-t border-border/60 pt-3 animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
