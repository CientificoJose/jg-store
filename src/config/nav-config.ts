import { NavGroup } from '@/types';

/**
 * Navigation configuration with RBAC support
 *
 * This configuration is used for both the sidebar navigation and Cmd+K bar.
 * Items are organized into groups, each rendered with a SidebarGroupLabel.
 *
 * RBAC Access Control:
 * Each navigation item can have an `access` property that controls visibility
 * based on permissions, plans, features, roles, and organization context.
 *
 * Examples:
 *
 * 1. Require organization:
 *    access: { requireOrg: true }
 *
 * 2. Require specific permission:
 *    access: { requireOrg: true, permission: 'org:teams:manage' }
 *
 * 3. Require specific plan:
 *    access: { plan: 'pro' }
 *
 * 4. Require specific feature:
 *    access: { feature: 'premium_access' }
 *
 * 5. Require specific role:
 *    access: { role: 'admin' }
 *
 * 6. Multiple conditions (all must be true):
 *    access: { requireOrg: true, permission: 'org:teams:manage', plan: 'pro' }
 *
 * Note: The `visible` function is deprecated but still supported for backward compatibility.
 * Use the `access` property for new items.
 */
export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'Ver Tienda Online',
        url: '/',
        icon: 'store',
        isActive: false,
        items: []
      },
      {
        title: 'Productos JG Store',
        url: '/dashboard/product',
        icon: 'product',
        shortcut: ['p', 'p'],
        isActive: false,
        items: []
      },
      {
        title: 'Clientes y Usuarios',
        url: '/dashboard/users',
        icon: 'teams',
        shortcut: ['u', 'u'],
        isActive: false,
        items: []
      },
      {
        title: 'Pedidos y Órdenes',
        url: '/dashboard/orders',
        icon: 'billing',
        shortcut: ['o', 'o'],
        isActive: false,
        items: []
      },
      {
        title: 'Scraper Coronel',
        url: '/dashboard/coronel',
        icon: 'terminal',
        shortcut: ['s', 'c'],
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'Configuración',
    items: [
      {
        title: 'Ajustes de Tienda',
        url: '#',
        icon: 'settings',
        isActive: true,
        items: [
          {
            title: 'Información General',
            url: '/dashboard/config/general',
            icon: 'store',
            shortcut: ['c', 'g']
          },
          {
            title: 'Diseño de Landing',
            url: '/dashboard/config/landing',
            icon: 'layout',
            shortcut: ['c', 'l']
          },
          {
            title: 'Temas y Apariencia',
            url: '/dashboard/config/theme',
            icon: 'palette',
            shortcut: ['c', 't']
          }
        ]
      }
    ]
  },
  {
    label: 'Cuenta',
    items: [
      {
        title: 'Account',
        url: '#',
        icon: 'account',
        isActive: true,
        items: [
          {
            title: 'Profile',
            url: '/dashboard/profile',
            icon: 'profile',
            shortcut: ['m', 'm']
          },
          {
            title: 'Notifications',
            url: '/dashboard/notifications',
            icon: 'notification',
            shortcut: ['n', 'n']
          },
          {
            title: 'Billing',
            url: '/dashboard/billing',
            icon: 'billing',
            shortcut: ['b', 'b'],
            access: { requireOrg: true }
          },
          {
            title: 'Login',
            shortcut: ['l', 'l'],
            url: '/',
            icon: 'login'
          }
        ]
      }
    ]
  }
];
