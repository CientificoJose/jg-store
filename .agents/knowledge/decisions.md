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
