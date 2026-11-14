'use client';

import React from 'react';
import Image from 'next/image';

export interface BrandItem {
  id: string;
  name: string;
  image: string;
  bgClass: string;
  imgClass: string;
}

export const OFFICIAL_BRANDS: BrandItem[] = [
  { id: 'fw', name: 'FW', image: '/brands/fw.jpg', bgClass: 'bg-white', imgClass: 'object-contain p-2' },
  { id: 'pizzini', name: 'Pizzini', image: '/brands/pizzini.jpg', bgClass: 'bg-black', imgClass: 'object-cover scale-105' },
  { id: 'triunfante', name: 'Triunfante', image: '/brands/triunfante.jpg', bgClass: 'bg-white', imgClass: 'object-contain p-1.5' },
  { id: 'tintoretto', name: 'Tintoretto', image: '/brands/tintoretto.jpg', bgClass: 'bg-white', imgClass: 'object-contain p-1.5' },
  { id: 'ezco', name: 'Ezco', image: '/brands/ezco.jpg', bgClass: 'bg-[#F15A24]', imgClass: 'object-cover' },
  { id: 'maped', name: 'Maped', image: '/brands/maped.jpg', bgClass: 'bg-[#E2001A]', imgClass: 'object-cover' },
  { id: 'filgo', name: 'Filgo', image: '/brands/filgo.jpg', bgClass: 'bg-[#C80036]', imgClass: 'object-cover' },
  { id: 'footy', name: 'Footy', image: '/brands/footy.jpg', bgClass: 'bg-white', imgClass: 'object-contain p-0.5' },
  { id: 'modax', name: 'Modax', image: '/brands/modax.jpg', bgClass: 'bg-[#FF6B5B]', imgClass: 'object-cover' },
  { id: 'wanderlust', name: 'Wanderlust', image: '/brands/wanderlust.jpg', bgClass: 'bg-black', imgClass: 'object-cover' },
  { id: 'chimola', name: 'Chimola', image: '/brands/chimola.jpg', bgClass: 'bg-white', imgClass: 'object-contain p-1.5' },
  { id: 'wabro', name: 'Wabro', image: '/brands/wabro.jpg', bgClass: 'bg-white', imgClass: 'object-contain p-1.5' },
  { id: 'unicross', name: 'Unicross', image: '/brands/unicross.jpg', bgClass: 'bg-white', imgClass: 'object-contain p-1.5' }
];

interface BrandsStripProps {
  onSelectBrand?: (brandName: string) => void;
}

export function BrandsStrip({ onSelectBrand }: BrandsStripProps) {
  return (
    <div className="w-full border-b border-border/70 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="text-center space-y-1.5 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63946]/10 border border-[#E63946]/20 text-[11px] font-semibold uppercase tracking-wider text-[#E63946]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E63946]" />
            <span>Marcas Oficiales</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bebas tracking-wide uppercase text-foreground">
            Trabajamos con las mejores marcas del país
          </h3>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 md:gap-6">
          {OFFICIAL_BRANDS.map((brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => onSelectBrand?.(brand.name)}
              title={`Ver productos de ${brand.name}`}
              className={`group flex flex-col items-center gap-1.5 focus:outline-none ${
                onSelectBrand ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div
                className={`relative w-14 h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] rounded-full overflow-hidden border-2 border-border/80 shadow-sm transition-all duration-200 ${brand.bgClass} ${
                  onSelectBrand
                    ? 'group-hover:border-[#E63946] group-hover:shadow-md group-hover:scale-108'
                    : ''
                }`}
              >
                <Image
                  src={brand.image}
                  alt={brand.name}
                  fill
                  className={brand.imgClass}
                  sizes="72px"
                  unoptimized
                />
              </div>
              <span className="text-[11px] font-medium text-[#6C757D] group-hover:text-foreground transition-colors">
                {brand.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
