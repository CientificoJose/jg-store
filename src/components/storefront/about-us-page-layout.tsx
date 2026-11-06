'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StoreHeader } from './store-header';
import { InstitutionalSection } from './institutional-section';
import { CartDrawer } from './cart-drawer';
import { OrderSuccessModal } from './order-success-modal';
import { StoreFooter } from './store-footer';
import { Icons } from '@/components/icons';

export function AboutUsPageLayout() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim()) {
      router.push(`/?search=${encodeURIComponent(val.trim())}`);
    }
  };

  const handleSelectCategory = (slug: string) => {
    if (slug === 'all') {
      router.push('/');
    } else {
      router.push(`/?category=${slug}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-gotham transition-colors duration-200">
      <StoreHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSelectCategory={handleSelectCategory}
      />

      {/* Migas de pan / Volver a la Tienda */}
      <div className="w-full bg-muted/40 border-b border-border/80 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#6C757D]">
            <Link
              href="/"
              className="hover:text-[#E63946] flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
            >
              <Icons.chevronLeft className="w-3.5 h-3.5" />
              <span>Volver a la Tienda</span>
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Institucional</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[#6C757D]">
            <Link href="/nosotros#mision" className="hover:text-[#E63946] transition-colors">
              Misión & Visión
            </Link>
            <span>•</span>
            <Link href="/nosotros#local-fisico" className="hover:text-[#E63946] transition-colors">
              Local Físico
            </Link>
            <span>•</span>
            <Link href="/nosotros#preguntas-frecuentes" className="hover:text-[#E63946] transition-colors">
              Preguntas Frecuentes
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <InstitutionalSection />
      </main>

      <CartDrawer />
      <OrderSuccessModal />
      <StoreFooter onSelectCategory={handleSelectCategory} />
    </div>
  );
}
