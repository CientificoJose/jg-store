# Regla: Flujo Git Local-First y Subida en 1 Solo Comando a Main

> [!IMPORTANT]
> **COMPORTAMIENTO OBLIGATORIO DE GIT EN JG STORE:**
> 1. **Local-First:** Todo cambio, archivo, prueba o commit debe permanecer estrictamente en la máquina local por defecto.
> 2. **Sin Pushes Automáticos:** NUNCA ejecutar `git push` a menos que el usuario lo solicite explícitamente (ej: *"sube a github"*, *"haz el push"*).
> 3. **Subida en 1 Solo Comando sobre `main`:** Cuando el usuario ordene subir a GitHub, se debe ejecutar todo el proceso (commit + unión/cambio a `main` + push a `origin main`) en una sola línea de comando unificada.
> 4. **Flag `--no-verify`:** Siempre incluir `--no-verify` en los commits automáticos para evitar errores por el hook de Husky en Windows PowerShell (`bash not found`).
