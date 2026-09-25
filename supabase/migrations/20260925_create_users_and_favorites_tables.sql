-- ==============================================================================
-- JG STORE - TABLAS DE USUARIOS Y FAVORITOS (WISHLIST)
-- Basado en la arquitectura comercial de JG Store
-- ==============================================================================

-- 1. Tabla de Usuarios (USERS)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(150) NOT NULL,                          -- Nombre y apellido del usuario
  usuario VARCHAR(80) UNIQUE NOT NULL,                   -- Nombre de usuario único (username)
  correo VARCHAR(255) UNIQUE NOT NULL,                   -- Correo electrónico (email)
  contrasena VARCHAR(255) NOT NULL,                      -- Contraseña encriptada (bcrypt / argon2 hash)
  telefono VARCHAR(50),                                  -- Teléfono / WhatsApp de contacto
  rol VARCHAR(30) DEFAULT 'cliente_detal' 
    CHECK (rol IN ('cliente_detal', 'mayorista_b2b', 'admin')), -- Rol comercial
  estado VARCHAR(20) DEFAULT 'activo' 
    CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
  fecha TIMESTAMPTZ DEFAULT now(),                       -- Fecha de registro
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Favoritos (FAVORITOS)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_users UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  id_product UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Evitar que un usuario guarde el mismo producto dos veces como favorito
  CONSTRAINT uq_user_product_favorite UNIQUE (id_users, id_product)
);

-- 3. Índices para Consultas de Alto Rendimiento
CREATE INDEX IF NOT EXISTS idx_users_correo ON public.users(correo);
CREATE INDEX IF NOT EXISTS idx_users_usuario ON public.users(usuario);
CREATE INDEX IF NOT EXISTS idx_users_rol ON public.users(rol);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(id_users);
CREATE INDEX IF NOT EXISTS idx_favorites_product ON public.favorites(id_product);

-- 4. Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad para Usuarios:
CREATE POLICY "Permitir a usuarios ver su propio perfil"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Permitir registro de nuevos usuarios"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- Políticas de Seguridad para Favoritos:
CREATE POLICY "Permitir lectura de favoritos"
  ON public.favorites FOR SELECT
  USING (true);

CREATE POLICY "Permitir a usuarios agregar o eliminar sus favoritos"
  ON public.favorites FOR ALL
  USING (true);

-- 5. Vista de Consulta Detallada (SQL SELECT con JOINs para reportes y frontend)
CREATE OR REPLACE VIEW public.vw_favoritos_detalle AS
SELECT 
  f.id AS id_favorito,
  f.id_users,
  u.nombre AS nombre_usuario,
  u.usuario AS username,
  u.correo AS correo_usuario,
  f.id_product,
  p.name AS nombre_producto,
  p.sku AS sku_producto,
  p.retail_price AS precio_detal,
  p.wholesale_price AS precio_mayorista,
  p.min_wholesale_qty,
  p.stock,
  p.image_url AS imagen_producto,
  p.category_name AS categoria_producto,
  f.created_at AS fecha_guardado
FROM public.favorites f
JOIN public.users u ON f.id_users = u.id
JOIN public.products p ON f.id_product = p.id;

-- Notificar a PostgREST para recargar el esquema de Supabase
NOTIFY pgrst, 'reload schema';
