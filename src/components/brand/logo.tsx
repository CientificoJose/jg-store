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
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-sm shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300`}
      >
        <div className="w-full h-full bg-slate-950/90 rounded-[10px] flex items-center justify-center font-black tracking-tighter text-cyan-300 group-hover:text-cyan-200 transition-colors">
          JG
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight text-foreground ${textSizes[size]}`}>
            JG <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">STORE</span>
          </span>
        </div>
        {showSubtitle && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Mayor & Detal
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        )}
      </div>
    </Link>
  );
}
