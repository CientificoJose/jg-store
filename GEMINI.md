# JG Store - Instrucciones para Gemini / Antigravity

Consulte el protocolo de continuidad y conocimiento del proyecto:
* **Grafo de Conocimiento:** [`.agents/knowledge/graph.md`](file://./.agents/knowledge/graph.md)
* **Roadmap Activo:** [`.agents/knowledge/roadmap.md`](file://./.agents/knowledge/roadmap.md)
* **Decisiones (ADR):** [`.agents/knowledge/decisions.md`](file://./.agents/knowledge/decisions.md)
* **Skill de Continuidad:** [`.agents/skills/project-continuity/SKILL.md`](file://./.agents/skills/project-continuity/SKILL.md)

### Reglas Críticas:
1. Usar siempre **`bun`** como runtime y gestor de paquetes (en Windows: `& "$env:USERPROFILE\.bun\bin\bun.exe"`). Prohibido generar `package-lock.json` o recurrir a Node/npm.
2. La autenticación con **Clerk** está **en pausa/pendiente**. No bloquear flujos por falta de credenciales de Clerk.
3. El modelo comercial es dual: **Venta al Detal (B2C)** y **Venta al Mayor (B2B)** con precios y condiciones diferenciadas.
4. **Flujo Git Local-First:** Todo cambio debe ser estrictamente en local. Solo hacer push a GitHub cuando el usuario lo solicite expresamente, haciéndolo en un solo comando sobre la rama principal (`main`). Ver [`.agents/skills/git-local-first/SKILL.md`](file://./.agents/skills/git-local-first/SKILL.md).
