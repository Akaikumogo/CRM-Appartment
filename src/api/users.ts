import { api } from '@/lib/api';

export type ApiUserRow = {
  id: string;
  email: string;
  fullName?: string | null;
  organizationId?: string | null;
  role: string;
  permissions?: string[] | null;
};

export async function listUsers() {
  const { data } = await api.get<ApiUserRow[]>('/users');
  return data;
}

export async function createUser(body: Record<string, unknown>) {
  const { data } = await api.post<ApiUserRow>('/users', body);
  return data;
}

export async function deleteUser(id: string) {
  await api.delete(`/users/${id}`);
}

export async function bulkDeleteUsers(body: {
  ids?: string[];
  deleteAllInScope?: boolean;
}) {
  const { data } = await api.post<{ deleted: number }>(
    '/users/bulk-delete',
    body,
  );
  return data;
}

export async function patchUserPermissions(id: string, permissions: string[]) {
  const { data } = await api.patch<ApiUserRow>(`/users/${id}/permissions`, {
    permissions,
  });
  return data;
}
