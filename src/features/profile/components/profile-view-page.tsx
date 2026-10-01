'use client';

import React from 'react';
import Link from 'next/link';
import { useUser, UserProfile } from '@clerk/nextjs';
import { Icons } from '@/components/icons';

export default function ProfileViewPage() {
  const { user, isLoaded } = useUser();

  // Estado de carga inicial
  if (!isLoaded) {
    return (
      <div className="flex h-96 w-full items-center justify-center p-8 font-gotham">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#E63946] border-t-transparent" />
          <p className="text-xs text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // Si existe una sesión autenticada real con Clerk, renderizamos el widget oficial
  if (user) {
    return (
      <div className="flex w-full flex-col p-4 sm:p-6 lg:p-8 font-gotham">
        <UserProfile routing="hash" />
      </div>
    );
  }

  // Vista administrativa para sesión local / Clerk en pausa (sin error de runtime)
  return (
    <div className="flex w-full flex-col p-4 sm:p-6 lg:p-8 max-w-4xl space-y-6 font-gotham">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bebas tracking-wide text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20">
              <Icons.account className="w-6 h-6" />
            </span>
            <span>Perfil & Sesión del Administrador</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Gestión de identidad, permisos y estado de acceso al panel administrativo de JG Store.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/overview"
            className="px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            <Icons.dashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <Icons.externalLink className="w-3.5 h-3.5" />
            <span>Ver Tienda</span>
          </Link>
        </div>
      </div>

      {/* Banner Informativo de Estado de Clerk */}
      <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <Icons.info className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="text-xs space-y-1">
          <strong className="block font-bold text-sm text-amber-900 dark:text-amber-100">
            Autenticación en Modo Local / Desarrollo
          </strong>
          <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
            La integración de producción con Clerk se encuentra en pausa estratégica. Cuentas con privilegios de <strong>Superadministrador</strong> otorgados localmente con acceso irrestricto al catálogo, órdenes, clientes y diseño de la tienda.
          </p>
        </div>
      </div>

      {/* Tarjeta Principal de Identidad */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E63946] to-[#D4A017] text-white flex items-center justify-center font-bebas text-2xl tracking-wider shadow-md shrink-0">
            JG
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">Administrador JG Store</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E63946]/15 text-[#E63946] border border-[#E63946]/30 uppercase tracking-wide">
                Super Admin
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Sesión Activa
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              admin@jgstore.com.ar • ID: usr_local_admin_01
            </p>
          </div>
        </div>

        {/* Grilla de Datos de Cuenta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Rol Asignado
            </span>
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Icons.shieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Acceso Total (Lectura & Escritura)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Entorno
            </span>
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Icons.laptop className="w-4 h-4 text-blue-500" />
              Desarrollo Local (Next.js 16 + Bun)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Canal de Notificaciones
            </span>
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Icons.whatsapp className="w-4 h-4 text-emerald-600" />
              WhatsApp Oficial de Tienda
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Módulos Habilitados
            </span>
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Icons.check className="w-4 h-4 text-[#E63946]" />
              Catálogo, Órdenes, Clientes & Ajustes
            </span>
          </div>
        </div>
      </div>

      {/* Módulos de Ajustes Directos */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
          <Icons.settings className="w-4 h-4 text-[#E63946]" />
          <span>Acciones Rápidas de Configuración</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/dashboard/config/general"
            className="p-3.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted hover:border-[#E63946]/50 transition-all group"
          >
            <strong className="text-xs font-bold text-foreground group-hover:text-[#E63946] flex items-center justify-between mb-1">
              <span>Información General</span>
              <Icons.arrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </strong>
            <p className="text-[11px] text-muted-foreground">
              WhatsApp de ventas, horarios y datos del depósito.
            </p>
          </Link>

          <Link
            href="/dashboard/config/landing"
            className="p-3.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted hover:border-[#E63946]/50 transition-all group"
          >
            <strong className="text-xs font-bold text-foreground group-hover:text-[#E63946] flex items-center justify-between mb-1">
              <span>Diseño de Landing</span>
              <Icons.arrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </strong>
            <p className="text-[11px] text-muted-foreground">
              Vitrina de categorías SHOPLUXE y filas de productos.
            </p>
          </Link>

          <Link
            href="/dashboard/config/theme"
            className="p-3.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted hover:border-[#E63946]/50 transition-all group"
          >
            <strong className="text-xs font-bold text-foreground group-hover:text-[#E63946] flex items-center justify-between mb-1">
              <span>Temas & Apariencia</span>
              <Icons.arrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </strong>
            <p className="text-[11px] text-muted-foreground">
              Paletas de color y modo diurno / nocturno.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
