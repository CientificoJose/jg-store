import * as z from 'zod';

export const userSchema = z.object({
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresa un correo electrónico válido'),
  phone: z.string().min(6, 'Ingresa un número de teléfono o WhatsApp válido'),
  role: z.enum(['Mayorista B2B', 'Cliente al Detal', 'Administrador', 'Asesor Comercial'], {
    message: 'Selecciona el tipo de cuenta'
  }),
  status: z.enum(['Activo', 'Pendiente', 'Inactivo'], {
    message: 'Selecciona el estado'
  }),
  empresa: z.string().optional(),
  rif_cuit: z.string().optional(),
  ciudad: z.string().optional()
});

export type UserFormValues = z.infer<typeof userSchema>;
