import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export function Logo({ className = '', size = 'md', showSubtitle = true }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-12 h-12 text-xl'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  return (
    <Link href="/" className={`flex items-center gap-2.5 group cursor-pointer select-none ${className}`}>
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-tr from-[#E63946] via-[#FF85A2] to-[#D4A017] p-[1.5px] shadow-sm shadow-red-500/20 group-hover:shadow-red-500/40 transition-all duration-300`}
      >
        <div className="w-full h-full bg-slate-950/90 rounded-[10px] flex items-center justify-center font-bebas text-lg tracking-wider text-[#F8F8F7] group-hover:text-[#FF85A2] transition-colors">
          JG
        </div>
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
