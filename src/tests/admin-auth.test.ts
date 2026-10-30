import { describe, it, expect } from 'bun:test';
import { metadata as adminMetadata } from '@/app/admin/[[...admin]]/page';
import fs from 'fs';
import path from 'path';

describe('Acceso Exclusivo de Administrador con Clerk (`/admin`)', () => {
  it('la ruta /admin debe tener directivas robots noindex y nofollow para privacidad estricta', () => {
    expect(adminMetadata.robots).toBeDefined();
    expect((adminMetadata.robots as any).index).toBe(false);
    expect((adminMetadata.robots as any).follow).toBe(false);
  });

  it('el título de la página /admin debe indicar portal administrativo exclusivo', () => {
    expect(adminMetadata.title).toContain('Acceso Administrativo');
  });

  it('StoreHeader no debe exponer ningún botón o enlace público de Admin a clientes normales', () => {
    const storeHeaderPath = path.resolve(process.cwd(), 'src/components/storefront/store-header.tsx');
    const storeHeaderContent = fs.readFileSync(storeHeaderPath, 'utf-8');

    // No debe contener enlace visible al dashboard
    expect(storeHeaderContent.includes('href="/dashboard/overview"')).toBe(false);
    expect(storeHeaderContent.includes('<span>Admin</span>')).toBe(false);
  });

  it('middleware.ts debe existir y proteger las rutas del dashboard', () => {
    const middlewarePath = path.resolve(process.cwd(), 'src/middleware.ts');
    expect(fs.existsSync(middlewarePath)).toBe(true);

    const middlewareContent = fs.readFileSync(middlewarePath, 'utf-8');
    expect(middlewareContent.includes('/dashboard(.*)')).toBe(true);
    expect(middlewareContent.includes('clerkMiddleware')).toBe(true);
    expect(middlewareContent.includes('auth.protect()')).toBe(true);
  });

  it('.env.local debe configurar el sign-in url en /admin y la redirección al dashboard', () => {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf-8');

    expect(envContent.includes('NEXT_PUBLIC_CLERK_SIGN_IN_URL=/admin')).toBe(true);
    expect(envContent.includes('NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard/overview')).toBe(true);
  });
});
