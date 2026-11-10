/**
 * Configuración centralizada de visibilidad para la tienda JG Store.
 * 
 * Permite ocultar o mostrar dinámicamente funcionalidades como precios mayoristas,
 * ofertas por volumen y alertas de pocas unidades sin alterar la lógica interna ni la base de datos.
 * 
 * Para volver a mostrar cualquier sección en cualquier momento, basta con cambiar el valor a `true`.
 */
export const STORE_VISIBILITY = {
  /**
   * Controla la visualización de precios mayoristas, badges "-% Mayor", 
   * escalas por bulto, umbrales de compra por volumen y selectores mayoristas.
   * false = Oculto para clientes (solo se muestra precio de venta regular).
   * true = Visible normalmente con toda la escala mayorista.
   */
  showWholesalePrices: false,

  /**
   * Controla las alertas de urgencia por inventario bajo (ej: "Últimas X unidades", "Pocas unidades").
   * false = No alarma al cliente, muestra simplemente "Disponible" o "En stock".
   * true = Muestra el contador de alerta de pocas unidades.
   */
  showLowStockAlerts: false,

  /**
   * Controla si el usuario ve la cantidad numérica exacta de unidades disponibles (ej: "(15 disponibles)").
   * false = Oculta el número exacto y solo confirma si hay stock o está agotado.
   * true = Muestra la cantidad numérica exacta.
   */
  showExactStockNumbers: false,
};
