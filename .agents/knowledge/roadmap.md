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


#### Tarea 2: Branding, Logo e Imágenes
- **Estado:** 🟡 Pendiente
- **Responsable:** Usuario + IA
- **Alcance:**
  - Generar propuestas de logotipo y favicon para JG Store.
  - Definir paleta de colores oficial y tokens en Tailwind CSS (`src/styles/theme.css`).
  - Diseñar banners hero y categorías principales.

#### Tarea 3: Conexión con Clerk (Autenticación)
- **Estado:** 🟡 Pendiente (Pospuesto intencionalmente)
- **Responsable:** Usuario + IA
- **Alcance:**
  - Crear proyecto en [dashboard.clerk.com](https://dashboard.clerk.com).
  - Configurar las variables en `.env.local`: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY`.
  - Habilitar flujos de login y registro para clientes y administradores.

---

### ⚪ Fase 3: Backend, Base de Datos y Lógica de Compra (Futuro)
- [ ] Selección de base de datos (PostgreSQL, Supabase, etc.).
- [ ] Modelado de tablas: Usuarios, Roles (Admin, Mayorista, Minorista), Productos, Precios por Rango, Pedidos, Cotizaciones.
- [ ] Integración de pasarelas de pago (locales o internacionales) o generación de cotizaciones en PDF/WhatsApp para mayoristas.
- [ ] Despliegue en VPS (Dokploy / Docker) o Vercel.
