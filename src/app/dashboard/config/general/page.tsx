'use client';

import React, { useState, useEffect } from 'react';
import { useStoreConfigStore } from '@/hooks/use-store-config-store';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

export default function GeneralConfigPage() {
  const { general, updateGeneral, resetToDefaults } = useStoreConfigStore();

  const [formData, setFormData] = useState(general);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormData(general);
  }, [general]);

  const handleChange = (field: keyof typeof general, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      setHasChanges(true);
      return next;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateGeneral(formData);
    setHasChanges(false);
    toast.success('¡Configuración guardada con éxito!', {
      description: 'El nuevo número de WhatsApp y los datos del footer ya están activos en toda la tienda.'
    });
  };

  const handleReset = () => {
    if (window.confirm('¿Seguro que deseas restablecer los valores originales de JG Store?')) {
      resetToDefaults();
      setHasChanges(false);
      toast.info('Valores restablecidos a los predeterminados.');
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-5xl font-gotham">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bebas tracking-wide text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20">
              <Icons.store className="w-6 h-6" />
            </span>
            <span>Información General de la Tienda</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6C757D] mt-1">
            Personaliza el WhatsApp de recepción de pedidos, el texto del pie de página y los datos de tu depósito.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-[#6C757D] hover:text-foreground transition-all cursor-pointer"
          >
            Restablecer
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
              hasChanges
                ? 'bg-[#E63946] hover:bg-[#d62839] text-white shadow-[#E63946]/30'
                : 'bg-muted text-[#6C757D] cursor-not-allowed opacity-60'
            }`}
          >
            <Icons.check className="w-4 h-4" />
            <span>{hasChanges ? 'Guardar Cambios' : 'Sin cambios'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Bloque 1: WhatsApp Oficial (Destacado) */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/25">
              <Icons.whatsapp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Canal Principal de Ventas (WhatsApp)</h2>
              <p className="text-xs text-[#6C757D] mt-0.5">
                Cualquier cambio aquí actualizará inmediatamente los mensajes de carrito, botón de compra directa y cotizaciones.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Número de WhatsApp (con código de país)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                  placeholder="5491155550000"
                  className="w-full h-10 pl-10 pr-3 rounded-xl border border-border bg-background text-xs font-mono font-medium focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
                  required
                />
                <Icons.whatsapp className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3 pointer-events-none" />
              </div>
              <p className="text-[11px] text-[#6C757D] mt-1">
                Formato argentino: 549 + código de área + número (sin 15 ni guiones).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Horario de Atención Comercial
              </label>
              <input
                type="text"
                value={formData.schedule}
                onChange={(e) => handleChange('schedule', e.target.value)}
                placeholder="Lunes a Sábado de 8:00 a 18:00 hs"
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
              />
              <p className="text-[11px] text-[#6C757D] mt-1">
                Visible en el pie de página y cabecera de la tienda.
              </p>
            </div>
          </div>
        </div>

        {/* Bloque 2: Identidad y Footer */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/25">
              <Icons.layout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Identidad & Descripción del Pie de Página</h2>
              <p className="text-xs text-[#6C757D] mt-0.5">
                Edita los textos institucionales que presentan a la empresa ante clientes minoristas y mayoristas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Nombre de la Tienda
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Eslogan / Subtítulo Oficial
              </label>
              <input
                type="text"
                value={formData.storeTagline}
                onChange={(e) => handleChange('storeTagline', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Descripción de la Empresa (Abajo en el Footer)
            </label>
            <textarea
              rows={4}
              value={formData.footerDescription}
              onChange={(e) => handleChange('footerDescription', e.target.value)}
              placeholder="Escribe la descripción institucional de tu empresa..."
              className="w-full p-3 rounded-xl border border-border bg-background text-xs font-normal leading-relaxed focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none resize-none"
            />
            <p className="text-[11px] text-[#6C757D] mt-1">
              Este texto aparece en la columna izquierda del footer de la portada y en todas las páginas.
            </p>
          </div>
        </div>

        {/* Bloque 3: Datos de Retiro & Facturación */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/25">
              <Icons.truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Depósito para Retiro & Datos Fiscales</h2>
              <p className="text-xs text-[#6C757D] mt-0.5">
                Datos necesarios para envíos nacionales, retiro en sucursal y facturación electrónica.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Dirección Física del Depósito / Showroom
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Av. Corrientes 1234, CABA, Argentina"
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                CUIT / Identificación Fiscal
              </label>
              <input
                type="text"
                value={formData.cuit}
                onChange={(e) => handleChange('cuit', e.target.value)}
                placeholder="30-71234567-8"
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-mono font-medium focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Email Oficial de Contacto
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="ventas@jgstore.com.ar"
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
            />
          </div>
        </div>

        {/* Bloque 4: Redes Sociales */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/25">
              <Icons.share className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Redes Sociales & Enlaces Externos</h2>
              <p className="text-xs text-[#6C757D] mt-0.5">
                Canales oficiales donde los clientes pueden seguir las novedades y ofertas de JG Store.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Instagram URL
              </label>
              <input
                type="url"
                value={formData.socialInstagram}
                onChange={(e) => handleChange('socialInstagram', e.target.value)}
                placeholder="https://instagram.com/jgstore"
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Facebook URL
              </label>
              <input
                type="url"
                value={formData.socialFacebook}
                onChange={(e) => handleChange('socialFacebook', e.target.value)}
                placeholder="https://facebook.com/jgstore"
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                TikTok URL
              </label>
              <input
                type="url"
                value={formData.socialTikTok}
                onChange={(e) => handleChange('socialTikTok', e.target.value)}
                placeholder="https://tiktok.com/@jgstore"
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Botón flotante inferior para guardar */}
        <div className="sticky bottom-4 p-4 rounded-2xl bg-card/90 backdrop-blur-md border border-border shadow-lg flex items-center justify-between gap-4">
          <div className="text-xs text-[#6C757D]">
            {hasChanges ? (
              <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Tienes cambios sin guardar
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <Icons.check className="w-3.5 h-3.5" />
                Todos los ajustes están guardados
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={!hasChanges}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              hasChanges
                ? 'bg-[#E63946] hover:bg-[#d62839] text-white shadow-[#E63946]/30'
                : 'bg-muted text-[#6C757D] cursor-not-allowed opacity-60'
            }`}
          >
            <Icons.check className="w-4 h-4" />
            <span>Guardar Configuración General</span>
          </button>
        </div>
      </form>
    </div>
  );
}
