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

export interface CategoryFormData {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image_url?: string;
  display_order?: number;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: CategoryFormData | null;
}

const ICON_OPTIONS = [
  { id: 'package', label: 'Paquete', icon: Icons.package },
  { id: 'sparkles', label: 'Destello', icon: Icons.sparkles },
  { id: 'shirt', label: 'Ropa / Moda', icon: Icons.shirt },
  { id: 'coffee', label: 'Bazar / Café', icon: Icons.coffee },
  { id: 'deviceLaptop', label: 'Electro', icon: Icons.laptop },
  { id: 'flame', label: 'Velas / Fuego', icon: Icons.flame },
  { id: 'palette', label: 'Arte', icon: Icons.palette },
  { id: 'pencil', label: 'Librería', icon: Icons.pencil },
  { id: 'puzzle', label: 'Juguetería', icon: Icons.puzzle },
  { id: 'heart', label: 'Peluchería', icon: Icons.heart },
  { id: 'briefcase', label: 'Bolsos / Maletines', icon: Icons.briefcase },
  { id: 'store', label: 'Comercio', icon: Icons.store },
];

const PRESET_IMAGES = [
  { label: 'Ropa & Deporte', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80' },
  { label: 'Tecnología', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80' },
  { label: 'Calzado & Zapatillas', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80' },
  { label: 'Hogar & Jardín', url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=300&auto=format&fit=crop&q=80' },
  { label: 'Juguetes', url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300&auto=format&fit=crop&q=80' },
];

function toSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CategoryFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData
}: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('package');
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localFilePreview, setLocalFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSlug(initialData.slug || '');
      setDescription(initialData.description || '');
      setIcon(initialData.icon || 'package');
      setImageUrl(initialData.image_url || '');
      setLocalFilePreview(null);
      setSelectedFile(null);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setIcon('package');
      setImageUrl('');
      setLocalFilePreview(null);
      setSelectedFile(null);
    }
  }, [initialData, isOpen]);

  // Autogenerar slug al escribir el nombre si no ha sido editado manualmente
  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialData) {
      setSlug(toSlug(val));
    }
  };

  // Manejo de archivo seleccionado
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setLocalFilePreview(objectUrl);
    }
  };

  const previewSrc = localFilePreview || imageUrl || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Por favor escribe el nombre de la categoría.');
      return;
    }

    setIsSubmitting(true);
    let finalImageUrl = imageUrl;

    try {
      // 1. Si hay un archivo subido, procesarlo primero en el backend
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('slug', slug || toSlug(name));

        const uploadRes = await fetch('/api/categories/upload', {
          method: 'POST',
          body: formData
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.url) {
            finalImageUrl = uploadData.url;
          }
        } else {
          toast.warning('No se pudo subir la imagen al servidor, se guardará con la anterior.');
        }
      }

      // 2. Guardar categoría
      const payload: CategoryFormData = {
        id: initialData?.id || slug || toSlug(name),
        name: name.trim(),
        slug: slug || toSlug(name),
        description: description.trim(),
        icon,
        image_url: finalImageUrl
      };

      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(`¡Departamento "${name}" guardado exitosamente!`);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Ocurrió un error al guardar.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error de conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-card border-border shadow-2xl p-0 overflow-hidden font-gotham">
        <DialogHeader className="p-6 pb-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E63946] animate-pulse" />
            <DialogTitle className="text-lg font-bold">
              {initialData ? 'Editar Departamento' : 'Crear Nuevo Departamento'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Configura el nombre y la foto circular que se mostrará en la vitrina de la tienda online.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* SECCIÓN SUPERIOR: FORMULARIO + PREVIEW CIRCULAR EN VIVO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* COLUMNA IZQUIERDA (2/3): CAMPOS */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <Label htmlFor="cat-name" className="text-xs font-semibold">
                  Nombre del Departamento <span className="text-[#E63946]">*</span>
                </Label>
                <Input
                  id="cat-name"
                  placeholder="Ej: Ropa Deportiva, Calzado, Bazar..."
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="mt-1.5 h-10 text-sm font-medium"
                  required
                />
              </div>

              <div>
                <Label htmlFor="cat-slug" className="text-xs font-semibold text-muted-foreground">
                  Identificador / Slug (Ruta URL)
                </Label>
                <div className="mt-1.5 flex items-center bg-muted/30 border border-border rounded-md px-3 h-9 text-xs">
                  <span className="text-muted-foreground mr-1 select-none">/categoria/</span>
                  <input
                    id="cat-slug"
                    value={slug}
                    onChange={(e) => setSlug(toSlug(e.target.value))}
                    placeholder="ropa-deportiva"
                    className="bg-transparent flex-1 text-foreground font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cat-desc" className="text-xs font-semibold text-muted-foreground">
                  Descripción Breve (Opcional)
                </Label>
                <textarea
                  id="cat-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve reseña para buscadores y menús desplegables..."
                  className="mt-1.5 w-full text-xs bg-background border border-border rounded-md p-2 outline-none focus:border-[#E63946] transition-colors"
                />
              </div>
            </div>

            {/* COLUMNA DERECHA (1/3): PREVIEW CIRCULAR EN TIEMPO REAL */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-muted/20 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Previsualización en Tienda
              </span>

              {/* Círculo idéntico a CategoryCircleItem de la tienda */}
              <div className="relative w-20 h-20 rounded-full p-0.5 border-2 border-[#E63946] shadow-lg shadow-[#E63946]/20 ring-4 ring-[#E63946]/20 transition-all overflow-hidden flex items-center justify-center">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-muted/50 flex items-center justify-center">
                  {previewSrc ? (
                    <Image
                      src={previewSrc}
                      alt={name || 'Vista previa'}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#E63946] to-[#D4A017] flex items-center justify-center text-white">
                      <Icons.sparkles className="w-7 h-7" />
                    </div>
                  )}
                </div>
              </div>

              {/* Nombre debajo del círculo */}
              <span className="text-xs font-bold text-foreground mt-2 max-w-[100px] line-clamp-2 leading-tight">
                {name || 'Nombre aquí'}
              </span>

              {previewSrc && (
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('');
                    setLocalFilePreview(null);
                    setSelectedFile(null);
                  }}
                  className="mt-1.5 text-[10px] text-destructive hover:underline font-semibold cursor-pointer"
                >
                  ✕ Quitar foto
                </button>
              )}

              <span className="text-[10px] text-muted-foreground mt-1">
                Explorar Departamentos
              </span>
            </div>
          </div>

          {/* SELECCIÓN DE IMAGEN (TABS: SUBIR ARCHIVO O PEGAR URL) */}
          <div className="border border-border/70 rounded-xl p-4 bg-background space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold">Imagen del Círculo</Label>
              <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    imageMode === 'upload'
                      ? 'bg-card text-foreground shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Subir desde PC
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    imageMode === 'url'
                      ? 'bg-card text-foreground shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Pegar URL
                </button>
              </div>
            </div>

            {imageMode === 'upload' ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-[#E63946]/80 rounded-xl p-4 text-center cursor-pointer transition-all hover:bg-muted/20 flex flex-col items-center justify-center gap-1.5"
                >
                  <Icons.upload className="w-5 h-5 text-muted-foreground" />
                  <p className="text-xs font-medium text-foreground">
                    {selectedFile ? selectedFile.name : 'Haz clic para seleccionar una foto'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    JPG, PNG o WEBP. Se optimizará y centrará en formato circular.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setLocalFilePreview(null);
                    setSelectedFile(null);
                  }}
                  className="h-9 text-xs"
                />
                {/* Presets rápidos para probar con un clic */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    Fotos de prueba:
                  </span>
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setImageUrl(preset.url);
                        setLocalFilePreview(null);
                        setSelectedFile(null);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 hover:bg-[#E63946]/10 hover:text-[#E63946] border border-border transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SELECTOR DE ICONO */}
          <div>
            <Label className="text-xs font-bold mb-2 block">Icono Representativo</Label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {ICON_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = icon === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setIcon(opt.id)}
                    className={`flex items-center gap-1.5 p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#E63946] bg-[#E63946]/10 text-[#E63946] font-bold shadow-xs'
                        : 'border-border/70 hover:border-border hover:bg-muted/30 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate text-[11px]">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs h-9 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#E63946] hover:bg-[#d02e3b] text-white text-xs font-bold h-9 gap-1.5 shadow-md shadow-[#E63946]/20 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Icons.spinner className="w-3.5 h-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Icons.check className="w-3.5 h-3.5" />
                  {initialData ? 'Guardar Cambios' : 'Crear Departamento'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
