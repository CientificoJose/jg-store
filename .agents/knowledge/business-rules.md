# Reglas y Conceptos de Negocio (B2B + B2C) - JG Store (Mercado Argentina)

Este documento contiene los principios comerciales y operativos para las ventas al mayor y al detal de **JG Store**, adaptados estrictamente al **mercado de la República Argentina**.

---

## 🇦🇷 Contexto de Mercado y Localización (Argentina)
* **País:** Argentina.
* **Moneda Oficial:** Pesos Argentinos (`ARS` / `$`). Precios sin decimales superfluos (formato `es-AR`: `$ 8.500`).
* **Medios de Pago Locales:** Mercado Pago (QR, tarjetas, cuotas), Transferencia Bancaria (CBU/CVU, Alias) con descuento por pago de contado, y Efectivo en sucursal/depósito.
* **Logística y Envíos:** Andreani, Correo Argentino, Moto mensajería / Flete CABA y GBA, y Despacho por Expresos/Transportes de carga al interior (Vía Cargo, Cruz del Sur, etc.).
* **Régimen Fiscal (AFIP / ARCA):** Factura A (Responsable Inscripto) y Factura B (Consumidor Final y Monotributo). CUIT / CUIL / DNI.

---

## 🏬 Nicho de Mercado y 24 Categorías Oficiales
**JG Store** es una tienda departamental polirrubro y distribuidora que opera en 24 rubros:
1. **Aromatización y Velas** (`aromatizacion-velas`)
2. **Arte y Manualidades** (`arte-manualidades`)
3. **Artículos para Viaje** (`articulos-viaje`)
4. **Bazar y Cocina** (`bazar-cocina`)
5. **Belleza y Accesorios** (`belleza-accesorios`)
6. **Cartucheras y Carpetas** (`cartucheras-carpetas`)
7. **Cotillón** (`cotillon`)
8. **Deco y Organización del Hogar** (`deco-organizacion-hogar`)
9. **Electro** (`electro`)
10. **Embalajes** (`embalajes`)
11. **Ferretería y Pesca** (`ferreteria-pesca`)
12. **Higiene Personal y Limpieza** (`higiene-limpieza`)
13. **Indumentaria** (`indumentaria`)
14. **Juguetería** (`jugueteria`)
15. **Librería** (`libreria`)
16. **Libros** (`libros`)
17. **Marroquinería** (`marroquineria`)
18. **Mascotas** (`mascotas`)
19. **Mochilas y Maletines** (`mochilas-maletines`)
20. **Navidad** (Estacional) (`navidad`)
21. **Peluchería** (`pelucheria`)
22. **Símbolos Patrios** (`simbolos-patrios`)
23. **Textil** (`textil`)
24. **Verano** (Estacional) (`verano`)

---

## 🏬 Identidad, Rubro y Modelo de Negocio

* **Nombre Oficial de la Tienda:** **JG-STORE**
* **Subtítulo / Rubro:** **POLIRUBRO** (Bazar, electrónica, accesorios, novedades, hogar, juguetes y artículos varios de alta rotación).
* **Identidad Visual & Colores:**
  * **Rosado Bubblegum / Rose:** `#ff6f91` / `oklch(0.68 0.22 355)` (Cuerpo de la bolsa / identidad principal).
  * **Rojo Coral / Rose Intenso:** `#e11d48` / `oklch(0.62 0.23 18)` (Asa de la bolsa y cursor / call-to-actions).
  * **Blanco Puro:** `#ffffff` (Fondos claros, contraste y limpieza).
  * **Carbón / Dark:** `#18181b` (Tipografías de alta legibilidad y modo oscuro).
  * **Logo:** Bolsa de compras estilizada con cursor de compra digital y tipografía condensada bold (*archivos:* `public/logo.svg`, `public/logo-icon.svg`, componente `BrandLogo`).
* **Mercado / País Objetivo:** Argentina 🇦🇷
* **Moneda Oficial:** Pesos Argentinos (**ARS** / `$`)
* **Proveedor Principal:** Mayorista **Coronel** (obtención de catálogo, fotos, stock y precios base mediante scraping / importación).
* **Modelo Operativo:** Reventa y distribución con margen de ganancia sobre el costo mayorista de Coronel.


---

## 👥 Tipos de Clientes y Estructura de Precios

### 1. Cliente al Detal (B2C / Minorista)
* **Perfil:** Consumidor final / comprador individual.
* **Precios:** Precio de Venta al Público (PVP / Detal en ARS).
  * *Fórmula sugerida:* `Costo Coronel + Margen Minorista (%)` (o precio fijado por producto/categoría).
* **Condiciones:** Sin monto mínimo de compra. Puede comprar desde 1 unidad.
* **Flujo:** Carrito estándar y pasarela de pago / checkout directo.

---

### 2. Cliente al Mayor (B2B / Mayorista)
* **Perfil:** Revendedores, comercios y distribuidores.
* **Precios:** Precio Mayorista (con descuento por volumen sobre el PVP o margen menor sobre el costo de Coronel).
  * *Fórmula sugerida:* `Costo Coronel + Margen Mayorista (%)`.
* **Condiciones de Compra:**
  * Mínimo de unidades por producto (ej. a partir de 3 o 6 unidades) y/o
  * Monto mínimo global por pedido (ej. mínimo $50.000 ARS).
* **Flujo:** Carrito mayorista con cálculo automático de escalas de precios o solicitud de pedido/cotización (WhatsApp / transferencia bancaria / pasarela).

---

## 📦 Estructura del Catálogo & Integración con Coronel

* **SKU / Código Proveedor (Coronel):** Identificador para cruzar stock y precio original.
* **Nombre, Descripción y Fotos:** Extraídos del catálogo de Coronel o enriquecidos por JS Store.
* **Categorías:** Mapeo de categorías de Coronel a categorías de JS Store.
* **Campos de Precios:**
  * `costPriceARS`: Costo base del producto en Coronel (en ARS).
  * `retailPriceARS`: Precio final de venta al detal en ARS.
  * `wholesalePriceARS`: Precio final de venta al mayor en ARS.
  * `minWholesaleQty`: Cantidad mínima para acceder al precio mayorista.
* **Stock:** Estado de disponibilidad sincronizado con el stock de Coronel.

