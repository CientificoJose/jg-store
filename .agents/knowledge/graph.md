# Grafo de Conocimiento del Proyecto (Knowledge Graph)

> **PROPÓSITO PARA IAS Y DESARROLLADORES:**
> Este documento representa la memoria viva del proyecto **JG Store**. Cualquier IA o desarrollador que trabaje en este repositorio debe leer este archivo antes de realizar tareas para comprender el contexto global, las dependencias y el estado de cada módulo.

---

## 🗺️ Mapa Visual del Proyecto

```mermaid
graph TD
    subgraph Core [Núcleo de JG Store]
        JG[JG Store Platform]
    end

    subgraph Memoria [Memoria & Continuidad]
        CS[🟢 Sistema de Continuidad en Repo]
        BUN[🟢 Runtime: Bun]
    end

    subgraph Fundacion [Infraestructura & UI]
        FE[🟢 Frontend Base: Next.js 16 + shadcn/ui]
        BR[🟢 Branding, Logo e Identidad Visual]
    end

    subgraph Pendientes [Tareas Pendientes Activas]
        CL["🟡 Conexión con Clerk (Autenticación)"]
        DB["🟡 Backend & Base de Datos"]
    end

    JG --> CS
    JG --> FE
    CS --> BUN
    BUN --> FE
    
    JG --> BM
    JG --> BR
    JG -.-> CL
    JG -.-> DB
    
    BM --> FE
    BR --> FE
    CL --> BM
    DB --> BM

    classDef completed fill:#22c55e,stroke:#15803d,color:#fff;
    classDef pending fill:#eab308,stroke:#a16207,color:#000;
    
    class CS,BUN,FE,BR,BM completed;
    class CL,DB pending;
```

---

## 🧩 Nodos del Sistema

### 1. 🟢 Base Frontend e Interfaz (`frontend-foundation`)
* **Estado:** Completado.
* **Detalles:** Integración de la plantilla `next-shadcn-dashboard-starter` con Next.js 16 (App Router), Tailwind CSS v4, componentes UI completos de shadcn/ui, tablas TanStack Table, formularios TanStack Form y gráficos Recharts.
* **Ubicación clave:** `src/app/`, `src/components/`, `src/features/`, `src/styles/`.

### 2. 🟢 Runtime y Herramientas (`package-manager`)
* **Estado:** Completado.
* **Detalles:** Uso obligatorio de **`bun`** en todo el ciclo de desarrollo (`bun install`, `bun add`, `bun dev`, `bun run build`).
* **Archivos asociados:** `bun.lock`, `.agents/skills/use-bun/SKILL.md`, `.agents/rules/prefer-bun.md`.

### 3. 🟢 Sistema de Continuidad y Memoria (`continuity-system`)
* **Estado:** Completado.
* **Detalles:** Documentación viva y reproducible en `.agents/knowledge/` y skill especializada en `.agents/skills/project-continuity/` para que el proyecto mantenga su contexto entre diferentes IAs y colaboradores.

### 4. 🟢 Consolidación de Concepto de Negocio Argentino B2B/B2C (`business-model`)
* **Estado:** Completado.
* **Detalles:**
  - Localización total para el mercado de la República Argentina (Polirrubro B2B / B2C).
  - Precios de catálogo reales en Pesos Argentinos (`$` ARS) con formateo `es-AR`.
  - **Barra de Progreso Mayorista ($ 50.000 ARS):** Desbloqueo automático de precios mayoristas en toda la orden al alcanzar el umbral de $ 50.000 ARS, o por cantidad unitaria de producto.
  - Reglas de facturación comercial AFIP/ARCA: Factura A (Responsable Inscripto con CUIT) y Factura B (Consumidor Final / Monotributo).
  - Medios de pago nacionales: Mercado Pago y Transferencia Bancaria CBU/CVU/Alias con 10% de descuento.
  - Envíos a todo el país: Andreani, Correo Argentino y Expresos de Carga al interior con despacho en CABA/GBA.
* **Referencia:** [business-rules.md](./business-rules.md).

### 5. 🟢 Branding, Logo e Identidad Visual Oficial (`branding`)
* **Estado:** Completado.
* **Detalles:** 
  - Paleta cromática oficial implementada: `#E63946` (Rojo Pasión / Principal), `#FF85A2` (Rosa Cálido / Acento), `#D4A017` (Dorado Calidad / Mayorista VIP), `#F8F8F7` / `#FFFFFF` (Superficie y Fondo Diurno), `#6C757D` (Gris Pizarra / Neutros).
  - Tipografías oficiales configuradas: **Bebas Neue Cyrillic** para Display/Títulos y **Gotham** para UI/Cuerpo/Botones.
  - Tema oficial `jg-store` registrado en `src/styles/themes/jg-store.css` y `theme.config.ts`.
  - Isotipo y Favicon oficial multiformato (`src/app/icon.png`, `public/brand/logo-icon.png`).
  - Logo oficial institucional JG-STORE POLIRUBRO con versión diurna y nocturna adaptativa en `src/components/brand/logo.tsx`.
  - Botón selector interactivo de **Modo Diurno (fondo blanco puro #FFFFFF)** y **Modo Nocturno (#111215)** integrado en el header del storefront.
  - Skill de diseño [`.agents/skills/brand-design-system/SKILL.md`](../skills/brand-design-system/SKILL.md).

### 6. 🟢 Storefront & Experiencia de Compra Dual B2B/B2C (`storefront`)
* **Estado:** Completado.
* **Detalles:**
  - 24 departamentos oficiales, Hero Banner con propuesta de valor, filtro interactivo de favoritos.
  - Carrito deslizable con cálculo dinámico de ahorro mayorista y checkout por WhatsApp estructurado.
  - Experiencia de búsqueda optimizada: supresión automática del carrusel promocional al tipear un término, banner de alerta horizontal ultra-compacto cuando no hay coincidencia exacta y despliegue inmediato de productos sugeridos.
  - Sistema de favoritos (Wishlist) con Zustand y persistencia LocalStorage + migración SQL para tablas `users` y `favorites`.
  - **Página de Producto Grande estilo Mercado Libre (`/producto/[id]`):** Tira de miniaturas verticales, zoom de fotografía principal, condición y calificaciones, bloque de precios dual Detal/Mayor con % de descuento, caja de compra ("Buy Box") con botón de WhatsApp directo y botón de carrito, ficha técnica de especificaciones y sección de recomendados *"Quienes vieron este producto también compraron"*.

### 7. 🟡 Conexión con Clerk (`auth-clerk`)
* **Estado:** Pendiente.
* **Objetivo:** Conectar las claves API reales de Clerk, configurar URLs de redirección y vincular roles de usuario (administrador, cliente mayorista verificado, cliente minorista).
* **Nota importante:** Se ha dejado intencionalmente como tarea pendiente según directiva del usuario.

### 8. 🟡 Backend y Base de Datos (`backend-database`)
* **Estado:** Pendiente de migración remota.
* **Objetivo:** Conexión con PostgreSQL / Supabase Dokploy (`http://jg-store-bd.press-cloud.com`) ejecutando los scripts SQL preparados (`20260917_create_products_table.sql`, `20260925_create_users_and_favorites_tables.sql`, `20260926_create_orders_tables.sql`).

### 9. 🟢 Panel de Gestión de Pedidos y Cotizaciones (`orders-management`)
* **Estado:** Completado.
* **Detalles:**
  - Panel administrativo completo en `/dashboard/orders` integrado en la barra de navegación lateral.
  - Soporte B2B y B2C en Argentina: discriminación de Factura A (CUIT) vs Factura B (DNI), medios de pago (Mercado Pago / Transferencia CBU con 10% OFF), logística a todo el país (Andreani / Correo Argentino / Expresos al interior / Retiro en depósito).
  - 4 métricas ejecutivas en `$ ARS`: Facturación total, Pedidos Mayoristas B2B, Pedidos Minoristas B2C, y Pendientes de preparación.
  - Cajón lateral interactivo `OrderDetailSheet` con desglose de ítems, cálculo de ahorro mayorista, editor de número de guía/remito y botón de contacto por WhatsApp.
  - Tabla TanStack Table con búsqueda y filtros sincronizados en URL con `nuqs`.
  - Migración SQL en `supabase/migrations/20260926_create_orders_tables.sql`.

### 10. 🟡 Limpieza de Navegación y Menús Extra (`dashboard-cleanup`)
* **Estado:** Pendiente prioritaria.
* **Objetivo:** Ocultar rutas y menús de demostración (Kanban, AI Chat, Chat genérico, Forms demo, etc.) en `src/config/nav-config.ts` para dejar únicamente la operatoria de JG Store.

### 11. 🟡 Módulo de Configuración de la Tienda (`store-config`)
* **Estado:** Pendiente prioritaria.
* **Objetivo:** Crear menú `/dashboard/config` con dos submenús:
  1. **Información básica:** Datos comerciales, CUIT, WhatsApp, depósito, horarios y redes.
  2. **Orden visual de landing page:** Gestor para ordenar las 24 categorías, carrusel y secciones destacadas.

### 12. 🟡 Jerarquía de Productos en Base de Datos (`hierarchical-products`)
* **Estado:** Pendiente prioritaria.
* **Objetivo:** Estructura SQL relacional de 3 niveles: Categorías ➔ Sub-categorías ➔ Sub-sub-categorías conectada con la tabla `products`.

### 13. 🟡 Testing & Calidad (`system-testing`)
* **Estado:** Pendiente prioritaria.
* **Objetivo:** Suite de pruebas funcionales para storefront, buscador, carrito, pedidos WhatsApp y panel de administración.


