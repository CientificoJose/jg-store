---
name: git-local-first
description: >-
  Keep all development and commits strictly local by default. Never push to GitHub automatically. When the user explicitly requests to upload to GitHub, execute the entire staging, commit, merge, and push to the main branch in a single unified command.
---

# Git Local-First & Single-Command Push to Main (JG Store)

Este protocolo define el flujo de trabajo con Git para **JG Store**. Garantiza que todo el trabajo diario se mantenga 100% en la máquina local del desarrollador y que la sincronización con GitHub ocurra únicamente bajo orden expresa y hacia la rama principal (`main`) en un único comando.

---

## 📌 Reglas de Oro

1. **Trabajo 100% Local por Defecto:**
   - Todas las ediciones, pruebas, builds y commits se realizan y quedan guardados localmente.
   - **PROHIBIDO** ejecutar `git push` por iniciativa propia o de forma automática.
   
2. **Sincronización con GitHub sólo a Petición Expresa:**
   - Únicamente cuando el usuario diga frases como: *"sube los cambios"*, *"súbelo a GitHub"*, *"haz el push"*, etc.

3. **Subida a la Rama Principal (`main`) en UN SOLO Comando:**
   - La subida debe consolidar los cambios sobre `main` y enviarse a `origin main`.
   - Se debe ejecutar en una sola línea de comando unificada (One-Liner de PowerShell).
   - Incluir `--no-verify` en los commits para evitar bloqueos por hooks de Husky no compatibles con el entorno Windows/PowerShell (`/usr/bin/env: 'bash'`).

---

## ⚡ Comando Único de Subida a GitHub (PowerShell)

### Caso A: Si se está trabajando en la rama `dev`
Este comando guarda los cambios pendientes en `dev`, cambia a `main`, une los cambios de `dev` a `main` y los sube a GitHub en un solo paso:

```powershell
git add . ; git commit --no-verify -m "feat: actualizacion de cambios desde dev" ; git checkout main ; git merge dev ; git push origin main
```

### Caso B: Si se está trabajando directamente sobre `main`
```powershell
git add . ; git commit --no-verify -m "feat: actualizacion de catalogo y tienda" ; git push origin main
```

---

## 🛠️ Script Rápido en `package.json`

Para que el usuario o el asistente puedan disparar la subida con un solo atajo:

```powershell
& "$env:USERPROFILE\.bun\bin\bun.exe" run push:main
```

(El script ejecuta automáticamente el flujo unificado hacia `origin main`).
