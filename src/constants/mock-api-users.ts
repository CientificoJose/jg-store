import { matchSorter } from 'match-sorter';

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: 'Activo' | 'Pendiente' | 'Inactivo';
  role: 'Mayorista B2B' | 'Cliente al Detal' | 'Administrador' | 'Asesor Comercial';
  empresa?: string;
  rif_cuit?: string;
  ciudad?: string;
  pedidos_count: number;
  created_at: string;
  updated_at: string;
};

const INITIAL_JG_USERS: User[] = [
  {
    id: 1,
    first_name: 'José',
    last_name: 'González',
    email: 'gerencia@jgstore.com',
    phone: '+58 412 1234567',
    status: 'Activo',
    role: 'Administrador',
    empresa: 'JG Store Polirubro C.A.',
    rif_cuit: 'J-50123456-7',
    ciudad: 'Caracas, DC',
    pedidos_count: 142,
    created_at: '2025-01-15T10:00:00.000Z',
    updated_at: '2026-09-25T12:00:00.000Z'
  },
  {
    id: 2,
    first_name: 'Carlos',
    last_name: 'Mendoza',
    email: 'cmendoza@inversioneslosllanos.com',
    phone: '+58 414 9876543',
    status: 'Activo',
    role: 'Mayorista B2B',
    empresa: 'Distribuidora Los Llanos B2B',
    rif_cuit: 'J-40987654-1',
    ciudad: 'Valencia, Carabobo',
    pedidos_count: 38,
    created_at: '2025-03-20T14:30:00.000Z',
    updated_at: '2026-09-20T16:00:00.000Z'
  },
  {
    id: 3,
    first_name: 'Mariana',
    last_name: 'Silva',
    email: 'mariana.silva@bazarcentro.com',
    phone: '+58 424 5551234',
    status: 'Activo',
    role: 'Mayorista B2B',
    empresa: 'Bazar & Variedades El Centro',
    rif_cuit: 'J-31415926-5',
    ciudad: 'Maracay, Aragua',
    pedidos_count: 24,
    created_at: '2025-05-12T09:15:00.000Z',
    updated_at: '2026-09-18T11:20:00.000Z'
  },
  {
    id: 4,
    first_name: 'Roberto',
    last_name: 'Herrera',
    email: 'rherrera@papeleriayregalos.com',
    phone: '+58 416 3334455',
    status: 'Pendiente',
    role: 'Mayorista B2B',
    empresa: 'Comercializadora Herrera & Hnos',
    rif_cuit: 'J-29876543-0',
    ciudad: 'Barquisimeto, Lara',
    pedidos_count: 0,
    created_at: '2026-09-24T18:00:00.000Z',
    updated_at: '2026-09-24T18:00:00.000Z'
  },
  {
    id: 5,
    first_name: 'Elena',
    last_name: 'Paredes',
    email: 'elena.paredes@gmail.com',
    phone: '+58 412 8889900',
    status: 'Activo',
    role: 'Cliente al Detal',
    empresa: 'Particular / Minorista',
    rif_cuit: 'V-19876543',
    ciudad: 'Caracas, Miranda',
    pedidos_count: 5,
    created_at: '2025-08-10T16:45:00.000Z',
    updated_at: '2026-09-15T10:10:00.000Z'
  },
  {
    id: 6,
    first_name: 'Andrés',
    last_name: 'Castillo',
    email: 'ventas@jgstore.com',
    phone: '+58 412 7776655',
    status: 'Activo',
    role: 'Asesor Comercial',
    empresa: 'JG Store Ventas WhatsApp',
    rif_cuit: 'V-24567890',
    ciudad: 'Caracas, DC',
    pedidos_count: 89,
    created_at: '2025-02-01T08:00:00.000Z',
    updated_at: '2026-09-25T09:00:00.000Z'
  },
  {
    id: 7,
    first_name: 'Patricia',
    last_name: 'Gómez',
    email: 'pgomez@ferreteriaunida.com',
    phone: '+58 414 1112233',
    status: 'Activo',
    role: 'Mayorista B2B',
    empresa: 'Ferretería & Hogar La Unión',
    rif_cuit: 'J-41238901-2',
    ciudad: 'Maracaibo, Zulia',
    pedidos_count: 19,
    created_at: '2025-06-18T11:30:00.000Z',
    updated_at: '2026-09-22T14:40:00.000Z'
  },
  {
    id: 8,
    first_name: 'Luis',
    last_name: 'Rivas',
    email: 'luis.rivas@outlook.com',
    phone: '+58 424 9998877',
    status: 'Activo',
    role: 'Cliente al Detal',
    empresa: 'Particular / Minorista',
    rif_cuit: 'V-22345678',
    ciudad: 'San Cristóbal, Táchira',
    pedidos_count: 2,
    created_at: '2026-02-14T15:20:00.000Z',
    updated_at: '2026-08-30T17:00:00.000Z'
  },
  {
    id: 9,
    first_name: 'Daniela',
    last_name: 'Morales',
    email: 'dmorales@tiendasdeleste.com',
    phone: '+58 412 4443322',
    status: 'Pendiente',
    role: 'Mayorista B2B',
    empresa: 'Multitiendas Del Este C.A.',
    rif_cuit: 'J-50345678-9',
    ciudad: 'Puerto La Cruz, Anzoátegui',
    pedidos_count: 0,
    created_at: '2026-09-25T10:00:00.000Z',
    updated_at: '2026-09-25T10:00:00.000Z'
  },
  {
    id: 10,
    first_name: 'Fernando',
    last_name: 'Alvarado',
    email: 'falvarado@gmail.com',
    phone: '+58 416 2223344',
    status: 'Inactivo',
    role: 'Cliente al Detal',
    empresa: 'Particular',
    rif_cuit: 'V-18765432',
    ciudad: 'Mérida, Mérida',
    pedidos_count: 1,
    created_at: '2025-04-10T12:00:00.000Z',
    updated_at: '2025-09-01T12:00:00.000Z'
  }
];

export const fakeUsers = {
  records: [...INITIAL_JG_USERS],

  initialize() {
    this.records = [...INITIAL_JG_USERS];
  },

  async getAll({ roles = [], search }: { roles?: string[]; search?: string }) {
    let users = [...this.records];

    if (roles.length > 0) {
      users = users.filter((user) => roles.includes(user.role));
    }

    if (search) {
      users = matchSorter(users, search, {
        keys: ['first_name', 'last_name', 'email', 'empresa', 'rif_cuit', 'phone', 'ciudad']
      });
    }

    return users;
  },

  async createUser(
    data: Omit<User, 'id' | 'created_at' | 'updated_at' | 'pedidos_count'> & {
      pedidos_count?: number;
    }
  ) {
    await delay(300);

    const newUser: User = {
      ...data,
      id: Date.now(),
      pedidos_count: data.pedidos_count ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.records.unshift(newUser);

    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      user: newUser
    };
  },

  async updateUser(id: number, data: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>) {
    await delay(300);

    const index = this.records.findIndex((user) => user.id === id);

    if (index === -1) {
      return { success: false, message: `Usuario con ID ${id} no encontrado` };
    }

    this.records[index] = {
      ...this.records[index],
      ...data,
      updated_at: new Date().toISOString()
    };

    return {
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: this.records[index]
    };
  },

  async deleteUser(id: number) {
    await delay(300);

    const index = this.records.findIndex((user) => user.id === id);

    if (index === -1) {
      return { success: false, message: `Usuario con ID ${id} no encontrado` };
    }

    this.records.splice(index, 1);

    return {
      success: true,
      message: 'Usuario eliminado exitosamente'
    };
  },

  async getUsers({
    page = 1,
    limit = 10,
    roles,
    search,
    sort
  }: {
    page?: number;
    limit?: number;
    roles?: string | string[];
    search?: string;
    sort?: string;
  }) {
    await delay(300);
    const rolesArray = roles
      ? Array.isArray(roles)
        ? roles
        : String(roles).split(/[.,]/)
      : [];

    let users = await this.getAll({ roles: rolesArray, search });

    if (sort) {
      try {
        const sortObj = JSON.parse(sort);
        if (Array.isArray(sortObj) && sortObj.length > 0) {
          const { id: sortKey, desc } = sortObj[0];
          users.sort((a, b) => {
            const valA = (a as any)[sortKey];
            const valB = (b as any)[sortKey];
            if (typeof valA === 'string') {
              return desc ? valB.localeCompare(valA) : valA.localeCompare(valB);
            }
            return desc ? valB - valA : valA - valB;
          });
        }
      } catch {
        // Ignorar error de parsing
      }
    }

    const total_users = users.length;
    const offset = (page - 1) * limit;
    const paginatedUsers = users.slice(offset, offset + limit);

    return {
      success: true,
      time: new Date().toISOString(),
      message: 'Usuarios cargados exitosamente',
      total_users,
      offset,
      limit,
      users: paginatedUsers
    };
  }
};
