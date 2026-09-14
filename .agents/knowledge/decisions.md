# Registro de Decisiones de Arquitectura (ADR) - JG Store

Este documento registra las decisiones clave tomadas en el proyecto para que cualquier IA o colaborador comprenda el porqué de cada decisión técnica.

---

## ADR 001: Adopción de la Plantilla Next-Shadcn-Dashboard-Starter
* **Fecha:** 2026-09-10
* **Estado:** Aceptado
* **Contexto:** Se requiere una base sólida y moderna para construir la plataforma sin programar componentes comunes desde cero.
* **Decisión:** Integrar `Kiranism/next-shadcn-dashboard-starter` con Next.js 16 (App Router), Tailwind CSS v4 y componentes shadcn/ui.
* **Consecuencias:** Acelera el desarrollo del panel de administración y vistas de catálogo; el equipo solo se enfocará en la lógica de negocio mayor/detal y backend.

---

## ADR 002: Estandarización en Bun como Runtime y Gestor de Paquetes
* **Fecha:** 2026-09-10
* **Estado:** Aceptado
* **Contexto:** El usuario solicitó un gestor de paquetes ultrarrápido y consistente.
* **Decisión:** Priorizar siempre `bun` (`bun install`, `bun add`, `bun dev`, `bun run build`). Se crearon skills y reglas específicas tanto a nivel global como dentro del repositorio (`.agents/skills/use-bun/`).
* **Consecuencias:** Instalaciones de dependencias en menos de 3 segundos; ejecución nativa de TypeScript sin herramientas intermedias.

---

## ADR 003: Postergación de la Conexión de Clerk
* **Fecha:** 2026-09-10
* **Estado:** Aceptado
* **Contexto:** El usuario indicó expresamente dejar la conexión con Clerk como tarea pendiente para concentrarse primero en la arquitectura conceptual y visual.
* **Decisión:** Mantener `.env.local` con placeholders y no bloquear el desarrollo ni las pruebas de componentes locales con autenticación real de Clerk.
* **Consecuencias:** Se avanzará en diseño y catálogo; la autenticación se configurará formalmente en una etapa posterior.

---

## ADR 004: Memoria Persistente en el Repositorio (Repo-Carried Memory)
* **Fecha:** 2026-09-10
* **Estado:** Aceptado
* **Contexto:** Múltiples personas o diferentes IAs trabajarán en el proyecto en distintas máquinas. Se requiere que el contexto, el grafo de conocimiento y el backlog viajen dentro de Git.
* **Decisión:** Centralizar el grafo de conocimiento en `.agents/knowledge/`, con una skill `.agents/skills/project-continuity/` y un archivo raíz `AGENTS.md` para auto-descubrimiento.
* **Consecuencias:** Ninguna IA ni nuevo desarrollador necesitará explicaciones repetitivas; bastará con consultar los archivos de `.agents/knowledge/`.

---

## ADR 005: Modelo de Negocio JG-STORE, Moneda ARS y Abastecimiento vía Coronel
* **Fecha:** 2026-09-14
* **Estado:** Aceptado
* **Contexto:** Definir la identidad comercial, la moneda local de operación y el origen del catálogo.
* **Decisión:** 
  * Nombre oficial de la tienda: **JG-STORE (Polirubro)**.
  * Mercado: **Argentina**, operando 100% en Pesos Argentinos (**ARS**).
  * Catálogo abastecido mediante scraping del mayorista **Coronel**.
  * Esquema de precios dual (B2C detal y B2B mayorista) calculado sobre el costo base de adquisición de Coronel.
* **Consecuencias:** Todos los componentes de precios, formateadores de moneda, esquemas de base de datos e interfaces de usuario deben estar configurados en ARS (ej: `$ 15.000`), y el pipeline de productos debe incluir lógica de scraping/importación desde Coronel.

---

## ADR 006: Identidad Visual Oficial, Logo Vectorial y Tema Rosado & Blanco
* **Fecha:** 2026-09-14
* **Estado:** Aceptado
* **Contexto:** El usuario proporcionó el logo oficial (bolsa de compras rosada con cursor coral y tipografía "JG-STORE POLIRUBRO") y definió los colores corporativos: rosado y blanco.
* **Decisión:**
  * Crear assets SVG optimizados (`public/logo.svg` y `public/logo-icon.svg`).
  * Crear componente reutilizable `BrandLogo` (`src/components/brand/logo.tsx`).
  * Crear el tema de diseño oficial `jg-store` (`src/styles/themes/jg-store.css`) basado en OKLCH con tonos rosados vibrantes (`#ff6f91`, `#e11d48`), fondo blanco limpio y modo oscuro elegante.
  * Configurar `jg-store` como el tema por defecto del starter en `theme.config.ts`.
* **Consecuencias:** Coherencia visual total de la marca en login, dashboards, barra lateral y futuras vistas de catálogo e-commerce.


