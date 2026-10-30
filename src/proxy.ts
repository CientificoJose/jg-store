import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Protegemos únicamente las rutas administrativas del dashboard
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)'
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  // 1. Acceso de administrador directo mediante cookie de sesión autorizada
  const adminSession = req.cookies.get('jg_admin_session')?.value;
  if (adminSession === 'active') {
    return;
  }

  // 2. Verificación con Clerk en rutas administrativas protegidas
  if (isProtectedRoute(req)) {
    try {
      await auth.protect();
    } catch {
      return Response.redirect(new URL('/admin', req.url));
    }
  }
});

export default proxy;

export const config = {
  matcher: [
    // Omitir archivos estáticos y rutas internas de Next.js
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Ejecutar siempre para rutas API
    '/(api|trpc)(.*)'
  ]
};
