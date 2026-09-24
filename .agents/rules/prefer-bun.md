# Regla de Proyecto: Uso Exclusivo y Obligatorio de Bun.js

1. **Runtime y Gestor Exclusivo:**
   * Utilizar siempre **`bun`** como runtime de ejecución y gestor de paquetes exclusivo en este proyecto (`bun install`, `bun add`, `bun run dev`, `bun run build`, `bun test`).
   * **Prohibido terminantemente** el uso de `npm`, `yarn` o `pnpm`, y está prohibido generar `package-lock.json`.

2. **Entorno Windows (Ruta del Ejecutable):**
   * El ejecutable de Bun en este equipo se encuentra en:  
     `$env:USERPROFILE\.bun\bin\bun.exe` (`C:\Users\PC\.bun\bin\bun.exe`).
   * Si la terminal no reconoce `bun` en el PATH, debe ejecutarse invocando la ruta completa:
     ```powershell
     & "$env:USERPROFILE\.bun\bin\bun.exe" <comando>
     ```

3. **Ejecución del Servidor Next.js:**
   * Para levantar el servidor de desarrollo bajo Bun en Windows:
     ```powershell
     & "$env:USERPROFILE\.bun\bin\bun.exe" ./node_modules/next/dist/bin/next dev -p 3000
     ```
   * En lugar de `npx`, utilizar siempre `bunx` o `& "$env:USERPROFILE\.bun\bin\bun.exe" x <herramienta>`.
