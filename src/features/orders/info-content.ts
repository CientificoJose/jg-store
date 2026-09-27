import type { InfobarContent } from '@/components/ui/infobar';

export const ordersInfoContent: InfobarContent = {
  title: 'Gestión de Pedidos y Cotizaciones JG Store',
  sections: [
    {
      title: 'Modelo Dual B2B y B2C en Argentina',
      description:
        'Este panel centraliza la administración de órdenes emitidas por clientes mayoristas (Factura A con CUIT, descuentos por volumen y fletes al interior) y compradores minoristas (Factura B, Mercado Pago y envíos directos).',
      links: []
    },
    {
      title: 'Estados del Pedido y Logística',
      description:
        'Flujo operativo integral: Nueva Orden → En Preparación → Lista para Despacho → Completada. Permite asignar número de guía/remito de Andreani, Correo Argentino o Expresos de carga al interior.',
      links: []
    },
    {
      title: 'Medios de Pago y Cobranzas',
      description:
        'Diferenciación entre pagos acreditados por Mercado Pago y transferencias bancarias directas (CBU/CVU/Alias con 10% OFF), con posibilidad de validar comprobantes por WhatsApp en un clic.',
      links: []
    }
  ]
};
