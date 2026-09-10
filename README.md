# JG Store

Plataforma de comercio electrónico para ventas online al mayor y al detal (B2B / B2C).

## 🚀 Arquitectura y Tecnologías
- **Framework:** Next.js 16 (App Router)
- **Runtime & Package Manager:** [Bun](https://bun.sh)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)
- **Estilos:** Tailwind CSS v4
- **Autenticación:** Clerk
- **Gestión de Estado y Consultas:** TanStack React Query v5 & Zustand
- **Formularios y Tablas:** TanStack Form, TanStack Table & Zod

---

## 🛠️ Comenzar en Desarrollo

1. **Instalar dependencias con Bun:**
   ```bash
   bun install
   ```

2. **Configurar variables de entorno:**
   Copia el archivo `.env.example` a `.env.local` y añade tus claves de Clerk:
   ```bash
   cp .env.example .env.local
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   bun dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📁 Estructura del Proyecto

```
src/
├── app/          # Páginas y rutas de Next.js (App Router)
├── components/   # Componentes de interfaz (shadcn/ui y componentes comunes)
├── config/       # Configuración global y navegación
├── constants/    # Datos mock y constantes
├── features/     # Módulos funcionales (productos, usuarios, kanban, etc.)
├── hooks/        # Hooks personalizados de React
├── lib/          # Utilidades y configuración de clientes (query, api, etc.)
└── styles/       # Estilos globales y temas
```
