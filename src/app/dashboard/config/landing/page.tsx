'use client';

import React, { useState } from 'react';
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
