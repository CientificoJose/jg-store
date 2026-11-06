'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useStoreConfigStore, ProductRowConfig } from '@/hooks/use-store-config-store';
import { PRODUCT_CATEGORIES } from '@/constants/categories';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

export default function LandingConfigPage() {
  const {
    landing,
    updateLanding,
    toggleProductRow,
    addProductRow,
    removeProductRow,
    reorderProductRows
  } = useStoreConfigStore();

  const [selectedNewCategory, setSelectedNewCategory] = useState<string>(
    PRODUCT_CATEGORIES[0]?.slug || ''
  );
  const [newRowTitle, setNewRowTitle] = useState('');
  const [isAddingRow, setIsAddingRow] = useState(false);

  const [catalogTitle, setCatalogTitle] = useState(
    landing.catalogSectionTitle || 'Catálogo de Productos'
  );
  const [catalogMaxItems, setCatalogMaxItems] = useState<number>(
    landing.catalogMaxProducts ?? 20
  );

  const [paymentText, setPaymentText] = useState(
    landing.paymentPromoText ||
      'Cualquier tipo de pago • 3 cuotas sin interés con tarjeta • 10% OFF por transferencia'
  );
  const [discountPct, setDiscountPct] = useState<number>(landing.transferDiscountPct ?? 10);

  // Estados editables de Información Institucional (Sobre Nosotros & FAQ)
  const [missionText, setMissionText] = useState(
    landing.aboutUs?.mission ||
      'Proveer a nuestros clientes la más alta variedad de productos al mejor precio del mercado, garantizando calidad, rapidez en las entregas y atención cercana y transparente.'
  );
  const [visionText, setVisionText] = useState(
    landing.aboutUs?.vision ||
      'Convertirnos en la tienda y polirrubro de referencia nacional, innovando continuamente en catálogo, tecnología de compras y servicio personalizado.'
  );
  const [teamText, setTeamText] = useState(
    landing.aboutUs?.team ||
      'Contamos con un equipo apasionado de especialistas comerciales, logística y atención al cliente, listos para asesorarte en cada compra y garantizar que tus productos lleguen en tiempo y forma.'
  );
  const [valuesText, setValuesText] = useState(
    landing.aboutUs?.values ||
      'Confianza, transparencia, compromiso con nuestros clientes, pasión por el servicio y precios justos.'
  );
  const [historyText, setHistoryText] = useState(
    landing.aboutUs?.history ||
      'Nacidos con la visión de acercar los mejores productos directo a familias y clientes, crecimos paso a paso gracias a la confianza de miles de compradores que nos eligen día a día.'
  );

  const [photosList, setPhotosList] = useState<string[]>(
    landing.aboutUs?.storePhotos || [
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&auto=format&fit=crop&q=80'
    ]
  );
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceTargetIndex, setReplaceTargetIndex] = useState<number | null>(null);

  const [faqsList, setFaqsList] = useState(
    landing.aboutUs?.faqs || [
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
      }
    ]
  );
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  const handleSaveAboutUs = () => {
    updateLanding({
      aboutUs: {
        mission: missionText,
        vision: visionText,
        team: teamText,
        values: valuesText,
        history: historyText,
        storePhotos: photosList,
        faqs: faqsList
      }
    });
    toast.success('Sección Institucional, Fotos del Local y Preguntas Frecuentes guardadas.');
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    setPhotosList([...photosList, newPhotoUrl.trim()]);
    setNewPhotoUrl('');
    toast.success('Foto añadida al carrusel del local.');
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotosList(photosList.filter((_, i) => i !== idx));
    toast.info('Foto eliminada del carrusel.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isReplace: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen supera los 5MB. Te recomendamos una imagen más liviana.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (!base64Url) return;

      if (isReplace && replaceTargetIndex !== null && replaceTargetIndex >= 0) {
        const updated = [...photosList];
        updated[replaceTargetIndex] = base64Url;
        setPhotosList(updated);
        toast.success(`Foto #${replaceTargetIndex + 1} reemplazada exitosamente.`);
        setReplaceTargetIndex(null);
      } else {
        setPhotosList([...photosList, base64Url]);
        toast.success('Nueva foto cargada desde tu dispositivo.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleMovePhoto = (idx: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= photosList.length) return;

    const updated = [...photosList];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);
    setPhotosList(updated);
    toast.success('Orden de fotos actualizado.');
  };

  const handleAddFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    const newFaq = {
      id: `faq-${Date.now()}`,
      question: newFaqQ.trim(),
      answer: newFaqA.trim()
    };
    setFaqsList([...faqsList, newFaq]);
    setNewFaqQ('');
    setNewFaqA('');
    toast.success('Pregunta frecuente añadida.');
  };

  const handleRemoveFaq = (id: string) => {
    setFaqsList(faqsList.filter((f) => f.id !== id));
    toast.info('Pregunta frecuente eliminada.');
  };

  const handleSavePaymentPromo = () => {
    updateLanding({
      paymentPromoText: paymentText,
      transferDiscountPct: Number(discountPct) || 0
    });
    toast.success('Promoción de pago y descuento actualizados con éxito.');
  };

  const handleSaveCatalogConfig = () => {
    updateLanding({
      catalogSectionTitle: catalogTitle.trim() || 'Catálogo de Productos',
      catalogMaxProducts: Number(catalogMaxItems) > 0 ? Number(catalogMaxItems) : 20
    });
    toast.success('Configuración del catálogo de productos actualizada con éxito.');
  };

  const handleTogglePaymentPromo = () => {
    const nextVal = !(landing.showPaymentPromo ?? true);
    updateLanding({ showPaymentPromo: nextVal });
    toast.success(
      nextVal
        ? 'Banner promocional de pagos activado en la tienda.'
        : 'Banner promocional de pagos ocultado de la tienda.'
    );
  };

  const handleToggleCategoryCards = () => {
    updateLanding({ showCategoryCards: !landing.showCategoryCards });
    toast.success(
      landing.showCategoryCards
        ? 'Vitrina de categorías ocultada de la landing.'
        : 'Vitrina de categorías activada en la landing.'
    );
  };

  const handleToggleTrustBadges = () => {
    updateLanding({ showTrustBadges: !landing.showTrustBadges });
    toast.success(
      landing.showTrustBadges
        ? 'Pilares de confianza ocultados del Hero Banner.'
        : 'Pilares de confianza activados en el Hero Banner.'
    );
  };

  const handleToggleCategoryPillsBar = () => {
    updateLanding({ showCategoryPillsBar: !landing.showCategoryPillsBar });
    toast.success(
      landing.showCategoryPillsBar
        ? 'Barra de categorías en botones de texto ocultada.'
        : 'Barra de categorías en botones de texto activada.'
    );
  };

  const handleToggleOfficialStoreFilter = () => {
    updateLanding({ showOfficialStoreFilter: !landing.showOfficialStoreFilter });
    toast.success(
      landing.showOfficialStoreFilter
        ? 'Filtro "Tienda Oficial JG" ocultado de la búsqueda.'
        : 'Filtro "Tienda Oficial JG" activado en la búsqueda.'
    );
  };

  const handleToggleWholesaleHeaderToggle = () => {
    updateLanding({ showWholesaleHeaderToggle: !landing.showWholesaleHeaderToggle });
    toast.success(
      landing.showWholesaleHeaderToggle
        ? 'Botón selector Detal/Mayorista en cabecera ocultado.'
        : 'Botón selector Detal/Mayorista en cabecera activado.'
    );
  };

  const handleToggleInStockSidebarFilter = () => {
    updateLanding({ showInStockSidebarFilter: !landing.showInStockSidebarFilter });
    toast.success(
      landing.showInStockSidebarFilter
        ? 'Filtro "En stock inmediato" ocultado de la búsqueda.'
        : 'Filtro "En stock inmediato" activado en la búsqueda.'
    );
  };

  const handleToggleWholesaleSidebarFilter = () => {
    updateLanding({ showWholesaleSidebarFilter: !landing.showWholesaleSidebarFilter });
    toast.success(
      landing.showWholesaleSidebarFilter
        ? 'Filtro "Tarifa Mayorista B2B" ocultado de la búsqueda.'
        : 'Filtro "Tarifa Mayorista B2B" activado en la búsqueda.'
    );
  };

  const handleToggleAnnouncement = () => {
    updateLanding({ showAnnouncement: !landing.showAnnouncement });
    toast.success(
      landing.showAnnouncement
        ? 'Cintillo de anuncios superior ocultado.'
        : 'Cintillo de anuncios superior activado.'
    );
  };

  const handleStyleChange = (style: 'photos' | 'pills') => {
    updateLanding({ categoryStyle: style });
    toast.success(
      style === 'photos'
        ? 'Estilo SHOPLUXE (fotos miniatura) activado.'
        : 'Estilo Pills compactas activado.'
    );
  };

  const handleMoveRow = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= landing.productRows.length) return;

    const newRows = [...landing.productRows];
    const [moved] = newRows.splice(index, 1);
    newRows.splice(targetIndex, 0, moved);
    reorderProductRows(newRows);
    toast.success('Orden de secciones actualizado.');
  };

  const handleCreateCategoryRow = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = PRODUCT_CATEGORIES.find((c) => c.slug === selectedNewCategory);
    if (!cat) return;

    const newRow: ProductRowConfig = {
      id: `row-cat-${cat.slug}-${Date.now()}`,
      title: newRowTitle.trim() || `✨ Destacados en ${cat.name}`,
      subtitle: cat.description,
      type: 'category',
      categorySlug: cat.slug,
      enabled: true,
      limit: 8
    };

    addProductRow(newRow);
    setNewRowTitle('');
    setIsAddingRow(false);
    toast.success(`Fila de "${cat.name}" añadida a la landing.`);
  };

  return (
    <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8 max-w-5xl font-gotham">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bebas tracking-wide text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20">
              <Icons.layout className="w-6 h-6" />
            </span>
            <span>Diseño Visual de la Landing Page</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6C757D] mt-1">
            Configura el orden visual, la vitrina de categorías con fotos (estilo SHOPLUXE) y los carruseles de productos de costado.
          </p>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Icons.externalLink className="w-4 h-4 text-[#E63946]" />
          <span>Ver Landing en Vivo</span>
        </a>
      </div>

      {/* TARJETA DESTACADA: Editor de Carrusel y Banners Promocionales */}
      <div className="rounded-2xl border-2 border-[#E63946]/30 bg-gradient-to-r from-[#E63946]/10 via-card to-card p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#E63946]/20 text-[#E63946] text-xs font-bold">
            <Icons.media className="w-3.5 h-3.5" />
            <span>GESTOR DE PORTADA</span>
          </div>
          <h2 className="text-xl font-bebas tracking-wide text-foreground">
            Carrusel de Banners Promocionales
          </h2>
          <p className="text-xs text-muted-foreground max-w-xl">
            Editá las fotos de fondo, textos con acentos, botones de WhatsApp, modo mayorista y el orden de los slides que ven tus clientes en la portada.
          </p>
        </div>
        <Link
          href="/dashboard/banners"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white text-xs font-bold transition-all shadow-md shadow-[#E63946]/20 shrink-0 cursor-pointer"
        >
          <Icons.edit className="w-4 h-4" />
          <span>Editar Banners del Carrusel</span>
        </Link>
      </div>

      {/* SECCIÓN DESTACADA: Promociones de Pago & Descuento Configurable */}
      <div className="rounded-2xl border-2 border-emerald-500/30 bg-card p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg font-bebas tracking-wide text-foreground">
                Promociones de Pago & Descuento en Efectivo / Transferencia
              </h2>
            </div>
            <p className="text-xs text-[#6C757D]">
              Configura el texto promocional que verán los clientes en la cabecera y el detalle de producto, y define el % de descuento por transferencia.
            </p>
          </div>
          <button
            type="button"
            onClick={handleTogglePaymentPromo}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              (landing.showPaymentPromo ?? true)
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-muted text-[#6C757D] border border-border'
            }`}
          >
            {(landing.showPaymentPromo ?? true) ? '✓ Promoción Activa' : '✕ Oculto'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Texto del Banner */}
          <div className="md:col-span-8 space-y-2">
            <label className="block text-xs font-bold text-foreground">
              Texto del Banner Promocional de Pagos:
            </label>
            <input
              type="text"
              value={paymentText}
              onChange={(e) => setPaymentText(e.target.value)}
              placeholder="Ej: Cualquier tipo de pago • 3 cuotas sin interés con tarjeta • 10% OFF por transferencia"
              className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
            <span className="text-[11px] text-[#6C757D] block">
              Se muestra en el cintillo superior de la tienda y en la caja de precios de cada producto.
            </span>
          </div>

          {/* Porcentaje de Descuento */}
          <div className="md:col-span-4 space-y-2">
            <label className="block text-xs font-bold text-foreground">
              % Descuento por Transferencia (OFF):
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                value={discountPct}
                onChange={(e) => setDiscountPct(Number(e.target.value))}
                className="w-full h-10 pl-3.5 pr-8 rounded-xl border border-border bg-background text-xs sm:text-sm text-foreground font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600">%</span>
            </div>
            <span className="text-[11px] text-[#6C757D] block">
              Calcula automáticamente el precio rebajado en la ficha del producto.
            </span>
          </div>
        </div>

        {/* Vista Previa en Vivo */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] block">
            Vista Previa para el Cliente:
          </span>
          <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
            <Icons.creditCard className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{paymentText || 'Cualquier tipo de pago • 3 cuotas sin interés con tarjeta • 10% OFF por transferencia'}</span>
            {discountPct > 0 && (
              <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white">
                {discountPct}% OFF
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSavePaymentPromo}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
          >
            <Icons.check className="w-4 h-4" />
            <span>Guardar Configuración de Pagos</span>
          </button>
        </div>
      </div>

      {/* TARJETA: Configuración del Catálogo Principal de Productos */}
      <div className="rounded-2xl border-2 border-[#E63946]/30 bg-card p-5 sm:p-6 shadow-sm space-y-5">
        <div className="pb-4 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E63946]" />
              <h2 className="text-lg font-bebas tracking-wide text-foreground">
                Sección del Catálogo Principal de Productos
              </h2>
            </div>
            <p className="text-xs text-[#6C757D]">
              Personaliza el nombre de la sección principal (reemplazando &ldquo;Todos los Departamentos y Productos&rdquo;) y fija el límite máximo de productos a desplegar en la portada.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Título de la Sección */}
          <div className="md:col-span-8 space-y-2">
            <label className="block text-xs font-bold text-foreground">
              Nombre de la Sección en Portada:
            </label>
            <input
              type="text"
              value={catalogTitle}
              onChange={(e) => setCatalogTitle(e.target.value)}
              placeholder="Ej: Catálogo de Productos"
              className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
            />
            <span className="text-[11px] text-[#6C757D] block">
              Título visible para los usuarios en la cuadrícula principal de la portada.
            </span>
          </div>

          {/* Límite Máximo de Productos */}
          <div className="md:col-span-4 space-y-2">
            <label className="block text-xs font-bold text-foreground">
              Máximo de Productos a Mostrar:
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={catalogMaxItems}
              onChange={(e) => setCatalogMaxItems(Number(e.target.value))}
              className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-xs sm:text-sm text-foreground font-bold focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
            />
            <span className="text-[11px] text-[#6C757D] block">
              Fijado a 20 por defecto para evitar sobrecargar la portada inicial.
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSaveCatalogConfig}
            className="px-5 py-2.5 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#E63946]/20 cursor-pointer transition-all"
          >
            <Icons.check className="w-4 h-4" />
            <span>Guardar Configuración del Catálogo</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN INSTITUCIONAL: Sobre Nosotros, Fotos del Local Físico & FAQ */}
      <div className="rounded-2xl border-2 border-amber-500/30 bg-card p-5 sm:p-6 shadow-sm space-y-6">
        <div className="pb-4 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4A017]" />
              <h2 className="text-lg font-bebas tracking-wide text-foreground">
                Sección Institucional: Sobre Nosotros, Local Físico & FAQ
              </h2>
            </div>
            <p className="text-xs text-[#6C757D]">
              Edita los textos de Misión, Visión, Equipo, Valores e Historia, administra las fotos del carrusel del local y las preguntas frecuentes.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveAboutUs}
            className="px-5 py-2.5 rounded-xl bg-[#D4A017] hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#D4A017]/20 cursor-pointer transition-all shrink-0"
          >
            <Icons.check className="w-4 h-4" />
            <span>Guardar Cambios Institucionales</span>
          </button>
        </div>

        {/* 1. Textos Institucionales */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span>📝</span> Textos de Identidad Corporativa:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">Misión:</label>
              <textarea
                value={missionText}
                onChange={(e) => setMissionText(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-border bg-background text-xs text-foreground outline-none focus:ring-2 focus:ring-[#D4A017]/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">Visión:</label>
              <textarea
                value={visionText}
                onChange={(e) => setVisionText(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-border bg-background text-xs text-foreground outline-none focus:ring-2 focus:ring-[#D4A017]/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">Nuestro Equipo:</label>
              <textarea
                value={teamText}
                onChange={(e) => setTeamText(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-border bg-background text-xs text-foreground outline-none focus:ring-2 focus:ring-[#D4A017]/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">Valores & Propósitos:</label>
              <textarea
                value={valuesText}
                onChange={(e) => setValuesText(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-border bg-background text-xs text-foreground outline-none focus:ring-2 focus:ring-[#D4A017]/30"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-foreground">Historia:</label>
              <textarea
                value={historyText}
                onChange={(e) => setHistoryText(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-border bg-background text-xs text-foreground outline-none focus:ring-2 focus:ring-[#D4A017]/30"
              />
            </div>
          </div>
        </div>

        {/* 2. Fotos del Carrusel del Local Físico */}
        <div id="fotos-local" className="space-y-4 pt-6 border-t border-border/60 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>📸</span> Fotos del Local Físico & Depósito Central ({photosList.length} fotos)
              </h3>
              <p className="text-xs text-[#6C757D] mt-0.5">
                Sube fotos de tus instalaciones directamente desde tu computadora o agrega enlaces web.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveAboutUs}
              className="px-4 py-2 rounded-xl bg-[#D4A017] hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto transition-all"
            >
              <Icons.check className="w-4 h-4" />
              <span>Guardar Fotos</span>
            </button>
          </div>

          {/* Inputs de Carga: Archivo local o URL */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Input oculto para subir nueva foto desde PC */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, false)}
            />

            {/* Input oculto para reemplazar foto puntual */}
            <input
              type="file"
              ref={replaceInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, true)}
            />

            {/* Botón de Carga desde PC */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="sm:col-span-4 h-10 px-4 rounded-xl bg-card border-2 border-dashed border-[#D4A017]/60 hover:border-[#D4A017] hover:bg-[#D4A017]/10 text-xs font-bold text-foreground flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Icons.upload className="w-4 h-4 text-[#D4A017]" />
              <span>Subir Foto desde mi PC</span>
            </button>

            {/* Carga por URL */}
            <div className="sm:col-span-8 flex gap-2">
              <input
                type="text"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="O pega una URL de imagen (https://...)"
                className="flex-1 h-10 px-3.5 rounded-xl border border-border bg-background text-xs text-foreground outline-none focus:ring-2 focus:ring-[#D4A017]/30"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="px-4 py-2 bg-foreground text-background hover:opacity-90 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap"
              >
                + Agregar URL
              </button>
            </div>
          </div>

          {/* Grilla interactiva de Fotos con controles de Reemplazo, Reorden y Eliminación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {photosList.map((url, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl overflow-hidden border-2 border-border/80 bg-card group shadow-sm flex flex-col"
              >
                {/* Badge de Posición / Foto Principal */}
                <div className="absolute top-2 left-2 z-10">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide shadow-sm uppercase ${
                      idx === 0
                        ? 'bg-[#E63946] text-white'
                        : 'bg-black/70 text-white backdrop-blur-md'
                    }`}
                  >
                    {idx === 0 ? '★ Principal' : `Foto #${idx + 1}`}
                  </span>
                </div>

                {/* Vista previa de la foto */}
                <div className="relative aspect-video w-full bg-muted/40 overflow-hidden">
                  <img
                    src={url}
                    alt={`Foto del local ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Botón flotante eliminar */}
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                    title="Eliminar esta foto"
                  >
                    ✕
                  </button>
                </div>

                {/* Barra de Acciones por Foto: Cambiar y Reordenar */}
                <div className="p-2.5 bg-card border-t border-border/60 flex items-center justify-between gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setReplaceTargetIndex(idx);
                      replaceInputRef.current?.click();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-[11px] font-semibold text-foreground flex items-center gap-1 cursor-pointer transition-colors"
                    title="Reemplazar esta foto por otra"
                  >
                    <Icons.refresh className="w-3 h-3 text-[#D4A017]" />
                    <span>Cambiar</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMovePhoto(idx, 'left')}
                      className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-30 flex items-center justify-center text-foreground cursor-pointer transition-colors"
                      title="Mover a la izquierda"
                    >
                      <Icons.chevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === photosList.length - 1}
                      onClick={() => handleMovePhoto(idx, 'right')}
                      className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-30 flex items-center justify-center text-foreground cursor-pointer transition-colors"
                      title="Mover a la derecha"
                    >
                      <Icons.chevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Preguntas Frecuentes (FAQ) */}
        <div className="space-y-3 pt-4 border-t border-border/60">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span>❓</span> Preguntas Frecuentes (FAQ):
          </h3>
          <div className="space-y-2 p-3.5 rounded-xl bg-muted/30 border border-border/80">
            <input
              type="text"
              value={newFaqQ}
              onChange={(e) => setNewFaqQ(e.target.value)}
              placeholder="Nueva pregunta (ej: ¿Cuáles son los horarios de atención?)"
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground outline-none"
            />
            <textarea
              value={newFaqA}
              onChange={(e) => setNewFaqA(e.target.value)}
              placeholder="Respuesta a la pregunta..."
              rows={2}
              className="w-full p-3 rounded-lg border border-border bg-background text-xs text-foreground outline-none"
            />
            <button
              type="button"
              onClick={handleAddFaq}
              className="px-4 py-1.5 bg-[#E63946] text-white hover:bg-[#d62839] rounded-lg text-xs font-bold cursor-pointer transition-all"
            >
              + Añadir Pregunta Frecuente
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {faqsList.map((f) => (
              <div key={f.id} className="p-3 rounded-xl border border-border/80 bg-background flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <strong className="text-xs text-foreground block">{f.question}</strong>
                  <p className="text-[11px] text-[#6C757D]">{f.answer}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFaq(f.id)}
                  className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 rounded cursor-pointer"
                  title="Eliminar pregunta"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-border/60">
          <button
            type="button"
            onClick={handleSaveAboutUs}
            className="px-6 py-3 rounded-xl bg-[#D4A017] hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#D4A017]/25 cursor-pointer transition-all"
          >
            <Icons.check className="w-4 h-4" />
            <span>Guardar Cambios Institucionales</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: Vitrina de Categorías (Inspiración SHOPLUXE) */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E63946]" />
              <h2 className="text-lg font-bebas tracking-wide text-foreground">
                Vitrina de Categorías en el Encabezado
              </h2>
            </div>
            <p className="text-xs text-[#6C757D] mt-0.5">
              Muestra las 24 categorías oficiales en la parte superior con fotos miniatura reales de productos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleCategoryCards}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              landing.showCategoryCards
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-muted text-[#6C757D] border border-border'
            }`}
          >
            {landing.showCategoryCards ? '✓ Sección Activada' : '✕ Sección Oculta'}
          </button>
        </div>

        {landing.showCategoryCards && (
          <div className="pt-4 border-t border-border/60">
            <label className="block text-xs font-bold text-foreground mb-3">
              Estilo Visual de los Departamentos:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Opción 1: Fotos SHOPLUXE */}
              <div
                onClick={() => handleStyleChange('photos')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  landing.categoryStyle === 'photos'
                    ? 'border-[#E63946] bg-[#E63946]/5 ring-2 ring-[#E63946]/20'
                    : 'border-border/80 hover:border-border bg-muted/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📸</span>
                    <strong className="text-xs font-bold text-foreground">
                      Fotos Circulares (Estilo SHOPLUXE)
                    </strong>
                  </div>
                  {landing.categoryStyle === 'photos' && (
                    <span className="w-4 h-4 rounded-full bg-[#E63946] text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6C757D] leading-relaxed">
                  Fotos miniatura reales de productos con efecto zoom al pasar el mouse y navegación deslizante horizontal con flechas.
                </p>
              </div>

              {/* Opción 2: Pills de texto */}
              <div
                onClick={() => handleStyleChange('pills')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  landing.categoryStyle === 'pills'
                    ? 'border-[#E63946] bg-[#E63946]/5 ring-2 ring-[#E63946]/20'
                    : 'border-border/80 hover:border-border bg-muted/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🏷️</span>
                    <strong className="text-xs font-bold text-foreground">
                      Botones Compactos (Pills)
                    </strong>
                  </div>
                  {landing.categoryStyle === 'pills' && (
                    <span className="w-4 h-4 rounded-full bg-[#E63946] text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6C757D] leading-relaxed">
                  Botones de píldora compactos con nombres de categoría para tiendas con un estilo minimalista.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN 2: Visibilidad de Bloques & Filtros Opcionales */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E63946]" />
            <h2 className="text-lg font-bebas tracking-wide text-foreground">
              Visibilidad de Bloques &amp; Filtros Opcionales
            </h2>
          </div>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Activa o desactiva elementos visuales y filtros especiales en la tienda según la estrategia comercial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Tarjeta 1: Pilares de Confianza */}
          <div
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
              landing.showTrustBadges
                ? 'border-border bg-card shadow-xs'
                : 'border-dashed border-border/80 bg-muted/20 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#D4A017]/15 text-[#D4A017] flex items-center justify-center shrink-0">
                  <Icons.shieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    Pilares de Confianza en Hero Banner
                  </h3>
                  <span className="text-[10px] text-[#6C757D]">
                    Tarifa Mayorista, Stock, Pagos y Envíos
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleTrustBadges}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  landing.showTrustBadges
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-muted text-[#6C757D] border border-border hover:bg-muted/80'
                }`}
              >
                {landing.showTrustBadges ? '✓ Visible' : '✕ Oculto'}
              </button>
            </div>
            <p className="text-[11px] text-[#6C757D] leading-relaxed">
              Muestra las 4 tarjetas informativas (&quot;Tarifa Mayorista&quot;, &quot;Stock en Tiempo Real&quot;, &quot;Mercado Pago &amp; CBU&quot;, &quot;Envíos a Todo el País&quot;) debajo de los banners principales.
            </p>
          </div>

          {/* Tarjeta 2: Barra de Categorías en Botones de Texto (Pills) */}
          <div
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
              landing.showCategoryPillsBar
                ? 'border-border bg-card shadow-xs'
                : 'border-dashed border-border/80 bg-muted/20 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E63946]/10 text-[#E63946] flex items-center justify-center shrink-0">
                  <Icons.tags className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    Barra de Categorías en Texto (Pills)
                  </h3>
                  <span className="text-[10px] text-[#6C757D]">
                    Barra de 24 departamentos en botones
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleCategoryPillsBar}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  landing.showCategoryPillsBar
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-muted text-[#6C757D] border border-border hover:bg-muted/80'
                }`}
              >
                {landing.showCategoryPillsBar ? '✓ Visible' : '✕ Oculto'}
              </button>
            </div>
            <p className="text-[11px] text-[#6C757D] leading-relaxed">
              Barra fija deslizante con nombres de las 24 categorías en formato botón píldora. Ocultada por defecto para dar protagonismo a las fotos circulares.
            </p>
          </div>

          {/* Tarjeta 3: Filtro "Tienda Oficial JG" en Búsqueda */}
          <div
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
              landing.showOfficialStoreFilter
                ? 'border-border bg-card shadow-xs'
                : 'border-dashed border-border/80 bg-muted/20 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Icons.store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    Filtro &quot;Tienda Oficial JG&quot;
                  </h3>
                  <span className="text-[10px] text-[#6C757D]">
                    Barra lateral de búsqueda (Mercado Libre)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleOfficialStoreFilter}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  landing.showOfficialStoreFilter
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-muted text-[#6C757D] border border-border hover:bg-muted/80'
                }`}
              >
                {landing.showOfficialStoreFilter ? '✓ Visible' : '✕ Oculto'}
              </button>
            </div>
            <p className="text-[11px] text-[#6C757D] leading-relaxed">
              Añade un interruptor en el panel lateral de búsqueda para que el cliente filtre únicamente productos verificados con el sello de Tienda Oficial.
            </p>
          </div>

          {/* Tarjeta: Selector Detal / Mayorista en Cabecera */}
          <div
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
              landing.showWholesaleHeaderToggle
                ? 'border-border bg-card shadow-xs'
                : 'border-dashed border-border/80 bg-muted/20 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-[#E63946] flex items-center justify-center shrink-0">
                  <Icons.tags className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    Botón &quot;Detal / Mayorista&quot; en Cabecera
                  </h3>
                  <span className="text-[10px] text-[#6C757D]">
                    Cabecera principal de la tienda
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleWholesaleHeaderToggle}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  landing.showWholesaleHeaderToggle
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-muted text-[#6C757D] border border-border hover:bg-muted/80'
                }`}
              >
                {landing.showWholesaleHeaderToggle ? '✓ Visible' : '✕ Oculto'}
              </button>
            </div>
            <p className="text-[11px] text-[#6C757D] leading-relaxed">
              Muestra el botón con etiqueta &quot;Detal&quot; / &quot;Mayorista&quot; en la barra superior junto al buscador y carrito.
            </p>
          </div>

          {/* Tarjeta: Filtro "En stock inmediato" en Búsqueda */}
          <div
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
              landing.showInStockSidebarFilter
                ? 'border-border bg-card shadow-xs'
                : 'border-dashed border-border/80 bg-muted/20 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Icons.check className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    Interruptor &quot;En stock inmediato&quot;
                  </h3>
                  <span className="text-[10px] text-[#6C757D]">
                    Barra lateral de búsqueda y categorías
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleInStockSidebarFilter}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  landing.showInStockSidebarFilter
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-muted text-[#6C757D] border border-border hover:bg-muted/80'
                }`}
              >
                {landing.showInStockSidebarFilter ? '✓ Visible' : '✕ Oculto'}
              </button>
            </div>
            <p className="text-[11px] text-[#6C757D] leading-relaxed">
              Muestra el interruptor &quot;En stock inmediato (Disponibles en depósito)&quot; en el panel lateral de filtros.
            </p>
          </div>

          {/* Tarjeta: Filtro "Tarifa Mayorista B2B" en Búsqueda */}
          <div
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
              landing.showWholesaleSidebarFilter
                ? 'border-border bg-card shadow-xs'
                : 'border-dashed border-border/80 bg-muted/20 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-[#D4A017] flex items-center justify-center shrink-0">
                  <Icons.tags className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    Interruptor &quot;Tarifa Mayorista B2B&quot;
                  </h3>
                  <span className="text-[10px] text-[#6C757D]">
                    Barra lateral de búsqueda y categorías
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleWholesaleSidebarFilter}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  landing.showWholesaleSidebarFilter
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-muted text-[#6C757D] border border-border hover:bg-muted/80'
                }`}
              >
                {landing.showWholesaleSidebarFilter ? '✓ Visible' : '✕ Oculto'}
              </button>
            </div>
            <p className="text-[11px] text-[#6C757D] leading-relaxed">
              Muestra el interruptor &quot;Tarifa Mayorista B2B (Descuento especial por volumen)&quot; en el panel lateral de filtros.
            </p>
          </div>

          {/* Tarjeta 4: Cintillo de Aviso Promocional */}
          <div
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
              landing.showAnnouncement
                ? 'border-border bg-card shadow-xs'
                : 'border-dashed border-border/80 bg-muted/20 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Icons.bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    Cintillo de Aviso Superior
                  </h3>
                  <span className="text-[10px] text-[#6C757D]">
                    Barra superior de promociones y CBU
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleAnnouncement}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  landing.showAnnouncement
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-muted text-[#6C757D] border border-border hover:bg-muted/80'
                }`}
              >
                {landing.showAnnouncement ? '✓ Visible' : '✕ Oculto'}
              </button>
            </div>
            <p className="text-[11px] text-[#6C757D] leading-relaxed">
              Cintillo rojo/dorado que aparece arriba de toda la página con el texto promocional mayorista y descuentos por transferencia.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: Carruseles Horizontales de Costado (Sub-segmentos de Categorías) */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4A017]" />
              <h2 className="text-lg font-bebas tracking-wide text-foreground">
                Carruseles de Productos de Costado
              </h2>
            </div>
            <p className="text-xs text-[#6C757D] mt-0.5">
              Administra los bloques que muestran productos deslizables horizontalmente (&quot;de costado&quot;) con flechas de navegación y enlace &quot;Ver todo&quot;.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingRow(true)}
            className="px-3.5 py-2 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Icons.add className="w-4 h-4" />
            <span>Agregar Sección de Categoría</span>
          </button>
        </div>

        {/* Formulario Modal o Expandible para Agregar Nueva Sección */}
        {isAddingRow && (
          <form
            onSubmit={handleCreateCategoryRow}
            className="p-4 rounded-xl border border-[#E63946]/30 bg-[#E63946]/5 space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                Nueva Fila Horizontal en la Landing
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingRow(false)}
                className="text-xs text-[#6C757D] hover:text-foreground"
              >
                Cancelar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#6C757D] mb-1">
                  Seleccionar Departamento / Rubro:
                </label>
                <select
                  value={selectedNewCategory}
                  onChange={(e) => setSelectedNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6C757D] mb-1">
                  Título Personalizado (Opcional):
                </label>
                <input
                  type="text"
                  value={newRowTitle}
                  onChange={(e) => setNewRowTitle(e.target.value)}
                  placeholder="Ej. ✨ Lo más nuevo en Bazar"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingRow(false)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs text-[#6C757D] hover:bg-muted"
              >
                Descartar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#E63946] hover:bg-[#d62839] text-white text-xs font-bold"
              >
                Guardar Sección
              </button>
            </div>
          </form>
        )}

        {/* Lista de Carruseles Actuales con Switch y Controles */}
        <div className="space-y-3">
          {landing.productRows.map((row, index) => (
            <div
              key={row.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                row.enabled
                  ? 'border-border bg-card'
                  : 'border-dashed border-border/70 bg-muted/20 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Grip / Posición */}
                <div className="flex flex-col items-center gap-1 text-[#6C757D] pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleMoveRow(index, 'up')}
                    disabled={index === 0}
                    title="Subir posición"
                    className="p-1 hover:text-foreground disabled:opacity-20 cursor-pointer"
                  >
                    <Icons.chevronUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold">#{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleMoveRow(index, 'down')}
                    disabled={index === landing.productRows.length - 1}
                    title="Bajar posición"
                    className="p-1 hover:text-foreground disabled:opacity-20 cursor-pointer"
                  >
                    <Icons.chevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">{row.title}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-[#6C757D] uppercase">
                      {row.type === 'trending'
                        ? '🔥 Tendencias'
                        : row.type === 'wholesale'
                        ? '⚡ Mayorista'
                        : '📁 Categoría'}
                    </span>
                  </div>
                  {row.subtitle && (
                    <p className="text-xs text-[#6C757D] mt-0.5 line-clamp-1">
                      {row.subtitle}
                    </p>
                  )}
                  <span className="text-[11px] text-[#6C757D] font-mono mt-1 block">
                    Límite: {row.limit} artículos en vista horizontal
                  </span>
                </div>
              </div>

              {/* Acciones para cada fila */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => toggleProductRow(row.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    row.enabled
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-muted text-[#6C757D] hover:bg-muted/80'
                  }`}
                >
                  {row.enabled ? '✓ Visible' : '✕ Oculto'}
                </button>

                {row.type === 'category' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`¿Eliminar la fila "${row.title}" de la landing?`)) {
                        removeProductRow(row.id);
                        toast.info('Sección eliminada.');
                      }
                    }}
                    title="Eliminar fila"
                    className="p-2 rounded-lg text-[#6C757D] hover:text-[#E63946] hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Icons.trash className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
