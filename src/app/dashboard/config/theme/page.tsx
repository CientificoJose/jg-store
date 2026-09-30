'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { THEMES } from '@/components/themes/theme.config';
import { useThemeConfig } from '@/components/themes/active-theme';
import { useStoreConfigStore } from '@/hooks/use-store-config-store';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

interface ThemeColorPreset {
  name: string;
  value: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    card: string;
  };
}

const THEME_PREVIEWS: Record<string, ThemeColorPreset['colors'] & { desc: string }> = {
  'jg-store': {
    primary: '#E63946',
    secondary: '#FF85A2',
    accent: '#D4A017',
    card: '#FFFFFF',
    desc: 'Paleta institucional oficial de JG Store con Rojo Carmesí, Rosa Coral y Acentos Dorados.'
  },
  claude: {
    primary: '#CC785C',
    secondary: '#D4957D',
    accent: '#8E5543',
    card: '#FAF9F5',
    desc: 'Inspirado en la estética cálida y editorial color arcilla de Anthropic.'
  },
  discord: {
    primary: '#5865F2',
    secondary: '#EB459E',
    accent: '#FEE75C',
    card: '#313338',
    desc: 'Estilo vibrante y moderno con tonos púrpura índigo y contrastes gamer.'
  },
  supabase: {
    primary: '#3ECF8E',
    secondary: '#24B47E',
    accent: '#1C1C1C',
    card: '#1F1F1F',
    desc: 'Verde esmeralda y fondos oscuros sofisticados estilo base de datos open-source.'
  },
  vercel: {
    primary: '#000000',
    secondary: '#666666',
    accent: '#0070F3',
    card: '#FFFFFF',
    desc: 'Minimalismo blanco y negro puro de alta ingeniería con acento azul sutil.'
  },
  mono: {
    primary: '#18181B',
    secondary: '#71717A',
    accent: '#A1A1AA',
    card: '#FFFFFF',
    desc: 'Monocromo neutral con tonos escala de grises zinc de máxima legibilidad.'
  },
  notebook: {
    primary: '#2B5797',
    secondary: '#4A69BD',
    accent: '#F39C12',
    card: '#FBFBF9',
    desc: 'Textura de papel y azul tinta estilizado para interfaces de productividad.'
  },
  'light-green': {
    primary: '#16A34A',
    secondary: '#22C55E',
    accent: '#86EFAC',
    card: '#FFFFFF',
    desc: 'Tono botánico fresco con verdes naturales y energía orgánica.'
  },
  zen: {
    primary: '#57534E',
    secondary: '#78716C',
    accent: '#A8A29E',
    card: '#F5F5F4',
    desc: 'Tonos tierra cálidos y piedra suave que transmiten calma y simplicidad.'
  },
  'astro-vista': {
    primary: '#BC52EE',
    secondary: '#7928CA',
    accent: '#FF0080',
    card: '#0D0E15',
    desc: 'Gradientes galácticos de neón fucsia y violeta espacial ultra modernos.'
  },
  whatsapp: {
    primary: '#25D366',
    secondary: '#128C7E',
    accent: '#075E54',
    card: '#FFFFFF',
    desc: 'Verde comercial WhatsApp optimizado para conversión en ventas y pedidos.'
  }
};

export default function ThemeConfigPage() {
  const { activeTheme, setActiveTheme } = useThemeConfig();
  const { theme, setTheme } = useTheme();
  const { theme: storedTheme, updateTheme } = useStoreConfigStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleApplyTheme = (themeValue: string, themeName: string) => {
    setActiveTheme(themeValue);
    updateTheme({ activeTheme: themeValue });
    toast.success(`Tema "${themeName}" aplicado con éxito`, {
      description: 'El diseño se actualizará en todo el panel y en la tienda online.'
    });
  };

  const handleModeChange = (mode: 'light' | 'dark' | 'system') => {
    setTheme(mode);
    updateTheme({ defaultMode: mode });
    toast.success(`Modo de pantalla cambiado a ${mode === 'light' ? 'Diurno (Claro)' : mode === 'dark' ? 'Nocturno (Oscuro)' : 'Automático (Sistema)'}`);
  };

  return (
    <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8 max-w-5xl font-gotham">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bebas tracking-wide text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20">
              <Icons.palette className="w-6 h-6" />
            </span>
            <span>Temas y Apariencia Visual</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6C757D] mt-1">
            Personaliza el tema de colores corporativo, el esquema de acentos y la preferencia de modo oscuro / claro.
          </p>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Icons.externalLink className="w-4 h-4 text-[#E63946]" />
          <span>Ver Tienda</span>
        </a>
      </div>

      {/* SECCIÓN 1: Selector de Modo Claro / Oscuro / Sistema */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E63946]" />
            <h2 className="text-lg font-bebas tracking-wide text-foreground">
              Modo de Visualización (Luz / Oscuridad)
            </h2>
          </div>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Selecciona el modo predeterminado para tus visitantes y administradores.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Modo Claro */}
          <button
            type="button"
            onClick={() => handleModeChange('light')}
            className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 ${
              mounted && theme === 'light'
                ? 'border-[#E63946] bg-[#E63946]/5 ring-2 ring-[#E63946]/20'
                : 'border-border/80 hover:border-border bg-muted/20'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Icons.sun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <strong className="text-xs font-bold text-foreground">Modo Diurno</strong>
                {mounted && theme === 'light' && (
                  <span className="w-2 h-2 rounded-full bg-[#E63946]" />
                )}
              </div>
              <span className="text-[11px] text-[#6C757D] block">Fondo blanco nítido</span>
            </div>
          </button>

          {/* Modo Oscuro */}
          <button
            type="button"
            onClick={() => handleModeChange('dark')}
            className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 ${
              mounted && theme === 'dark'
                ? 'border-[#E63946] bg-[#E63946]/5 ring-2 ring-[#E63946]/20'
                : 'border-border/80 hover:border-border bg-muted/20'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Icons.moon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <strong className="text-xs font-bold text-foreground">Modo Nocturno</strong>
                {mounted && theme === 'dark' && (
                  <span className="w-2 h-2 rounded-full bg-[#E63946]" />
                )}
              </div>
              <span className="text-[11px] text-[#6C757D] block">Fondo oscuro relajante</span>
            </div>
          </button>

          {/* Modo Sistema */}
          <button
            type="button"
            onClick={() => handleModeChange('system')}
            className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 ${
              mounted && theme === 'system'
                ? 'border-[#E63946] bg-[#E63946]/5 ring-2 ring-[#E63946]/20'
                : 'border-border/80 hover:border-border bg-muted/20'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Icons.laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <strong className="text-xs font-bold text-foreground">Automático</strong>
                {mounted && theme === 'system' && (
                  <span className="w-2 h-2 rounded-full bg-[#E63946]" />
                )}
              </div>
              <span className="text-[11px] text-[#6C757D] block">Según el dispositivo</span>
            </div>
          </button>
        </div>
      </div>

      {/* SECCIÓN 2: Catálogo de Temas Disponibles */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4A017]" />
            <h2 className="text-lg font-bebas tracking-wide text-foreground">
              Catálogo de Temas y Paletas de Colores
            </h2>
          </div>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Haz clic en cualquier tema para aplicarlo en tiempo real a toda la interfaz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {THEMES.map((t) => {
            const isSelected = activeTheme === t.value;
            const preview = THEME_PREVIEWS[t.value] || {
              primary: '#6C757D',
              secondary: '#ADB5BD',
              accent: '#E63946',
              card: '#FFFFFF',
              desc: 'Tema con contrastes equilibrados y soporte para modo nocturno.'
            };

            return (
              <div
                key={t.value}
                onClick={() => handleApplyTheme(t.value, t.name)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'border-[#E63946] bg-[#E63946]/5 ring-2 ring-[#E63946]/20 shadow-md'
                    : 'border-border/80 hover:border-border hover:shadow-sm bg-card'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <span>{t.name}</span>
                      {t.value === 'jg-store' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#E63946] text-white uppercase tracking-wider">
                          Oficial
                        </span>
                      )}
                    </h3>

                    {isSelected ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#E63946] text-white text-[10px] font-bold">
                        Activo
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-[#6C757D] group-hover:text-foreground">
                        Aplicar
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-[#6C757D] line-clamp-2 leading-relaxed mb-4">
                    {preview.desc}
                  </p>
                </div>

                {/* Muestrario de Colores (Color Swatches) */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: preview.primary }}
                      title="Color Primario"
                    />
                    <div
                      className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: preview.secondary }}
                      title="Color Secundario"
                    />
                    <div
                      className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: preview.accent }}
                      title="Acento"
                    />
                  </div>

                  <span className="text-[10px] font-mono text-[#6C757D]">
                    {preview.primary}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
