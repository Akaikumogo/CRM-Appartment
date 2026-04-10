import { api } from '@/lib/api';
import {
  getSessionUser,
  setSessionAuth,
  type SessionUser,
} from '@/lib/sessionUser';

export const ALL_PERMISSION_KEYS_LIST = [
  'dashboard.home',
  'sales.indicators',
  'workers.read',
  'workers.write',
  'branches.read',
  'branches.write',
  'blocks.read',
  'blocks.write',
  'blocks.delete',
  'floors.read',
  'floors.write',
  'floors.delete',
  'apartments.read',
  'apartments.write',
  'apartments.delete',
  'apartments.presence',
  'clients.read',
  'clients.write',
  'clients.delete',
  'contracts.read',
  'contracts.write',
  'contracts.delete',
  'integrations.mqtt',
  'showroom',
  'legal',
] as const;

/** Mirrors backend ALL_PERMISSION_KEYS for UI labels. */
export const PERMISSION_LABELS: Record<string, string> = {
  'dashboard.home': 'Bosh sahifa / Analytics',
  'sales.indicators': 'Sotuv ko‘rsatkichlari',
  'workers.read': 'Ishchilar (ko‘rish)',
  'workers.write': 'Ishchilar (tahrir)',
  'branches.read': 'Filiallar (ko‘rish)',
  'branches.write': 'Filiallar (tahrir)',
  'blocks.read': 'Bloklar (ko‘rish)',
  'blocks.write': 'Bloklar (tahrir)',
  'blocks.delete': 'Bloklar (o‘chirish)',
  'floors.read': 'Qavatlar (ko‘rish)',
  'floors.write': 'Qavatlar (tahrir)',
  'floors.delete': 'Qavatlar (o‘chirish)',
  'apartments.read': 'Kvartiralar (ko‘rish)',
  'apartments.write': 'Kvartiralar (tahrir)',
  'apartments.delete': 'Kvartiralar (o‘chirish)',
  'apartments.presence': 'Kvartira ko‘rilishi (realtime)',
  'clients.read': 'Mijozlar (ko‘rish)',
  'clients.write': 'Mijozlar (tahrir)',
  'clients.delete': 'Mijozlar (o‘chirish)',
  'contracts.read': 'Shartnomalar (ko‘rish)',
  'contracts.write': 'Shartnomalar (tahrir)',
  'contracts.delete': 'Shartnomalar (o‘chirish)',
  'integrations.mqtt': 'MQTT integratsiya',
  showroom: 'Ko‘rgazma xonasi',
  legal: 'Rasmiy ma’lumot',
};

const pathToPermission: { prefix: string; perm: string }[] = [
  { prefix: '/dashboard/home', perm: 'dashboard.home' },
  { prefix: '/dashboard/sales-indicators', perm: 'sales.indicators' },
  { prefix: '/dashboard/workers', perm: 'workers.read' },
  { prefix: '/dashboard/branches', perm: 'branches.read' },
  { prefix: '/dashboard/blocks', perm: 'blocks.read' },
  { prefix: '/dashboard/floors', perm: 'floors.read' },
  { prefix: '/dashboard/appartments', perm: 'apartments.read' },
  { prefix: '/dashboard/clients', perm: 'clients.read' },
  { prefix: '/dashboard/contracts', perm: 'contracts.read' },
  { prefix: '/dashboard/show-rooms', perm: 'showroom' },
  { prefix: '/dashboard/legal', perm: 'legal' },
  { prefix: '/dashboard/permissions', perm: 'workers.write' },
  { prefix: '/dashboard/my-permissions', perm: 'dashboard.home' },
];


export function permissionForPath(pathname: string): string | undefined {
  const hit = pathToPermission.find(
    (x) => pathname === x.prefix || pathname.startsWith(x.prefix + '/'),
  );
  return hit?.perm;
}

export function can(
  effective: string[] | undefined,
  role: SessionUser['role'] | undefined,
  key: string,
): boolean {
  if (role === 'org_admin' || role === 'superadmin') {
    return true;
  }
  if (!effective?.length) {
    return false;
  }
  return effective.includes(key);
}

export function canAccessRoute(
  pathname: string,
  user: SessionUser | null,
): boolean {
  if (!user) {
    return false;
  }
  if (user.role === 'org_admin' || user.role === 'superadmin') {
    return true;
  }
  const need = permissionForPath(pathname);
  if (!need) {
    return true;
  }
  return can(user.effectivePermissions, user.role, need);
}

export async function refreshAuthMe(): Promise<SessionUser | null> {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }
  try {
    const { data } = await api.get<{
      id: string;
      email: string;
      role: SessionUser['role'];
      organizationId: string | null;
      branchId: string | null;
      fullName: string | null;
      permissions: string[] | null;
      effectivePermissions: string[];
    }>('/auth/me');
    const next: SessionUser = {
      id: data.id,
      email: data.email,
      role: data.role,
      organizationId: data.organizationId,
      branchId: data.branchId,
      fullName: data.fullName,
      effectivePermissions: data.effectivePermissions,
    };
    setSessionAuth(token, next);
    return next;
  } catch {
    return getSessionUser();
  }
}
