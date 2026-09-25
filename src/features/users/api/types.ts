export type { User } from '@/constants/mock-api-users';

export type UserFilters = {
  page?: number;
  limit?: number;
  roles?: string;
  search?: string;
  sort?: string;
};

export type UsersResponse = {
  success: boolean;
  time: string;
  message: string;
  total_users: number;
  offset: number;
  limit: number;
  users: import('@/constants/mock-api-users').User[];
};

export type UserMutationPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'Mayorista B2B' | 'Cliente al Detal' | 'Administrador' | 'Asesor Comercial';
  status: 'Activo' | 'Pendiente' | 'Inactivo';
  empresa?: string;
  rif_cuit?: string;
  ciudad?: string;
  pedidos_count?: number;
};
