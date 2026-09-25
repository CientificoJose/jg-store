---
name: brand-design-system
description: >-
  Official visual identity, color palette, typography guidelines (Bebas Neue & Gotham), and UI styling standards for JG Store. Trigger whenever designing UI, creating components, styling storefront or dashboard, or choosing brand colors.
---

# Sistema de Diseño e Identidad Visual (JG Store)

Este documento y skill contiene el **Sistema de Diseño Oficial de JG Store**. Todo componente, interfaz gráfica, banner, tarjeta o botón creado para la tienda o panel administrativo debe respetar estrictamente esta paleta cromática, psicología de marca y jerarquía tipográfica.

---

## 🎨 Paleta Cromática Oficial

| Color | HEX | Significado / Psicología | Rol en la Interfaz (UI) |
| :--- | :--- | :--- | :--- |
| **Rojo Pasión** | `#E63946` | **Pasión, energía y calidad** | **Color Primario (Primary):** Botones principales (CTA), badges de stock bajo, enlaces activos, acentos de impacto y carrito de compra. |
| **Rosa Cálido** | `#FF85A2` | **Cercanía y calidez** | **Color Secundario / Acento Suave:** Hover states, fondos de banners de bienvenida, alertas sutiles, micro-interacciones. |
| **Dorado Exclusivo** | `#D4A017` | **Calidad, exclusividad y confianza** | **Precio Mayorista (B2B):** Badges de compra por bulto/volumen, etiquetas VIP, sellos de garantía y estrellas de calificación. |
| **Blanco Hueso** | `#F8F8F7` | **Profesionalismo y transparencia** | **Fondo y Superficie (Background):** Fondo limpio de la tienda, contenedores de tarjetas, áreas de lectura y contraste visual. |
| **Gris Empresarial** | `#6C757D` | **Seriedad y enfoque empresarial** | **Neutros y Muted:** Textos secundarios, códigos SKU, bordes sutiles, filtros inactivos y especificaciones técnicas. |

---

## 🔤 Sistema Tipográfico Oficial

### 1. Tipografía Display / Títulos: **BEBAS NEUE CYRILLIC**
* **Uso obligatorio en:**
  * Logotipo y marca institucional.
  * Encabezados principales (`h1`, `h2`, `h3`).
  * Títulos de banners promocionales y categorías.
  * Números de precios grandes en tarjetas de producto.
  * Etiquetas de descuento o badges de alto impacto.
* **Características:** Trazo condensado, fuerte, moderno, con alta visibilidad y presencia comercial.
* **Clase CSS utilitaria:** `.font-display` o `.font-bebas` (`font-family: 'Bebas Neue', sans-serif; text-transform: uppercase; letter-spacing: 0.05em;`).

### 2. Tipografía de Lectura / UI: **GOTHAM** (Proporción Geométrica)
* **Uso obligatorio en:**
  * Cuerpo de texto, párrafos y descripciones de producto.
  * Botones de acción, selectores de variantes (color/talla).
  * Tablas de datos, celdas de precios al mayor/detal.
  * Formularios de checkout, inputs y mensajes de WhatsApp.
* **Fallback web idéntico:** `'Gotham', 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`.
* **Características:** Proporción geométrica pura, excelente legibilidad en pantallas móviles y desktop, estética limpia y corporativa.
* **Clase CSS utilitaria:** `.font-sans` o `.font-gotham`.

---

## 🧩 Reglas de Componentes UI en JG Store

### 1. Botones Principales (CTA)
* **Botón de Compra / Agregar al Carrito:** Fondo `#E63946` (Rojo Pasión) con texto `#FFFFFF`, bordes redondeados (`rounded-xl` o `rounded-2xl`), sombra sutil `shadow-md shadow-red-500/20`.
* **Hover:** Transición fluida con leve escala (`hover:scale-[1.02]`) y tono enriquecido.

### 2. Indicadores de Precios Duales (Mayor vs Detal)
* **Precio al Detal (B2C):** Tipografía Gotham Bold, color oscuro `#1A1B1E` / gris contrastante.
* **Precio al Mayor (B2B):** Tipografía Bebas Neue / Gotham Black, badge o texto destacado en `#D4A017` (Dorado) con ícono de ahorro o etiqueta *"Mayor: $X.XX (6+ unid.)"*.

### 3. Tarjetas de Producto
* **Fondo:** `#FFFFFF` o `#F8F8F7` limpio.
* **Borde:** `border border-[#6C757D]/15` para una definición nítida y profesional.
* **Semáforo de Stock:**
  * Stock normal: Verde esmeralda.
  * Últimas unidades: `#E63946` (Rojo pasión).
  * Descuento / Mayorista: `#D4A017` (Dorado).

---

## 💻 Variables CSS Disponibles en el Tema

En cualquier archivo CSS o Tailwind v4 se pueden consumir directamente:

```css
--brand-primary: #E63946;
--brand-accent: #FF85A2;
--brand-gold: #D4A017;
--brand-bg: #F8F8F7;
--brand-muted: #6C757D;
--font-display: 'Bebas Neue', sans-serif;
--font-body: 'Gotham', 'Montserrat', sans-serif;
```
