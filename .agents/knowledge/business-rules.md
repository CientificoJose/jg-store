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

## 👥 Tipos de Clientes

### 1. Cliente al Detal (B2C / Minorista)
* **Perfil:** Comprador individual o consumidor final.
* **Precios:** Precio de venta al público (PVP / retail price).
* **Condiciones de compra:** Sin monto mínimo de compra. Puede comprar desde 1 unidad.
* **Flujo de pago:** Carrito de compra y pasarela de pago directa.

---

### 2. Cliente al Mayor (B2B / Mayorista)
* **Perfil:** Revendedores, comercios, distribuidores independientes.
* **Precios:** Precio mayorista (descuento por volumen o precio fijo por bulto/docena/caja).
* **Condiciones de compra:**
  * Cantidad mínima por producto (ej. mínimo 3 o 6 unidades por referencia).
  * O monto mínimo de pedido total (ej. pedido mínimo de $100 o moneda local).
* **Flujo de compra:**
  * Solicitud de cotización o carrito mayorista.
  * Opciones de pago flexibles (transferencia bancaria, crédito comercial si aplica).

---

## 📦 Estructura de Catálogo Prevista
* **SKU / Código único**
* **Nombre y descripción**
* **Categorías / Etiquetas**
* **Precios:**
  * `retailPrice`: Precio por unidad para clientes detal.
  * `wholesalePrice`: Precio especial por unidad para compras mayoristas.
  * `minWholesaleQty`: Cantidad mínima para aplicar precio mayorista.
  * `tiers` (opcional): Descuentos adicionales a partir de 50 o 100 unidades.
* **Inventario:** Stock disponible en almacén.
