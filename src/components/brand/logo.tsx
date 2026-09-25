import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export function Logo({ className = '', size = 'md', showSubtitle = true }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  return (
    <Link href="/" className={`flex items-center gap-2.5 group cursor-pointer select-none ${className}`}>
      <div className={`relative ${iconSizes[size]} shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        <Image
          src="/brand/logo-icon.png"
          alt="JG Store Logo"
          width={48}
          height={48}
          className="w-full h-full object-contain drop-shadow-xs"
          priority
        />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-bebas tracking-wide text-foreground ${textSizes[size]}`}>
            JG <span className="text-[#E63946] group-hover:text-[#FF85A2] transition-colors">STORE</span>
          </span>
        </div>
        {showSubtitle && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="font-gotham text-[10px] font-semibold tracking-wider text-[#6C757D] uppercase">
              Mayor & Detal
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D4A017] animate-pulse" />
          </div>
        )}
      </div>
    </Link>
  );
}
