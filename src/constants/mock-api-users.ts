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

// Almacén en memoria de clientes reales (sin registros simulados ni falsos)
const INITIAL_JG_USERS: User[] = [];

export const fakeUsers = {
  records: [...INITIAL_JG_USERS],

  initialize() {
    this.records = [...INITIAL_JG_USERS];
  },

  async syncOrdersCustomers() {
    const rawOrdersUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jg-store-bd.press-cloud.com';
    const SUPABASE_URL = rawOrdersUrl.replace(/^http:\/\//i, 'https://');
    const SUPABASE_KEY =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) return;

    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc&limit=100`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`
          },
          cache: 'no-store'
        }
      );

      if (res.ok) {
        const orders = await res.json();
        if (Array.isArray(orders) && orders.length > 0) {
          // Extraer clientes reales únicos a partir de las órdenes registradas
          const customerMap = new Map<string, { ordersCount: number; lastOrder: any }>();
          for (const ord of orders) {
            const key = ord.customer_phone || ord.customer_email || ord.customer_name;
            if (!key) continue;
            if (!customerMap.has(key)) {
              customerMap.set(key, { ordersCount: 1, lastOrder: ord });
            } else {
              customerMap.get(key)!.ordersCount++;
            }
          }

          for (const [key, val] of customerMap.entries()) {
            const ord = val.lastOrder;
            const exists = this.records.find(
              (u) =>
                (ord.customer_phone && u.phone === ord.customer_phone) ||
                (ord.customer_email && u.email === ord.customer_email)
            );

            if (exists) {
              exists.pedidos_count = val.ordersCount;
            } else {
              const fullName = (ord.customer_name || 'Cliente').trim();
              const names = fullName.split(' ');
              const first_name = names[0] || 'Cliente';
              const last_name = names.slice(1).join(' ') || '';

              this.records.push({
                id: Math.floor(100000 + Math.random() * 900000),
                first_name,
                last_name,
                email: ord.customer_email || `${first_name.toLowerCase().replace(/[^a-z0-9]/g, '')}@cliente.com`,
                phone: ord.customer_phone || '',
                status: 'Activo',
                role: ord.order_type === 'wholesale' ? 'Mayorista B2B' : 'Cliente al Detal',
                empresa: ord.order_type === 'wholesale' ? fullName : 'Particular / Minorista',
                rif_cuit: ord.document_number || 'S/D',
                ciudad: [ord.city, ord.province].filter(Boolean).join(', ') || 'Argentina',
                pedidos_count: val.ordersCount,
                created_at: ord.created_at || new Date().toISOString(),
                updated_at: ord.updated_at || new Date().toISOString()
              });
            }
          }
        }
      }
    } catch {
      // Fallback silencioso
    }
  },

  async getAll({ roles = [], search }: { roles?: string[]; search?: string }) {
    await this.syncOrdersCustomers();
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
    await delay(200);

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
    await delay(200);

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
    await delay(200);

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
    await this.syncOrdersCustomers();
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
