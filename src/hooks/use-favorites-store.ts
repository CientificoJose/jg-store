import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FavoritesStore {
  favoriteIds: string[];
  showOnlyFavorites: boolean;

  // Acciones
  toggleFavorite: (productId: string) => boolean;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
  setShowOnlyFavorites: (val: boolean) => void;
  toggleShowOnlyFavorites: () => void;
  getCount: () => number;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      showOnlyFavorites: false,

      toggleFavorite: (productId: string) => {
        const { favoriteIds } = get();
        const exists = favoriteIds.includes(productId);

        if (exists) {
          set({ favoriteIds: favoriteIds.filter((id) => id !== productId) });
          return false; // Eliminado
        } else {
          set({ favoriteIds: [...favoriteIds, productId] });
          return true; // Agregado
        }
      },

      isFavorite: (productId: string) => {
        return get().favoriteIds.includes(productId);
      },

      clearFavorites: () => {
        set({ favoriteIds: [], showOnlyFavorites: false });
      },

      setShowOnlyFavorites: (val: boolean) => {
        set({ showOnlyFavorites: val });
      },

      toggleShowOnlyFavorites: () => {
        set((state) => ({ showOnlyFavorites: !state.showOnlyFavorites }));
      },

      getCount: () => {
        return get().favoriteIds.length;
      }
    }),
    {
      name: 'jg-store-favorites-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favoriteIds: state.favoriteIds
      })
    }
  )
);
