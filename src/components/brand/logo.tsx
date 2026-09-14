import * as React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  showText?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: { width: 120, height: 36, iconSize: 32 },
  md: { width: 160, height: 48, iconSize: 42 },
  lg: { width: 220, height: 64, iconSize: 56 },
  xl: { width: 300, height: 90, iconSize: 80 }
};

export function BrandLogo({
  showText = true,
  className,
  size = 'md',
  ...props
}: LogoProps) {
  const currentSize = sizeMap[size];

  if (!showText) {
    return (
      <svg
        viewBox="0 0 200 200"
        width={currentSize.iconSize}
        height={currentSize.iconSize}
        className={cn('inline-block shrink-0', className)}
        {...props}
      >
        {/* Handle */}
        <path
          d="M 82 45 C 82 20, 118 20, 118 45"
          fill="none"
          stroke="oklch(0.62 0.23 18)"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Bag */}
        <path
          d="M 70 50 L 130 50 C 137 50, 142 55, 143 62 L 150 125 C 151 135, 144 142, 134 142 L 105 142 C 99 142, 94 136, 95 130 C 98 116, 96 106, 90 99 C 83 91, 71 91, 57 96 C 52 98, 48 94, 50 89 L 55 62 C 56 55, 62 50, 70 50 Z"
          fill="#ff6f91"
        />

        {/* Pointer */}
        <path
          d="M 79 101 C 83 105, 82 111, 77 114 L 49 130 C 44 133, 39 129, 40 124 L 48 96 C 50 90, 56 89, 59 92 L 79 101 Z"
          fill="oklch(0.62 0.23 18)"
        />
      </svg>
    );
  }

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      <svg
        viewBox="0 0 200 200"
        width={currentSize.iconSize}
        height={currentSize.iconSize}
        className="shrink-0"
        {...props}
      >
        <path
          d="M 82 45 C 82 20, 118 20, 118 45"
          fill="none"
          stroke="oklch(0.62 0.23 18)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 70 50 L 130 50 C 137 50, 142 55, 143 62 L 150 125 C 151 135, 144 142, 134 142 L 105 142 C 99 142, 94 136, 95 130 C 98 116, 96 106, 90 99 C 83 91, 71 91, 57 96 C 52 98, 48 94, 50 89 L 55 62 C 56 55, 62 50, 70 50 Z"
          fill="#ff6f91"
        />
        <path
          d="M 79 101 C 83 105, 82 111, 77 114 L 49 130 C 44 133, 39 129, 40 124 L 48 96 C 50 90, 56 89, 59 92 L 79 101 Z"
          fill="oklch(0.62 0.23 18)"
        />
      </svg>
      <div className="flex flex-col leading-none">
        <span className="font-extrabold tracking-tight text-foreground uppercase text-lg sm:text-xl font-sans">
          JG-STORE
        </span>
        <span className="text-[10px] font-bold tracking-[0.22em] text-muted-foreground uppercase mt-0.5">
          POLIRUBRO
        </span>
      </div>
    </div>
  );
}

export default BrandLogo;
