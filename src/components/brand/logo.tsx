import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'horizontal' | 'stacked';
  showSubtitle?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function Logo({
  className = '',
  size = 'md',
  variant = 'horizontal',
  onClick
}: LogoProps) {
  // Alturas proporcionales para el formato horizontal (ideal para barra superior)
  const horizontalHeights = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-14'
  };

  // Alturas proporcionales para el formato apilado (ideal para pie de página y login)
  const stackedHeights = {
    sm: 'h-14',
    md: 'h-18',
    lg: 'h-24',
    xl: 'h-32'
  };

  if (variant === 'stacked') {
    return (
      <Link
        href='/'
        onClick={onClick}
        className={`inline-flex items-center group cursor-pointer select-none ${className}`}
      >
        <div
          className={`relative ${stackedHeights[size]} w-auto transition-transform duration-300 group-hover:scale-105`}
        >
          {/* Logo oficial apilado para Modo Diurno (Fondo blanco) */}
          <Image
            src='/brand/logo-full.png'
            alt='JG-STORE Polirubro'
            width={316}
            height={526}
            className='h-full w-auto object-contain dark:hidden'
            priority
          />
          {/* Logo oficial apilado para Modo Nocturno (Texto blanco) */}
          <Image
            src='/brand/logo-full-dark.png'
            alt='JG-STORE Polirubro'
            width={316}
            height={526}
            className='h-full w-auto object-contain hidden dark:block'
            priority
          />
        </div>
      </Link>
    );
  }

  // Por defecto: Logo horizontal (Bolsa + JG-STORE POLIRUBRO) perfecto para el navbar
  return (
    <Link
      href='/'
      onClick={onClick}
      className={`inline-flex items-center group cursor-pointer select-none ${className}`}
    >
      <div
        className={`relative ${horizontalHeights[size]} w-auto transition-transform duration-300 group-hover:scale-105`}
      >
        {/* Modo Diurno / Claro (Texto carbón #222222) */}
        <Image
          src='/brand/logo-horizontal.png'
          alt='JG-STORE Polirubro'
          width={280}
          height={100}
          className='h-full w-auto object-contain dark:hidden'
          priority
        />
        {/* Modo Nocturno / Oscuro (Texto blanco #FFFFFF) */}
        <Image
          src='/brand/logo-horizontal-dark.png'
          alt='JG-STORE Polirubro'
          width={280}
          height={100}
          className='h-full w-auto object-contain hidden dark:block'
          priority
        />
      </div>
    </Link>
  );
}

export const BrandLogo = Logo;
export default Logo;
