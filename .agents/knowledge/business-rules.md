# Reglas y Conceptos de Negocio (B2B + B2C) - JG Store

Este documento contiene los principios comerciales y operativos para las ventas al mayor y al detal.

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
