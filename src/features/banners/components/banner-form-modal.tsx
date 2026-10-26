'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CarouselSlide, CarouselActionType } from '@/types/banner';

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: CarouselSlide | null;
}

const PRESET_COLORS = [
  { name: 'Rojo JG', value: '#E63946' },
  { name: 'Dorado Bazar', value: '#D4A017' },
  { name: 'Rosa Neón', value: '#FF85A2' },
  { name: 'Verde Éxito', value: '#25D366' },
  { name: 'Azul Eléctrico', value: '#0077B6' },
  { name: 'Púrpura Real', value: '#7209B7' },
  { name: 'Naranja Glow', value: '#FB8500' }
];

const PRESET_IMAGES = [
  {
    label: 'Depósito / Mayorista',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Aromatización & Bazar',
    url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Tecnología & Auriculares',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Finanzas & Medios de Pago',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Hogar & Cocina Moderna',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Moda & Accesorios Urbanos',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80'
  }
];

export function BannerFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData
}: BannerFormModalProps) {
  const [title, setTitle] = useState('');
  const [titleAccent, setTitleAccent] = useState('');
  const [tag, setTag] = useState('');
  const [tagColor, setTagColor] = useState('#E63946');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('url');
  const [primaryActionLabel, setPrimaryActionLabel] = useState('Explorar Catálogo');
  const [primaryActionType, setPrimaryActionType] = useState<CarouselActionType>('explore');
  const [categorySlug, setCategorySlug] = useState('');
  const [secondaryActionLabel, setSecondaryActionLabel] = useState('Cotizar por WhatsApp');
  const [secondaryActionType, setSecondaryActionType] = useState<CarouselActionType>('whatsapp');
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<number>(1);

  const [categoriesList, setCategoriesList] = useState<{ slug: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar categorías disponibles para asociar al banner
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setCategoriesList(data.map((c: any) => ({ slug: c.slug, name: c.name })));
        }
      })
      .catch(() => {});
  }, []);

  // Sincronizar datos al abrir modal
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setTitleAccent(initialData.titleAccent || '');
      setTag(initialData.tag || '');
      setTagColor(initialData.tagColor || '#E63946');
      setSubtitle(initialData.subtitle || '');
      setImageUrl(initialData.image || '');
      setPrimaryActionLabel(initialData.primaryActionLabel || 'Explorar Catálogo');
      setPrimaryActionType(initialData.primaryActionType || 'explore');
      setCategorySlug(initialData.categorySlug || '');
      setSecondaryActionLabel(initialData.secondaryActionLabel || 'Cotizar por WhatsApp');
      setSecondaryActionType(initialData.secondaryActionType || 'whatsapp');
      setFeatures(Array.isArray(initialData.features) ? initialData.features : []);
      setIsActive(initialData.isActive !== false);
      setDisplayOrder(initialData.displayOrder ?? 1);
    } else {
      // Valores por defecto para nuevo banner
      setTitle('');
      setTitleAccent('');
      setTag('🔥 NOVEDADES & PROMOCIÓN EXCLUSIVA');
      setTagColor('#E63946');
      setSubtitle('Descubrí los mejores precios y promociones mayoristas en JG Store.');
      setImageUrl(PRESET_IMAGES[0].url);
      setPrimaryActionLabel('Explorar Catálogo');
      setPrimaryActionType('explore');
      setCategorySlug('');
      setSecondaryActionLabel('Cotizar por WhatsApp');
      setSecondaryActionType('whatsapp');
      setFeatures(['Stock Inmediato', 'Factura A y B AFIP', 'Despacho Nacional']);
      setIsActive(true);
      setDisplayOrder(1);
    }
  }, [initialData, isOpen]);

  // Manejo de carga de archivos a Supabase Storage
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor seleccioná un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 8MB.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tag', tag || 'banner');

    try {
      const res = await fetch('/api/banners/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Error al subir la imagen del banner');
      }

      setImageUrl(data.url);
      toast.success('Imagen de banner subida exitosamente a Supabase Storage');
    } catch (err: any) {
      toast.error(err.message || 'Error al subir imagen');
    } finally {
      setIsUploading(false);
    }
  };

  // Agregar pill de beneficio
  const handleAddFeature = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = featureInput.trim();
    if (!clean) return;
    if (features.includes(clean)) {
      toast.error('Este beneficio ya está en la lista');
      return;
    }
    if (features.length >= 5) {
      toast.error('Podés agregar un máximo de 5 beneficios por banner para mantenerlo legible.');
      return;
    }
    setFeatures([...features, clean]);
    setFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('El título principal del banner es obligatorio.');
      return;
    }

    if (!imageUrl.trim()) {
      toast.error('Debés ingresar o subir una imagen para el banner.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CarouselSlide = {
        id: initialData?.id || `slide-${Date.now()}`,
        tag: tag.trim() || '🔥 NOVEDAD JG STORE',
        tagColor,
        title: title.trim(),
        titleAccent: titleAccent.trim(),
        subtitle: subtitle.trim(),
        image: imageUrl.trim(),
        primaryActionLabel: primaryActionLabel.trim() || 'Explorar Catálogo',
        primaryActionType,
        categorySlug: primaryActionType === 'category' ? categorySlug : '',
        secondaryActionLabel: secondaryActionLabel.trim() || 'Cotizar por WhatsApp',
        secondaryActionType,
        features,
        isActive,
        displayOrder: Number(displayOrder) || 1
      };

      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar el banner');
      }

      toast.success(
        initialData
          ? `Banner "${title}" actualizado exitosamente.`
          : `Banner "${title}" creado exitosamente.`
      );

      // Notificar a otras pestañas/componentes
      window.dispatchEvent(new Event('banners-updated'));

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar el banner.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <DialogHeader className="pb-3 border-b">
          <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E63946]/10 text-[#E63946]">
              <Icons.media className="w-5 h-5" />
            </span>
            <span>{initialData ? 'Editar Slide de Carrusel' : 'Nuevo Slide de Carrusel'}</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Personalizá los textos, colores, imagen y botones de acción del banner principal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Vista Previa Interactiva dentro del Modal */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Vista Previa en Vivo
            </Label>
            <div className="relative rounded-2xl overflow-hidden border border-border/80 shadow-md bg-neutral-900 min-h-[200px] flex items-center p-6 text-white">
              {imageUrl ? (
                <>
                  <Image
                    src={imageUrl}
                    alt={title || 'Vista previa'}
                    fill
                    className="object-cover object-center"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 text-neutral-400 text-sm">
                  Ingresá una imagen para ver la previsualización
                </div>
              )}

              <div className="relative z-10 space-y-2 max-w-lg">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-[11px] font-semibold">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tagColor }} />
                  <span>{tag || 'TAG PROMOCIONAL'}</span>
                </div>

                <h3 className="font-bebas text-2xl sm:text-3xl tracking-wide leading-tight text-white drop-shadow-sm">
                  {title || 'TÍTULO DEL BANNER'}{' '}
                  {titleAccent && (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF85A2] via-[#E63946] to-[#D4A017]">
                      {titleAccent}
                    </span>
                  )}
                </h3>

                <p className="text-xs text-white/80 line-clamp-2">
                  {subtitle || 'Subtítulo descriptivo de la promoción o categoría.'}
                </p>

                {features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {features.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/90 border border-white/15"
                      >
                        <Icons.check className="w-2.5 h-2.5 text-[#25D366]" />
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="px-3 py-1.5 rounded-lg bg-[#E63946] font-semibold text-white shadow-sm">
                    {primaryActionLabel || 'Botón 1'}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-white/20 font-semibold text-white border border-white/25">
                    {secondaryActionLabel || 'Botón 2'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sección 1: Textos Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="banner-title" className="text-sm font-semibold">
                Título Principal <span className="text-destructive">*</span>
              </Label>
              <Input
                id="banner-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: COMPRÁ AL MAYOR"
                className="font-medium uppercase"
                required
              />
              <p className="text-[11px] text-muted-foreground">Aparece en tipografía destacada Bebas Neue.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner-title-accent" className="text-sm font-semibold">
                Texto con Acento / Gradiente
              </Label>
              <Input
                id="banner-title-accent"
                value={titleAccent}
                onChange={(e) => setTitleAccent(e.target.value)}
                placeholder="Ej: DESDE $ 50.000 ARS"
                className="font-medium text-[#E63946]"
              />
              <p className="text-[11px] text-muted-foreground">Se destaca con gradiente multicolor brillante.</p>
            </div>
          </div>

          {/* Sección 2: Tag & Color */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="banner-tag" className="text-sm font-semibold">
                Badge / Etiqueta Superior
              </Label>
              <Input
                id="banner-tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Ej: 🇦🇷 DISTRIBUIDORA POLIRRUBRO • BUENOS AIRES"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Color de la Etiqueta</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={tagColor}
                  onChange={(e) => setTagColor(e.target.value)}
                  className="w-9 h-9 p-0.5 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <Input
                  value={tagColor}
                  onChange={(e) => setTagColor(e.target.value)}
                  className="w-24 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Chips de Colores Rápidos */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground mr-1">Colores sugeridos:</span>
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setTagColor(c.value)}
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  tagColor.toLowerCase() === c.value.toLowerCase()
                    ? 'border-primary bg-primary/10 font-bold'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.value }} />
                <span>{c.name}</span>
              </button>
            ))}
          </div>

          {/* Subtítulo */}
          <div className="space-y-2">
            <Label htmlFor="banner-subtitle" className="text-sm font-semibold">
              Subtítulo / Descripción
            </Label>
            <textarea
              id="banner-subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              rows={2}
              placeholder="Desbloqueá tarifas mayoristas en toda tu compra al alcanzar el monto global..."
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Sección 3: Imagen del Banner */}
          <div className="space-y-3 p-4 rounded-xl border border-border/70 bg-muted/20">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Icons.media className="w-4 h-4 text-primary" />
                <span>Imagen de Fondo del Slide</span>
              </Label>
              <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    imageMode === 'upload' ? 'bg-background shadow-xs font-bold text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  Subir Archivo
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    imageMode === 'url' ? 'bg-background shadow-xs font-bold text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  URL Directa
                </button>
              </div>
            </div>

            {imageMode === 'upload' ? (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-8 border-dashed border-2 flex flex-col items-center justify-center gap-2 hover:border-primary cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Icons.spinner className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-xs">Subiendo imagen a Supabase Storage...</span>
                    </>
                  ) : (
                    <>
                      <Icons.upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-sm font-medium">Hacé clic para seleccionar una foto de tu equipo</span>
                      <span className="text-xs text-muted-foreground">JPG, PNG o WebP (Recomendado 1600x600px o similar panorámico)</span>
                    </>
                  )}
                </Button>
                {imageUrl && (
                  <p className="text-[11px] text-muted-foreground truncate font-mono">
                    Archivo subido: {imageUrl}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... o enlace de imagen permanente"
                  className="text-xs font-mono"
                />
              </div>
            )}

            {/* Presets de imágenes de stock elegantes */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs text-muted-foreground">Fondos recomendados de alta resolución:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`text-left p-2 rounded-lg border text-xs flex items-center gap-2 transition-all cursor-pointer ${
                      imageUrl === preset.url
                        ? 'border-primary bg-primary/10 font-bold'
                        : 'border-border/60 hover:bg-muted/50'
                    }`}
                  >
                    <div className="w-7 h-7 relative rounded-md overflow-hidden shrink-0">
                      <Image src={preset.url} alt={preset.label} fill className="object-cover" unoptimized />
                    </div>
                    <span className="truncate">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sección 4: Botones de Acción */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-border/70 bg-muted/20">
            {/* Botón Principal */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-primary">
                Botón Principal (Rojo Destacado)
              </Label>
              <div className="space-y-2">
                <Label htmlFor="btn1-label" className="text-xs">Texto del Botón</Label>
                <Input
                  id="btn1-label"
                  value={primaryActionLabel}
                  onChange={(e) => setPrimaryActionLabel(e.target.value)}
                  placeholder="Explorar Catálogo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="btn1-type" className="text-xs">Acción al hacer clic</Label>
                <select
                  id="btn1-type"
                  value={primaryActionType}
                  onChange={(e) => setPrimaryActionType(e.target.value as CarouselActionType)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="explore">Explorar Catálogo Completo</option>
                  <option value="category">Filtrar por Categoría Específica</option>
                  <option value="wholesale">Activar / Desactivar Modo Mayorista</option>
                  <option value="whatsapp">Abrir Chat de WhatsApp</option>
                </select>
              </div>

              {primaryActionType === 'category' && (
                <div className="space-y-1">
                  <Label htmlFor="btn1-category" className="text-xs">Seleccionar Categoría Destino</Label>
                  <select
                    id="btn1-category"
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">-- Seleccionar categoría --</option>
                    {categoriesList.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Botón Secundario */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Botón Secundario (Translúcido / B2B)
              </Label>
              <div className="space-y-2">
                <Label htmlFor="btn2-label" className="text-xs">Texto del Botón</Label>
                <Input
                  id="btn2-label"
                  value={secondaryActionLabel}
                  onChange={(e) => setSecondaryActionLabel(e.target.value)}
                  placeholder="Cotizar por WhatsApp"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="btn2-type" className="text-xs">Acción al hacer clic</Label>
                <select
                  id="btn2-type"
                  value={secondaryActionType}
                  onChange={(e) => setSecondaryActionType(e.target.value as CarouselActionType)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="whatsapp">Abrir Chat de WhatsApp</option>
                  <option value="wholesale">Activar / Desactivar Modo Mayorista</option>
                  <option value="explore">Explorar Catálogo Completo</option>
                  <option value="category">Filtrar por Categoría Específica</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección 5: Beneficios en Pills */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Beneficios Destacados (Pills de Confianza)</Label>
            <div className="flex gap-2">
              <Input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="Ej: Factura A con CUIT, Stock Inmediato, etc. (Presioná Enter)"
                className="text-xs"
              />
              <Button type="button" variant="secondary" onClick={() => handleAddFeature()} className="shrink-0 cursor-pointer">
                <Icons.add className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            </div>

            {features.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {features.map((feat, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-muted border border-border"
                  >
                    <Icons.check className="w-3 h-3 text-[#25D366]" />
                    <span>{feat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="text-muted-foreground hover:text-destructive cursor-pointer ml-1"
                    >
                      <Icons.close className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sección 6: Orden y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="banner-order" className="text-sm font-semibold">Orden de Visualización</Label>
              <Input
                id="banner-order"
                type="number"
                min={1}
                max={99}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                className="w-28"
              />
              <p className="text-[11px] text-muted-foreground">Número menor aparece primero en el carrusel.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Estado del Banner</Label>
              <div className="flex items-center gap-3 pt-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                  <span className="ml-3 text-sm font-medium">
                    {isActive ? (
                      <span className="text-[#25D366] font-semibold">Visible en la Tienda</span>
                    ) : (
                      <span className="text-muted-foreground">Oculto / Pausado</span>
                    )}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="cursor-pointer">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="bg-[#E63946] hover:bg-[#d62839] text-white cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : initialData ? (
                'Actualizar Banner'
              ) : (
                'Crear Banner'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
