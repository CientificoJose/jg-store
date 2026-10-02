import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProductRowConfig {
  id: string;
  title: string;
  subtitle?: string;
  type: 'trending' | 'wholesale' | 'category' | 'new';
  categorySlug?: string;
  enabled: boolean;
  limit: number;
}

export interface GeneralStoreConfig {
  whatsappNumber: string;
  storeName: string;
  storeTagline: string;
  footerDescription: string;
  address: string;
  email: string;
  cuit: string;
  schedule: string;
  socialInstagram: string;
  socialFacebook: string;
  socialTikTok: string;
}

export interface LandingStoreConfig {
  showCategoryCards: boolean;
  showCategoryPillsBar: boolean;
  categoryStyle: 'photos' | 'pills';
  announcementText: string;
  showAnnouncement: boolean;
  showTrustBadges: boolean;
  showOfficialStoreFilter: boolean;
  showWholesaleHeaderToggle?: boolean;
  showInStockSidebarFilter?: boolean;
  showWholesaleSidebarFilter?: boolean;
  productRows: ProductRowConfig[];
}

export interface ThemeStoreConfig {
  activeTheme: string;
  defaultMode: 'light' | 'dark' | 'system';
}

interface StoreConfigState {
  general: GeneralStoreConfig;
  landing: LandingStoreConfig;
  theme: ThemeStoreConfig;

  // Actions
  updateGeneral: (data: Partial<GeneralStoreConfig>) => void;
  updateLanding: (data: Partial<LandingStoreConfig>) => void;
  updateTheme: (data: Partial<ThemeStoreConfig>) => void;
  toggleProductRow: (rowId: string) => void;
  addProductRow: (row: ProductRowConfig) => void;
  removeProductRow: (rowId: string) => void;
  reorderProductRows: (newRows: ProductRowConfig[]) => void;
  resetToDefaults: () => void;
}

const DEFAULT_ROWS: ProductRowConfig[] = [
  {
    id: 'row-trending',
    title: '🔥 Tendencias & Más Vendidos',
    subtitle: 'Los artículos preferidos por nuestros clientes minoristas y comerciantes.',
    type: 'trending',
    enabled: true,
    limit: 8
  },
  {
    id: 'row-wholesale',
    title: '⚡ Oportunidades Mayoristas B2B',
    subtitle: 'Máximo margen de ganancia para revendedores con descuentos de hasta 40%.',
    type: 'wholesale',
    enabled: true,
    limit: 8
  },
  {
    id: 'row-bazar',
    title: '☕ Bazar & Cafetería Térmica',
    subtitle: 'Botellas de acero inoxidable, termos y artículos de cocina con stock inmediato.',
    type: 'category',
    categorySlug: 'bazar-cocina',
    enabled: true,
    limit: 6
  },
  {
    id: 'row-electro',
    title: '🎧 Electro, Iluminación & Gadgets',
    subtitle: 'Carga inalámbrica Qi, lámparas táctiles LED y accesorios de tecnología.',
    type: 'category',
    categorySlug: 'electro',
    enabled: true,
    limit: 6
  }
];

const DEFAULT_CONFIG: {
  general: GeneralStoreConfig;
  landing: LandingStoreConfig;
  theme: ThemeStoreConfig;
} = {
  general: {
    whatsappNumber: '5491155550000',
    storeName: 'JG Store Polirrubro',
    storeTagline: 'Distribuidora Mayorista & Venta al Detal',
    footerDescription:
      'Distribuidora oficial y polirrubro líder en ventas al por mayor y menor. Catálogo con más de 24 departamentos comerciales, envíos seguros a todo el país y precios directos con descuentos automáticos por volumen.',
    address: 'Av. Corrientes 1234, CABA, Argentina',
    email: 'ventas@jgstore.com.ar',
    cuit: '30-71234567-8',
    schedule: 'Lunes a Sábado de 8:00 a 18:00 hs',
    socialInstagram: 'https://instagram.com/jgstore.oficial',
    socialFacebook: 'https://facebook.com/jgstore.argentina',
    socialTikTok: 'https://tiktok.com/@jgstore.polirrubro'
  },
  landing: {
    showCategoryCards: true,
    showCategoryPillsBar: false,
    categoryStyle: 'photos', // Fotos estilo SHOPLUXE
    announcementText:
      '⚡ COMPRA MAYORISTA DESDE $50.000 — 10% OFF EXTRA EN TRANSFERENCIA CBU / ALIAS 🇦🇷',
    showAnnouncement: true,
    showTrustBadges: false, // Ocultado por solicitud (activable desde panel de config)
    showOfficialStoreFilter: false, // Ocultado por solicitud (activable desde panel de config)
    showWholesaleHeaderToggle: false, // Ocultado por solicitud (activable desde panel de config)
    showInStockSidebarFilter: false, // Ocultado por solicitud (activable desde panel de config)
    showWholesaleSidebarFilter: false, // Ocultado por solicitud (activable desde panel de config)
    productRows: DEFAULT_ROWS
  },
  theme: {
    activeTheme: 'jg-store',
    defaultMode: 'light'
  }
};

export const useStoreConfigStore = create<StoreConfigState>()(
  persist(
    (set) => ({
      general: DEFAULT_CONFIG.general,
      landing: DEFAULT_CONFIG.landing,
      theme: DEFAULT_CONFIG.theme,

      updateGeneral: (data) =>
        set((state) => ({
          general: { ...state.general, ...data }
        })),

      updateLanding: (data) =>
        set((state) => ({
          landing: { ...state.landing, ...data }
        })),

      updateTheme: (data) =>
        set((state) => ({
          theme: { ...state.theme, ...data }
        })),

      toggleProductRow: (rowId) =>
        set((state) => ({
          landing: {
            ...state.landing,
            productRows: state.landing.productRows.map((r) =>
              r.id === rowId ? { ...r, enabled: !r.enabled } : r
            )
          }
        })),

      addProductRow: (row) =>
        set((state) => ({
          landing: {
            ...state.landing,
            productRows: [...state.landing.productRows, row]
          }
        })),

      removeProductRow: (rowId) =>
        set((state) => ({
          landing: {
            ...state.landing,
            productRows: state.landing.productRows.filter((r) => r.id !== rowId)
          }
        })),

      reorderProductRows: (newRows) =>
        set((state) => ({
          landing: {
            ...state.landing,
            productRows: newRows
          }
        })),

      resetToDefaults: () =>
        set({
          general: DEFAULT_CONFIG.general,
          landing: DEFAULT_CONFIG.landing,
          theme: DEFAULT_CONFIG.theme
        })
    }),
    {
      name: 'jg-store-config-v1'
    }
  )
);
