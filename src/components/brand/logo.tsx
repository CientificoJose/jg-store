import * as React from 'react';
import { cn } from '@/lib/utils';

// Colores oficiales del logo JG-STORE
const PINK = '#ff6f91';  // Rosado Bubblegum — cuerpo de la bolsa
const RED = '#e11d48';   // Rojo Coral — asa y cursor

interface LogoProps {
  showText?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  textColor?: string;
}

const sizeMap = {
  sm: { iconSize: 32 },
  md: { iconSize: 44 },
  lg: { iconSize: 60 },
  xl: { iconSize: 84 },
};

/**
 * Icono SVG del logo JG-STORE.
 * Reproduce el logo oficial: bolsa rosada + asa roja + cursor rojo.
 *
 * ViewBox 0 0 200 210
 * - Asa:    arco rojo en la parte superior central
 * - Bolsa:  rectángulo rosa redondeado con cutout (mask SVG) para el cursor
 * - Cursor: flecha de navegación roja en esquina inferior-izquierda
 */
function JGLogoIcon({ size }: { size: number }) {
  const uid = React.useId().replace(/:/g, '');
  const maskId = `bag-mask-${uid}`;

  return (
    <svg
      viewBox="0 0 200 210"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="JG-STORE logo"
      role="img"
      className="shrink-0"
    >
      <defs>
        {/* Mask: blanco = visible, negro (cursor shape) = recortado de la bolsa */}
        <mask id={maskId}>
          <rect width="200" height="210" fill="white" />
          <path d="M 38 163 L 54 90 L 98 148 L 70 128 Z" fill="black" />
        </mask>
      </defs>

      {/* Asa / Handle — arco rojo redondeado */}
      <path
        d="M 76 78 Q 76 36 100 36 Q 124 36 124 78"
        stroke={RED}
        strokeWidth="14"
        strokeLinecap="round"
      />

      {/* Bolsa — rectángulo rosa con cutout del cursor via mask */}
      <rect
        x="44"
        y="75"
        width="118"
        height="108"
        rx="20"
        ry="20"
        fill={PINK}
        mask={`url(#${maskId})`}
      />

      {/* Cursor / Flecha de navegación — rojo */}
      <path
        d="M 38 163 L 54 90 L 98 148 L 70 128 Z"
        fill={RED}
      />
    </svg>
  );
}

/**
 * Componente de marca reutilizable — JG-STORE.
 *
 * @example
 * <BrandLogo />                          // Logo completo
 * <BrandLogo showText={false} size="sm" /> // Solo ícono
 */
export function BrandLogo({
  showText = true,
  className,
  size = 'md',
  textColor,
}: LogoProps) {
  const { iconSize } = sizeMap[size];

  if (!showText) {
    return (
      <div className={cn('inline-flex items-center', className)}>
        <JGLogoIcon size={iconSize} />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      <JGLogoIcon size={iconSize} />
      <div className="flex flex-col leading-none">
        <span
          className="font-extrabold tracking-tight uppercase font-sans"
          style={{ color: textColor, fontSize: iconSize * 0.38 }}
        >
          JG-STORE
        </span>
        <span
          className="font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          style={{ fontSize: iconSize * 0.19, marginTop: 2 }}
        >
          POLIRUBRO
        </span>
      </div>
    </div>
  );
}

export default BrandLogo;
