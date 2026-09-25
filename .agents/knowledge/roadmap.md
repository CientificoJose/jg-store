# Roadmap & Backlog de Tareas - JS Store

Este documento centraliza el estado actual de las tareas para que cualquier IA o miembro del equipo sepa exactamente qué está hecho, qué está pendiente y en qué orden ejecutarlo.

---

## 📋 Estado de Tareas

### 🟢 Fase 1: Inicialización & Cimientos (Completado)
- [x] Crear repositorio de GitHub: [https://github.com/CientificoJose/jg-store](https://github.com/CientificoJose/jg-store)
- [x] Configuración de runtime ultrarrápido con **Bun**.
- [x] Integración de la plantilla base Next.js + shadcn/ui + Tailwind v4.
- [x] Creación de la Skill y Reglas de Bun (`use-bun`).
- [x] Creación del Sistema de Continuidad y Grafo de Conocimiento (`.agents/knowledge/`).

---

### 🟡 Fase 2: Tareas Pendientes Inmediatas (Backlog Activo)

#### Tarea 1: Consolidar Concepto e Idea de Negocio (En progreso)
- **Estado:** 🟡 En progreso / Consolidación
- **Responsable:** Usuario + IA
- **Definiciones confirmadas:**
  - Tienda: **JS Store**
  - País & Moneda: **Argentina 🇦🇷 - Pesos Argentinos (ARS / $)**.
  - Abastecimiento: Scraping / sincronización desde mayorista **Coronel**.
  - Modelo de precios: Margen de ganancia sobre costo Coronel para clientes detal (B2C) y mayoristas (B2B).
- **Pendiente por afinar:**
  - Reglas de margen: ¿Márgenes porcentuales fijos (ej. +50% detal, +20% mayorista) o configurables por producto/categoría?
  - Mínimos de compra mayorista: ¿Por cantidad de unidades (ej. 3-6) o por monto total en ARS (ej. $50.000 ARS)?
  - Acceso B2B: ¿Precios mayoristas visibles para todos con compra mínima automática, o requiere cuenta mayorista?


#### Tarea 2: Branding, Logo e Imágenes (Completado)
- **Estado:** 🟢 Completado
- **Responsable:** Usuario + IA
- **Resultados:**
  - Logo oficial digitalizado en SVG vectorial: `public/logo.svg` y `public/logo-icon.svg`.
  - Componente de marca reutilizable `BrandLogo` (`src/components/brand/logo.tsx`).
  - Paleta de colores oficial (Rosado Bubblegum `#ff6f91`, Rojo Coral `#e11d48`, Blanco `#ffffff`, Dark `#18181b`) en `src/styles/themes/jg-store.css`.
  - Tema predeterminado configurado en `theme.config.ts`.
  - Vistas de autenticación (`sign-in-view.tsx`, `sign-up-view.tsx`) actualizadas con el logo y eslogan de JG-STORE Polirubro.


#### Tarea 3: Conexión con Clerk (Autenticación) (Completado)
- **Estado:** 🟢 Completado
- **Responsable:** Usuario + IA
- **Resultados:**
  - Integrado `@clerk/nextjs` y `@clerk/ui` con tema shadcn en `src/app/layout.tsx`.
  - Configurado `src/proxy.ts` con `clerkMiddleware()` para Next.js 16.
  - Vistas de `/sign-in` y `/sign-up` personalizadas con branding, `BrandLogo` y fondo interactivo.
  - Variables de entorno de Clerk configuradas en `.env.local`.
  - Rutas protegidas (`/dashboard`) y redirección inicial funcionando al 100%.
  - Verificación exitosa en local (`http://localhost:3000`) y 0 errores de linter.

---

### ⚪ Fase 3: Backend, Base de Datos y Lógica de Compra (Futuro)
- [ ] Selección de base de datos (PostgreSQL, Supabase, etc.).
- [ ] Modelado de tablas: Usuarios, Roles (Admin, Mayorista, Minorista), Productos, Precios por Rango, Pedidos, Cotizaciones.
- [ ] Integración de pasarelas de pago (locales o internacionales) o generación de cotizaciones en PDF/WhatsApp para mayoristas.
- [ ] Despliegue en VPS (Dokploy / Docker) o Vercel.
