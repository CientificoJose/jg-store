export const ORDER_STATUS_OPTIONS = [
  { value: 'nueva', label: 'Nueva Orden' },
  { value: 'en_proceso', label: 'En Preparación' },
  { value: 'lista_despacho', label: 'Lista p/ Despacho' },
  { value: 'completada', label: 'Completada / Entregada' },
  { value: 'cancelada', label: 'Cancelada' }
];

export const ORDER_TYPE_OPTIONS = [
  { value: 'wholesale', label: 'Mayorista B2B' },
  { value: 'retail', label: 'Minorista B2C' }
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'paid', label: 'Pagado' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'rejected', label: 'Rechazado' }
];

export const SHIPPING_METHOD_OPTIONS = [
  { value: 'andreani', label: 'Andreani' },
  { value: 'correo_argentino', label: 'Correo Argentino' },
  { value: 'expreso_interior', label: 'Expreso al Interior' },
  { value: 'pickup', label: 'Retiro en Depósito' }
];
