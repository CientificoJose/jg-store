# Roadmap & Backlog de Tareas - JS Store

Este documento centraliza el estado actual de las tareas para que cualquier IA o miembro del equipo sepa exactamente qué está hecho, qué está pendiente y en qué orden ejecutarlo.

---

## 📋 Estado de Tareas

### 🟢 Fase 1: Inicialización & Cimientos (Completado)
- [x] Crear repositorio de GitHub: [https://github.com/CientificoJose/jg-store](https://github.com/CientificoJose/jg-store)
- [x] Configuración de runtime ultrarrápido con **Bun**.
- [x] Integración de la plantilla base Next.js 16 + shadcn/ui + Tailwind v4.
- [x] Creación de la Skill y Reglas de Bun (`use-bun`).
- [x] Creación del Sistema de Continuidad y Grafo de Conocimiento (`.agents/knowledge/`).

---

### 🟢 Fase 2: Concepto Comercial, 24 Categorías y Storefront Frontend (Completado)
- [x] **24 Categorías Oficiales:** Mapeo tipado en `src/constants/categories.ts` (Aromatización, Bazar, Juguetería, Librería, Marroquinería, etc.).
- [x] **Reglas de Negocio Dual:** Venta al Detal (B2C) y Venta al Mayor (B2B) a partir de umbral $X$ unidades (`business-rules.md`).
- [x] **Branding & Identidad Visual Oficial:**
  - Paleta de marca institucional: `#E63946` (Rojo Pasión / Principal), `#FF85A2` (Rosa Cálido / Acentos), `#D4A017` (Dorado Calidad / Mayorista VIP), `#F8F8F7` & `#FFFFFF` (Superficie / Blanco Diurno), `#6C757D` (Gris Pizarra / Neutros).
  - Tipografías oficiales: **Bebas Neue Cyrillic** (Display / Títulos) y **Gotham** (UI / Textos / Botones).
  - Tema oficial `jg-store` configurado en `src/styles/themes/jg-store.css`.
  - Skill de diseño [`.agents/skills/brand-design-system/SKILL.md`](../skills/brand-design-system/SKILL.md).
  - Selector interactivo **Modo Diurno / Modo Nocturno** en el header con fondo blanco puro (`#ffffff`) para modo diurno y modo oscuro refinado (`#111215`).
- [x] **Catálogo Inicial Representativo:** 27 productos con SKUs reales, imágenes HD, precios detal/mayor y stock en `src/constants/initial-catalog.ts`.
- [x] **Storefront Moderno:**
  - `StoreHeader`: Buscador en tiempo real, menú de 24 categorías, conmutador de modo mayorista y carrito con badge dinámico.
  - `CategoryBar`: Barra deslizante con las 24 categorías oficiales e iconos semánticos.
  - `HeroBanner`: Propuesta de valor B2B/B2C, 4 pilares de confianza y accesos directos.
  - `PromoCarousel`: Carrusel interactivo de banners promocionales de alta definición (auto-play con pausa al posar el cursor, swipe táctil, botones de navegación e indicadores pill) con 4 campañas argentinas: Compra Mayorista desde $50.000, Aromatización & Bazar, Gadgets & Tecnología Smart, y 10% OFF en transferencias CBU/Alias.
  - `ProductCard`: Semáforo de stock (En stock / Últimas unidades / Agotado), doble precio dinámico, selector de cantidad con tope de stock e indicador de ahorro mayorista.
  - `ProductGrid`: Cuadrícula responsiva con filtros por stock, categoría, búsqueda y ordenamiento.
  - `ProductQuickView`: Modal de detalle con escala de precios y especificaciones.
  - `CartDrawer`: Panel lateral deslizable con cálculo de ahorro mayorista, formulario de cliente y checkout automatizado vía WhatsApp.
  - `StoreFooter`: Pie de página departamental y condiciones comerciales.
- [x] **Experiencia de Búsqueda Inteligente y Sugerencias de Catálogo:**
  - Ocultamiento dinámico del carrusel / hero banner al escribir en el buscador para enfocar los resultados de productos.
  - **Motor Híbrido Nativo (`src/lib/search-engine.ts`):** Búsqueda difusa (Fuzzy Levenshtein) para corrección automática de errores tipográficos (ej. *"cuaderbo"* ➔ *"cuaderno"*) y matriz de conceptos/sinónimos polirrubro (ej. *"telefono"* ➔ *"Tecnología, Celulares y Gadgets"* mostrando lámpara con carga Qi, mochila USB, etc.).
  - Banner inteligente en `ProductGrid`: informa con precisión cuando los productos mostrados son por relación temática (*"No encontramos productos llamados X, pero encontramos artículos relacionados en Y"*) o corrección ortográfica (*"Mostrando resultados para Z"*).
  - Alerta ultra-compacta en banner horizontal cuando no hay coincidencias exactas ni afines, dejando espacio visible para los productos sugeridos y más vendidos.
  - Acciones rápidas de "Limpiar búsqueda" y "Ver todo el catálogo".
- [x] **Integración WhatsApp:** Generación de mensajes estructurados con desglose de SKUs, ahorros y datos en `src/lib/whatsapp.ts`.
- [x] **Branding & Logos Oficiales:**
  - Favicon e Isotipo oficial para pestañas (`src/app/icon.png`, `public/brand/logo-icon.png`, etc.) con escalado multiformato.
  - Logo oficial institucional JG-STORE POLIRUBRO (`public/brand/logo-full.png`, `public/brand/logo-full-dark.png`) con cambio automático por modo nocturno/diurno en `src/components/brand/logo.tsx`.
- [x] **Sistema de Favoritos y Usuarios:**
  - Esquema de base de datos SQL para `users`, `favorites` y vista `vw_favoritos_detalle` en `supabase/migrations/20260925_create_users_and_favorites_tables.sql`.
  - Store Zustand con persistencia en LocalStorage (`src/hooks/use-favorites-store.ts`).
  - Botón de guardado rápido de favoritos (corazón) en tarjetas de productos y modal.
  - Filtro interactivo de favoritos con contador en el header de la tienda y enlace a la página dedicada.
  - **Página Dedicada de "Mis Favoritos" (`/favoritos`):**
    - Vista personalizada con resumen del valor total referencial al Detal y al Mayor con cálculo de ahorro potencial acumulado.
    - Acciones masivas con un solo clic: *"Agregar Todos al Carrito"* (respetando la modalidad de tarifa activa) y *"Cotizar Todos por WhatsApp"* (mensaje formateado con desglose de SKUs, rubros y montos).
    - Estado vacío amigable (Empty State) con botón de exploración y sección de sugerencias de productos destacados.
- [x] **Página de Producto en Grande Estilo Mercado Libre (`/producto/[id]`):**
  - Componente `ProductDetailView` con diseño idéntico a Mercado Libre adaptado a la identidad JG Store:
    - Migas de pan de navegación (`Volver al catálogo > Inicio > Categoría > Producto`).
    - Galería con miniaturas verticales a la izquierda y visor de foto principal con zoom.
    - Badges de condición ("Nuevo", "+500 vendidos", 4.9 estrellas).
    - Bloque de precios dual (Detal vs Mayor con % de descuento).
    - Selector interactivo de colores/variantes.
    - **Caja de compra (Buy Box):** Disponibilidad en depósito con indicador pulsante, selector de cantidad con tope de stock y feedback de tarifa mayorista, botón primario "Comprar Ahora por WhatsApp" (mensaje estructurado directo), botón secundario "Agregar al Carrito", y sellos de Envío Nacional + Compra Protegida JG Store.
    - Descripción detallada y tabla de especificaciones técnicas (SKU, rubro, venta, garantía).
    - Carrusel / Cuadrícula de recomendaciones: *"Quienes vieron este producto también compraron"*.
  - Enrutamiento dinámico en App Router (`src/app/producto/[id]/page.tsx`) con metadatos OpenGraph SEO automáticos.
  - Enlaces directos desde las tarjetas de producto (`ProductCard`) y modal de vista rápida.
- [x] **Localización para el Mercado Argentino (Polirrubro B2B / B2C) y Barra Mayorista:**
  - Catálogo actualizado a valores reales en Pesos Argentinos (`$` ARS) en `initial-catalog.ts` y script SQL de Supabase.
  - Formato de moneda `es-AR` sin decimales espurios (`formatPrice`).
  - **Barra de Progreso Dinámica de Compra Mayorista ($ 50.000 ARS)** en `CartDrawer`: desbloqueo automático de precios mayoristas en toda la cesta al alcanzar el monto global de $ 50.000 ARS, o por volumen unitario.
  - Checkout y cotización por WhatsApp con campos argentinos: CUIT/DNI, Factura A (Responsable Inscripto) vs Factura B (Consumidor Final), Provincia, Código Postal y tipo de logística (Andreani / Correo Arg / Expreso al interior).
  - Medios de pago argentinos: Mercado Pago y Transferencia CBU/Alias con 10% OFF.
  - Hero banner y footer con bandera 🇦🇷, voseo y propuesta de valor nacional.

---

### 🟢 Fase 3: Administración y Gestión de Catálogo JG Store (En curso)
- [x] **Panel de Gestión de Productos y Stock JG Store (`/dashboard/product`):**
  - Tabla de administración conectada a la capa de servicio real de JG Store:
    - Foto del producto con fallback.
    - Código SKU con estilo mono badge.
    - Nombre del producto con descripción.
    - Filtro y badge con los 24 departamentos oficiales (`PRODUCT_CATEGORIES`).
    - Semáforo de stock (Disponible verde, últimas unidades rojo, agotado gris).
    - Doble precio: PVP Detal y Tarifa Mayorista con porcentaje de ahorro y umbral de unidades.
    - Menú de acciones: *"Ver en Tienda (Mercado Libre)"*, *"Editar Producto"* y *"Eliminar"*.
  - Formulario de creación y edición (`/dashboard/product/new` y `/dashboard/product/[id]`):
    - Gestión de SKU, nombre, 24 departamentos, unidad de venta, PVP detal, tarifa mayor, mínimo mayorista, stock y URL de foto con vista previa en vivo.
    - Sincronización instantánea con el catálogo de la tienda y la base de datos Supabase PostgREST.
- [x] **Panel de Gestión de Usuarios y Clientes Mayoristas (`/dashboard/users`):**
  - Tabla de administración adaptada al modelo B2B/B2C con Cliente/Contacto, Razón Social / Empresa, RIF/CUIT, enlace directo a WhatsApp, Tipo de Cuenta (Mayorista B2B VIP, Cliente al Detal, Administrador, Asesor Comercial), Estado (Activo, Pendiente Aprobación, Inactivo) y contador de pedidos.
  - Cajón lateral interactivo (`Sheet`) para registro y edición de clientes/usuarios con validación Zod.
- [x] **Panel de Gestión de Pedidos y Cotizaciones (`/dashboard/orders`):**
  - Módulo completo adaptado a Argentina con soporte B2B Mayorista y B2C Minorista:
    - **4 Tarjetas de Métricas Ejecutivas:** Total Facturado en Pesos Argentinos (`$` ARS), Pedidos Mayoristas B2B, Pedidos Minoristas B2C y Pendientes de Despacho en depósito.
    - **Tabla de Pedidos TanStack Table + nuqs:** Búsqueda en tiempo real por número de orden, cliente, CUIT/DNI o localidad; filtros por Tipo de Venta (Mayorista B2B / Minorista B2C), Estado del Pedido (Nueva, En Preparación, Lista p/ Despacho, Completada, Cancelada) y Estado de Pago (Pagado / Pendiente).
    - **Ficha y Cajón Lateral de Pedido (`OrderDetailSheet`):**
      - Datos fiscales AFIP: Factura A (Responsable Inscripto con CUIT) y Factura B (Consumidor Final con DNI).
      - Integración WhatsApp con un clic: mensaje pre-armado con número de orden, nombre y monto en ARS.
      - Logística nacional: Andreani, Correo Argentino, Retiro en Depósito o Expreso de Carga al interior con editor de número de guía/remito en vivo.
      - Desglose financiero: Subtotal, Ahorro Mayorista, Descuento Transferencia CBU (10% OFF), Flete y Total final en `$ ARS`.
      - Desglose de ítems con miniaturas, SKUs, unidades y precios unitarios.
      - Selector de cambio de estado operativo y botón para imprimir Remito Oficial de Despacho.
  - Migración SQL en `supabase/migrations/20260926_create_orders_tables.sql` con tablas `orders` y `order_items` con RLS e índices.
- [ ] **Carga Masiva de Productos (Bulk Import & Upsert Excel/CSV):** *(En pausa estratégica)* — Propuesta estructurada en ADR 005 para definir formato final (Excel vs CSV vs integración) y flujo operativo con el usuario.
- [ ] Ejecutar migración SQL en la base de datos PostgreSQL de Dokploy (`http://jg-store-bd.press-cloud.com`) para persistir productos en BD remota.
- [ ] Subida de imágenes a Supabase Storage Bucket (`products`).

---

### ⚪ Fase 4: Autenticación & Expansión (Pospuesto intencionalmente)
- [x] **Optimización de Build en Docker para Dokploy:** Fijación de Bun a `1.3.13` y remoción de `--frozen-lockfile` en `Dockerfile` y `Dockerfile.bun` para evitar fallos de parseo en cosmiconfig.
- [ ] Conexión de producción con Clerk cuando el usuario proporcione credenciales activas.
- [ ] Pasarela de pago complementaria a WhatsApp (opcional).
- [ ] Despliegue en producción con SSL/Traefik en Dokploy.
