'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductCategory } from '@/constants/categories';

// Caché en memoria para evitar llamadas redundantes repetitivas
let memoryCategories: ProductCategory[] | null = null;
const subscribers = new Set<(cats: ProductCategory[]) => void>();

export function useCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>(memoryCategories || []);
  const [isLoading, setIsLoading] = useState<boolean>(!memoryCategories);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          memoryCategories = data;
          setCategories(data);
          subscribers.forEach((fn) => fn(data));
        }
      }
    } catch (err) {
      console.warn('[useCategories] Error al cargar categorías dinámicas:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Si aún no están en memoria, buscarlas
    if (!memoryCategories) {
      refetch();
    } else {
      setCategories(memoryCategories);
      setIsLoading(false);
    }

    // Suscripción a actualizaciones compartidas
    const handleUpdate = (cats: ProductCategory[]) => {
      setCategories(cats);
    };
    subscribers.add(handleUpdate);

    // Escuchar evento global cuando se agrega, edita o elimina una categoría
    const onCategoriesUpdated = () => {
      refetch();
    };
    window.addEventListener('categories-updated', onCategoriesUpdated);

    return () => {
      subscribers.delete(handleUpdate);
      window.removeEventListener('categories-updated', onCategoriesUpdated);
    };
  }, [refetch]);

  return {
    categories,
    isLoading,
    refetch
  };
}

/**
 * Función auxiliar para notificar a toda la aplicación que las categorías han cambiado.
 */
export function notifyCategoriesChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('categories-updated'));
  }
}

