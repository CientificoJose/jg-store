---
name: project-continuity
description: >-
  Understand the JG Store project architecture, history, knowledge graph, business model (wholesale & retail), and roadmap. Activate this skill whenever starting a new conversation, continuing development, or updating project state in jg-store.
---

# Skill de Continuidad del Proyecto - JG Store

Esta skill asegura que cualquier agente de IA (Antigravity, Claude, Cursor, etc.) o desarrollador mantenga el contexto exacto del proyecto **JG Store** a lo largo del tiempo.

---

## 🎯 Protocolo de Entrada (Al Iniciar Cualquier Tarea)

Antes de responder o escribir código, la IA **DEBE**:

1. **Leer la Memoria del Proyecto:**
   * Grafo visual: [`.agents/knowledge/graph.md`](../knowledge/graph.md)
   * Estado y Backlog de tareas: [`.agents/knowledge/roadmap.md`](../knowledge/roadmap.md)
   * Decisiones tomadas: [`.agents/knowledge/decisions.md`](../knowledge/decisions.md)
   * Reglas de negocio: [`.agents/knowledge/business-rules.md`](../knowledge/business-rules.md)

2. **Respetar las Decisiones Fundacionales:**
   * **Runtime:** Usar siempre `bun` (ver skill [`use-bun`](../use-bun/SKILL.md)).
   * **Clerk Auth:** La integración con Clerk está **en pausa/pendiente**; no bloquear el desarrollo por falta de claves reales de Clerk ni forzar su conexión hasta que el usuario lo solicite.
   * **Lógica B2B / B2C:** Todo catálogo y flujo de compra debe contemplar la dualidad precio detal vs precio mayorista.

---

## 🔄 Protocolo de Salida (Al Completar una Tarea o Hito)

Cada vez que se complete una tarea significativa o se tome una nueva decisión técnica:

1. **Actualizar el Roadmap:**
   * Marcar las tareas concluidas con `[x]` en [`.agents/knowledge/roadmap.md`](../knowledge/roadmap.md).
   * Añadir nuevas tareas al backlog si surgieron requerimientos adicionales.
2. **Actualizar el Grafo de Conocimiento:**
   * Cambiar el estado de los nodos (`pending` ➔ `completed`) en [`.agents/knowledge/graph.json`](../knowledge/graph.json) y en [`.agents/knowledge/graph.md`](../knowledge/graph.md).
3. **Registrar Decisiones:**
   * Si se adoptó una librería, base de datos o arquitectura nueva, redactar un nuevo ADR en [`.agents/knowledge/decisions.md`](../knowledge/decisions.md).
4. **Git Commit & Push:**
   * Asegurar que los cambios en `.agents/knowledge/` se envíen al repositorio remoto para que viajen con el código.
