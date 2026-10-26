'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { ProductCategory } from '@/constants/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryFormModal, CategoryFormData } from './category-form-modal';
import { toast } from 'sonner';
import Link from 'next/link';

export function CategoriesView() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryFormData | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const loadCategories = () => {
    setIsLoading(true);
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: ProductCategory) => {
    setEditingCategory({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || 'package',
      image_url: cat.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (cat: ProductCategory) => {
    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar el departamento "${cat.name}"?\nEsta acción lo quitará de la vitrina y del catálogo.`
      )
    ) {
      return;
    }

    setDeletingSlug(cat.slug);
    try {
      const res = await fetch(
        `/api/categories?id=${encodeURIComponent(cat.id || cat.slug)}&slug=${encodeURIComponent(cat.slug)}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        toast.success(`Departamento "${cat.name}" eliminado correctamente`);
        loadCategories();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'No se pudo eliminar el departamento');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error de conexión');
    } finally {
      setDeletingSlug(null);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  return (
    <div className="space-y-6 font-gotham">
      {/* BARRA SUPERIOR: BUSCADOR + BOTÓN CREAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Icons.search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar departamento por nombre o slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-xs bg-muted/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadCategories}
            variant="outline"
            size="sm"
            className="h-10 text-xs gap-1.5 cursor-pointer"
            title="Refrescar departamentos"
          >
            <Icons.refresh className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </Button>

          <Button
            onClick={handleOpenCreate}
            className="h-10 text-xs font-bold gap-2 bg-[#E63946] hover:bg-[#d02e3b] text-white shadow-md shadow-[#E63946]/20 cursor-pointer active:scale-95"
          >
            <Icons.add className="w-4 h-4" />
            <span>Nuevo Departamento</span>
          </Button>
        </div>
      </div>

      {/* METRICAS RÁPIDAS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border/70 bg-card/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#E63946]/10 text-[#E63946] flex items-center justify-center">
            <Icons.layout className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Departamentos
            </p>
            <p className="text-xl font-bold text-foreground">{categories.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/70 bg-card/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#D4A017]/10 text-[#D4A017] flex items-center justify-center">
            <Icons.sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Con Foto Activa
            </p>
            <p className="text-xl font-bold text-foreground">
              {categories.filter((c) => c.imageUrl).length}
            </p>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-xl border border-border/70 bg-card/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Icons.tags className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Subcategorías Hojas
            </p>
            <p className="text-xl font-bold text-foreground">
              {categories.reduce((acc, c) => acc + (c.subcategories?.length || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* GRID DE DEPARTAMENTOS CON SU FOTO CIRCULAR */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl border border-border/60 bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card">
          <Icons.package className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-bold text-foreground">No se encontraron departamentos</p>
          <p className="text-xs text-muted-foreground mt-1">
            Intenta con otro término o haz clic en &quot;Nuevo Departamento&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <CategoryCardItem
              key={cat.id || cat.slug}
              cat={cat}
              deletingSlug={deletingSlug}
              onEdit={() => handleOpenEdit(cat)}
              onDelete={() => handleDeleteCategory(cat)}
            />
          ))}
        </div>
      )}

      {/* MODAL DE CREACIÓN / EDICIÓN */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadCategories}
        initialData={editingCategory}
      />
    </div>
  );
}

function CategoryCardItem({
  cat,
  deletingSlug,
  onEdit,
  onDelete
}: {
  cat: ProductCategory;
  deletingSlug: string | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="group p-4 rounded-2xl border border-border/80 hover:border-[#E63946]/50 bg-card hover:bg-card/90 transition-all shadow-xs hover:shadow-md flex items-center justify-between gap-4">
      {/* Lado izquierdo: Foto circular idéntica al storefront + datos */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative w-14 h-14 rounded-full p-0.5 border-2 border-[#E63946] shadow-sm shrink-0 overflow-hidden bg-muted/40">
          <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
            {cat.imageUrl && !hasError ? (
              <Image
                src={cat.imageUrl}
                alt={cat.name}
                fill
                sizes="56px"
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                onError={() => setHasError(true)}
              />
            ) : (
              <Icons.package className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-bold text-foreground truncate group-hover:text-[#E63946] transition-colors">
            {cat.name}
          </h3>
          <p className="text-[11px] font-mono text-muted-foreground truncate">
            /{cat.slug}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {cat.subcategories?.length || 0} subcategorías
          </p>
        </div>
      </div>

      {/* Lado derecho: Acciones */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Link
          href={`/?category=${cat.slug}`}
          target="_blank"
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-[#E63946] hover:bg-[#E63946]/10 border border-border/70 hover:border-[#E63946]/30 transition-all cursor-pointer"
          title="Ver en la tienda online"
        >
          <Icons.externalLink className="w-3.5 h-3.5" />
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-[#E63946] cursor-pointer"
        >
          <Icons.edit className="w-3.5 h-3.5 mr-1 text-[#D4A017]" />
          Editar
        </Button>

        <Button
          variant="ghost"
          size="icon"
          disabled={deletingSlug === cat.slug}
          onClick={onDelete}
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
          title="Eliminar departamento"
        >
          <Icons.trash className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
