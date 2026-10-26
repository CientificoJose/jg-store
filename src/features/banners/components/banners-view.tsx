'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CarouselSlide } from '@/types/banner';
import { BannerFormModal } from './banner-form-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

export function BannersView() {
  const [banners, setBanners] = useState<CarouselSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<CarouselSlide | null>(null);

  // Estados de eliminación y reseteo
  const [bannerToDelete, setBannerToDelete] = useState<CarouselSlide | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estado para el slider de previsualización en vivo dentro del dashboard
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);

  const fetchBanners = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/banners?all=true');
      if (!res.ok) throw new Error('Error al cargar banners');
      const data = await res.json();
      if (Array.isArray(data)) {
        setBanners(data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error cargando banners');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const activeBanners = banners.filter((b) => b.isActive !== false);

  // Auto-slide para la vista previa del dashboard si hay más de 1 banner activo
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setPreviewSlideIdx((prev) => (prev + 1) % activeBanners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const handleOpenCreateModal = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner: CarouselSlide) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleDuplicateBanner = (banner: CarouselSlide) => {
    const duplicated: CarouselSlide = {
      ...banner,
      id: '', // Se creará uno nuevo
      title: `${banner.title} (Copia)`,
      displayOrder: (banner.displayOrder || 1) + 1
    };
    setEditingBanner(duplicated);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (banner: CarouselSlide) => {
    const updated = { ...banner, isActive: !banner.isActive };
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error('Error al cambiar estado del banner');

      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isActive: updated.isActive } : b))
      );
      toast.success(
        updated.isActive
          ? `Banner "${banner.title}" activado en la tienda.`
          : `Banner "${banner.title}" pausado (no se mostrará a clientes).`
      );
      window.dispatchEvent(new Event('banners-updated'));
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar estado');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    // Actualizar órdenes numéricos
    const reordered = newBanners.map((b, idx) => ({ ...b, displayOrder: idx + 1 }));
    setBanners(reordered);

    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reordered)
      });
      if (!res.ok) throw new Error('Error al guardar nuevo orden');
      toast.success('Orden de banners actualizado');
      window.dispatchEvent(new Event('banners-updated'));
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar orden');
      fetchBanners(); // Revertir en caso de error
    }
  };

  const handleDeleteConfirm = async () => {
    if (!bannerToDelete) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/banners?id=${encodeURIComponent(bannerToDelete.id)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar banner');

      toast.success(`Banner "${bannerToDelete.title}" eliminado.`);
      setBannerToDelete(null);
      window.dispatchEvent(new Event('banners-updated'));
      fetchBanners();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetDefaults = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
      });
      if (!res.ok) throw new Error('Error al restablecer banners');

      toast.success('Banners restablecidos a los 4 slides oficiales de JG Store.');
      setIsResetDialogOpen(false);
      window.dispatchEvent(new Event('banners-updated'));
      fetchBanners();
    } catch (err: any) {
      toast.error(err.message || 'Error al restablecer');
    } finally {
      setIsProcessing(false);
    }
  };

  const activeSlide = activeBanners[previewSlideIdx] || activeBanners[0];

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header Superior */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#E63946]/10 text-[#E63946]">
              <Icons.media className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Carrusel y Banners Promocionales
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Editá las diapositivas de la portada de JG Store. Modificá imágenes, títulos, textos con acento y botones de WhatsApp o catálogo.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted transition-all cursor-pointer"
          >
            <Icons.externalLink className="w-3.5 h-3.5" />
            <span>Ver Tienda Online</span>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetDialogOpen(true)}
            className="text-xs rounded-xl cursor-pointer"
          >
            <Icons.refresh className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
            <span>Restablecer</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreateModal}
            className="bg-[#E63946] hover:bg-[#d62839] text-white font-semibold rounded-xl shadow-md shadow-[#E63946]/20 cursor-pointer"
          >
            <Icons.add className="w-4 h-4 mr-1.5" />
            <span>Nuevo Banner</span>
          </Button>
        </div>
      </div>

      {/* Vista Previa en Vivo Interactiva */}
      {activeBanners.length > 0 && activeSlide && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse" />
              <span>Previsualización en Vivo de la Portada ({activeBanners.length} activos)</span>
            </h2>

            <div className="flex items-center gap-1 text-xs">
              {activeBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPreviewSlideIdx(i)}
                  className={`w-6 h-6 rounded-full text-xs font-mono transition-all cursor-pointer ${
                    i === previewSlideIdx
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-border/80 shadow-xl bg-neutral-950 min-h-[280px] sm:min-h-[320px] flex items-center p-6 sm:p-10 text-white">
            <Image
              src={activeSlide.image}
              alt={activeSlide.title}
              fill
              className="object-cover object-center transition-all duration-700"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

            <div className="relative z-10 space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeSlide.tagColor || '#E63946' }} />
                <span>{activeSlide.tag}</span>
              </div>

              <h3 className="font-bebas text-3xl sm:text-5xl lg:text-6xl tracking-wide leading-[0.98] drop-shadow-md">
                {activeSlide.title}{' '}
                {activeSlide.titleAccent && (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF85A2] via-[#E63946] to-[#D4A017]">
                    {activeSlide.titleAccent}
                  </span>
                )}
              </h3>

              <p className="text-xs sm:text-sm text-white/85 max-w-xl line-clamp-2">
                {activeSlide.subtitle}
              </p>

              {activeSlide.features && activeSlide.features.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {activeSlide.features.map((f, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15 text-white/90"
                    >
                      <Icons.check className="w-3 h-3 text-[#25D366]" />
                      {f}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="px-5 py-2.5 rounded-xl bg-[#E63946] font-semibold text-xs text-white shadow-lg shadow-[#E63946]/40">
                  {activeSlide.primaryActionLabel}
                </span>
                <span className="px-4 py-2.5 rounded-xl bg-white/15 font-semibold text-xs text-white border border-white/30 backdrop-blur-md">
                  {activeSlide.secondaryActionLabel}
                </span>
              </div>
            </div>

            <div className="absolute top-4 right-4 hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-mono">
              <span>Slide {previewSlideIdx + 1} de {activeBanners.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Slides y Administración */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Listado de Banners ({banners.length})</h2>
          <span className="text-xs text-muted-foreground">
            Usá las flechas para cambiar el orden de aparición.
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Icons.spinner className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Cargando banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed rounded-2xl p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground">
              <Icons.media className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base">No hay banners configurados</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Creá tu primer banner promocional o restablecé las diapositivas oficiales de JG Store.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button onClick={() => setIsResetDialogOpen(true)} variant="outline" size="sm" className="cursor-pointer">
                Restablecer Predeterminados
              </Button>
              <Button onClick={handleOpenCreateModal} size="sm" className="bg-[#E63946] hover:bg-[#d62839] text-white cursor-pointer">
                + Crear Primer Banner
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`relative rounded-2xl border p-4 sm:p-5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
                  banner.isActive !== false
                    ? 'border-border/80 bg-card hover:border-primary/40 shadow-xs'
                    : 'border-border/40 bg-muted/20 opacity-70'
                }`}
              >
                {/* Lado Izquierdo: Miniatura y Contenido */}
                <div className="flex items-start sm:items-center gap-4 w-full md:w-auto flex-1">
                  {/* Reordenador Vertical */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveOrder(index, 'up')}
                      aria-label="Mover arriba"
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Icons.chevronUp className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-bold w-5 text-center text-muted-foreground">
                      0{index + 1}
                    </span>
                    <button
                      type="button"
                      disabled={index === banners.length - 1}
                      onClick={() => handleMoveOrder(index, 'down')}
                      aria-label="Mover abajo"
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Icons.chevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Imagen Miniatura */}
                  <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-border shadow-xs bg-muted">
                    <Image
                      src={banner.image}
                      alt={banner.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute top-1 left-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block shadow-xs"
                        style={{ backgroundColor: banner.tagColor || '#E63946' }}
                      />
                    </div>
                  </div>

                  {/* Textos del Banner */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold text-muted-foreground truncate max-w-xs">
                        {banner.tag}
                      </span>
                      {banner.isActive !== false ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30">
                          ACTIVO
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                          PAUSADO
                        </span>
                      )}
                    </div>

                    <h3 className="font-bebas text-xl sm:text-2xl tracking-wide leading-tight text-foreground truncate">
                      {banner.title}{' '}
                      {banner.titleAccent && (
                        <span className="text-[#E63946]">{banner.titleAccent}</span>
                      )}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {banner.subtitle}
                    </p>

                    {/* Botones configurados */}
                    <div className="flex items-center gap-2 pt-0.5 text-[11px] text-muted-foreground flex-wrap">
                      <span className="inline-flex items-center gap-1 font-medium bg-muted px-2 py-0.5 rounded-md">
                        <Icons.product className="w-3 h-3 text-primary" />
                        {banner.primaryActionLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium bg-muted px-2 py-0.5 rounded-md">
                        <Icons.whatsapp className="w-3 h-3 text-[#25D366]" />
                        {banner.secondaryActionLabel}
                      </span>
                      {banner.features && banner.features.length > 0 && (
                        <span className="text-muted-foreground">
                          • {banner.features.length} beneficios
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lado Derecho: Acciones y Switch */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 shrink-0">
                  {/* Switch Activar/Pausar */}
                  <label className="relative inline-flex items-center cursor-pointer" title={banner.isActive ? 'Pausar banner' : 'Activar banner'}>
                    <input
                      type="checkbox"
                      checked={banner.isActive !== false}
                      onChange={() => handleToggleActive(banner)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#25D366]"></div>
                  </label>

                  {/* Botón Duplicar */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDuplicateBanner(banner)}
                    title="Duplicar este banner"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Icons.copy className="w-4 h-4" />
                  </Button>

                  {/* Botón Editar */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditModal(banner)}
                    className="h-8 px-3 text-xs rounded-xl cursor-pointer"
                  >
                    <Icons.edit className="w-3.5 h-3.5 mr-1" />
                    <span>Editar</span>
                  </Button>

                  {/* Botón Eliminar */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setBannerToDelete(banner)}
                    title="Eliminar banner"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    <Icons.trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Crear / Editar */}
      <BannerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchBanners}
        initialData={editingBanner}
      />

      {/* Diálogo de Confirmación para Eliminar */}
      <AlertDialog
        open={!!bannerToDelete}
        onOpenChange={(open) => !open && setBannerToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este banner del carrusel?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar el banner <strong>"{bannerToDelete?.title}"</strong> de la portada.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing} className="cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isProcessing}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer"
            >
              {isProcessing ? 'Eliminando...' : 'Sí, Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de Restablecer Valores Predeterminados */}
      <AlertDialog
        open={isResetDialogOpen}
        onOpenChange={(open) => !open && setIsResetDialogOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Restablecer carrusel a valores oficiales?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto reemplazará todos los banners actuales con los 4 slides oficiales de fábrica de JG Store
              (Modo Mayorista, Bazar & Tendencias, Gadgets Smart y Medios de Pago con 10% OFF).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing} className="cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetDefaults}
              disabled={isProcessing}
              className="bg-[#E63946] hover:bg-[#d62839] text-white cursor-pointer"
            >
              {isProcessing ? 'Restableciendo...' : 'Restablecer Ahora'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
