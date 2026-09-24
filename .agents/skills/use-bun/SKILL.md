---
name: use-bun
description: >-
  Always prioritize and use Bun as the default package manager and JavaScript/TypeScript runtime instead of npm, yarn, or pnpm. Trigger when installing dependencies, running scripts, dev servers, or building projects in jg-store.
---

# Use Bun Package Manager & Runtime (Obligatorio en JG Store)

Todo asistente de IA que opere en este proyecto debe utilizar **Bun.js** de forma estricta y exclusiva como gestor de paquetes y runtime de ejecución para Node.js/TypeScript. Está **terminantemente prohibido** recurrir a `npm`, `yarn`, `pnpm` o generar `package-lock.json`.

---

## 💻 Entorno Windows y Resolución de Rutas (Crítico)

En el sistema Windows del usuario, el ejecutable de Bun se encuentra instalado en:
`C:\Users\PC\.bun\bin\bun.exe` (o `$env:USERPROFILE\.bun\bin\bun.exe`).

Si la terminal de PowerShell indica que el comando `bun` no se reconoce, se debe invocar directamente la ruta completa o configurar el PATH en el comando:

```powershell
# Invocación directa con ruta absoluta (Garantizado 100%)
& "$env:USERPROFILE\.bun\bin\bun.exe" <comando>

# O agregar al PATH de la sesión:
$env:PATH = "$env:USERPROFILE\.bun\bin;$env:PATH"; bun <comando>
```

---

## 🚀 Comandos Principales

### 1. Iniciar el Servidor de Desarrollo (Next.js con Bun):
En Windows, para evitar el error `bun: command not found: next` ocasionado por enlaces simbólicos `.bin`, ejecutar el entrypoint de Next.js directamente con Bun:

```powershell
# Levantar el servidor en desarrollo con Bun runtime
& "$env:USERPROFILE\.bun\bin\bun.exe" ./node_modules/next/dist/bin/next dev -p 3000
```

### 2. Gestión de Paquetes y Dependencias:
* **Instalación de dependencias:**
  ```powershell
  & "$env:USERPROFILE\.bun\bin\bun.exe" install
  ```
* **Agregar paquetes de producción:**
  ```powershell
  & "$env:USERPROFILE\.bun\bin\bun.exe" add <paquete>
  ```
* **Agregar paquetes de desarrollo:**
  ```powershell
  & "$env:USERPROFILE\.bun\bin\bun.exe" add -d <paquete>
  ```
* **Eliminar paquetes:**
  ```powershell
  & "$env:USERPROFILE\.bun\bin\bun.exe" remove <paquete>
  ```

### 3. Compilación y Chequeos:
* **Build de producción:**
  ```powershell
  & "$env:USERPROFILE\.bun\bin\bun.exe" ./node_modules/next/dist/bin/next build
  ```
* **Typecheck (TypeScript):**
  ```powershell
  & "$env:USERPROFILE\.bun\bin\bun.exe" run typecheck
  ```
* **Ejecución de herramientas temporales (en lugar de npx):**
  ```powershell
  & "$env:USERPROFILE\.bun\bin\bun.exe" x <herramienta>
  ```

---

## 🛑 Prohibiciones Estrictas
1. **NO usar Node.js como sustituto:** Jamás ejecutar `node` ni `npm` para desarrollo ni builds.
2. **NO generar `package-lock.json`:** Todo bloqueo de dependencias debe quedar en `bun.lock` (o `bun.lockb`). Si por accidente se genera un `package-lock.json`, debe eliminarse inmediatamente.
