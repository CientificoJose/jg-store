---
name: do-not-touch-external-vps
description: Strict rule prohibiting any interaction with external MCP servers vps-lavarmicoche or n8n-mcp-lavarmicoche. All development and database interactions must be done strictly via standard HTTP APIs, PostgREST, or local project tools.
---

# Do Not Touch External VPS (Lavarmicoche)

> [!CAUTION]
> **PROHIBIDO:** Los servidores MCP `vps-lavarmicoche` y `n8n-mcp-lavarmicoche` pertenecen a un entorno externo completamente ajeno a este proyecto.
> **BAJO NINGUNA CIRCUNSTANCIA** se deben invocar herramientas de `vps-lavarmicoche` o `n8n-mcp-lavarmicoche`.

### Reglas:
1. Nunca llamar herramientas que comiencen o pertenezcan a `vps-lavarmicoche` (`ssh_*`, `sftp_*`).
2. Nunca llamar herramientas que comiencen o pertenezcan a `n8n-mcp-lavarmicoche`.
3. Todas las operaciones de base de datos para JG Store se realizan exclusivamente a través de la API REST de PostgREST / Supabase (`http://jg-store-bd.press-cloud.com/rest/v1/...`) usando las llaves de autenticación `SUPABASE_ANON_KEY` o `SERVICE_ROLE_KEY` configuradas en el proyecto, o mediante las rutas locales de Next.js.
