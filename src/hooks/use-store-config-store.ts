import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StoreFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface AboutUsConfig {
  mission: string;
  vision: string;
  team: string;
  values: string;
  history: string;
  storePhotos: string[];
  faqs: StoreFaqItem[];
}

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
  bankName?: string;
  bankAccountHolder?: string;
  bankCbu?: string;
  bankAlias?: string;
}

export interface LandingStoreConfig {
  paymentPromoText?: string;
  transferDiscountPct?: number;
  showPaymentPromo?: boolean;
  catalogSectionTitle?: string;
  catalogMaxProducts?: number;
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
  aboutUs?: AboutUsConfig;
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
    socialTikTok: 'https://tiktok.com/@jgstore.polirrubro',
    bankName: 'Banco Santander / Mercado Pago',
    bankAccountHolder: 'JG Store Polirrubro',
    bankCbu: '0720000000000000000000',
    bankAlias: 'JG.STORE.PAGOS'
  },
  landing: {
    paymentPromoText: 'Cualquier tipo de pago • 3 cuotas sin interés con tarjeta • 10% OFF por transferencia',
    transferDiscountPct: 10,
    showPaymentPromo: false,
    catalogSectionTitle: 'Catálogo de Productos',
    catalogMaxProducts: 20,
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
    aboutUs: {
      mission:
        'Proveer a nuestros clientes la más alta variedad de productos al mejor precio del mercado, garantizando calidad, rapidez en las entregas y atención cercana y transparente.',
      vision:
        'Convertirnos en la tienda y polirrubro de referencia nacional, innovando continuamente en catálogo, tecnología de compras y servicio personalizado.',
      team:
        'Contamos con un equipo apasionado de especialistas comerciales, logística y atención al cliente, listos para asesorarte en cada compra y garantizar que tus productos lleguen en tiempo y forma.',
      values:
        'Confianza, transparencia, compromiso con nuestros clientes, pasión por el servicio y precios justos.',
      history:
        'Nacidos con la visión de acercar los mejores productos directo a familias y clientes, crecimos paso a paso gracias a la confianza de miles de compradores que nos eligen día a día.',
      storePhotos: [
        'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&auto=format&fit=crop&q=80'
      ],
      faqs: [
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
      ]
    },
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
