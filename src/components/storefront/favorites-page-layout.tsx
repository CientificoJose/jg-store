'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StoreHeader } from './store-header';
import { FavoritesView } from './favorites-view';
import { CartDrawer } from './cart-drawer';
import { StoreFooter } from './store-footer';

export function FavoritesPageLayout() {
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
    <div className="min-h-screen flex flex-col bg-background text-foreground font-gotham">
      <StoreHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSelectCategory={handleSelectCategory}
      />
      <main className="flex-1">
        <FavoritesView />
      </main>
      <CartDrawer />
      <StoreFooter onSelectCategory={handleSelectCategory} />
    </div>
  );
}
