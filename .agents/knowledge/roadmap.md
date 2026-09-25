# Roadmap & Backlog de Tareas - JG Store

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
  - `ProductCard`: Semáforo de stock (En stock / Últimas unidades / Agotado), doble precio dinámico, selector de cantidad con tope de stock e indicador de ahorro mayorista.
  - `ProductGrid`: Cuadrícula responsiva con filtros por stock, categoría, búsqueda y ordenamiento.
  - `ProductQuickView`: Modal de detalle con escala de precios y especificaciones.
  - `CartDrawer`: Panel lateral deslizable con cálculo de ahorro mayorista, formulario de cliente y checkout automatizado vía WhatsApp.
  - `StoreFooter`: Pie de página departamental y condiciones comerciales.
- [x] **Integración WhatsApp:** Generación de mensajes estructurados con desglose de SKUs, ahorros y datos en `src/lib/whatsapp.ts`.
- [x] **Control de Stock y Conexión Supabase:** Servicio `src/lib/store-service.ts` con soporte PostgREST (Dokploy) y fallback resiliente.
- [x] **Script DDL Supabase:** Migración SQL `supabase/migrations/20260917_create_products_table.sql`.

---

### 🟡 Fase 3: Tareas Pendientes Inmediatas (Backlog Activo)
- [ ] Ejecutar migración SQL en la base de datos PostgreSQL de Dokploy (`http://jg-store-bd.press-cloud.com`) para persistir productos en BD remota.
- [ ] Panel de Gestión de Stock en `/dashboard/product` adaptado al modelo B2B/B2C para editar stock y precios mayoristas desde el admin.
- [ ] Subida de imágenes a Supabase Storage Bucket (`products`).

---

### ⚪ Fase 4: Autenticación & Expansión (Pospuesto intencionalmente)
- [ ] Conexión de producción con Clerk cuando el usuario proporcione credenciales activas.
- [ ] Pasarela de pago complementaria a WhatsApp (opcional).
- [ ] Despliegue en producción con SSL/Traefik en Dokploy.
