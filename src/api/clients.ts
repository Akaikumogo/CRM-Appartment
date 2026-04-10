import { api } from '@/lib/api';

export type ApiClientRow = {
  id: string;
  fullName: string;
  phone: string;
  organizationId: string;
  createdAt: string;
};

export async function listClients(params?: {
  organizationId?: string;
  take?: number;
}) {
  const { data } = await api.get<ApiClientRow[]>('/clients', { params });
  return data;
}

export async function createClient(orgId: string, body: { fullName: string; phone: string }) {
  const { data } = await api.post<ApiClientRow>(`/clients/org/${orgId}`, body);
  return data;
}

export async function deleteClient(id: string) {
  await api.delete(`/clients/${id}`);
}

export async function bulkDeleteClients(body: {
  ids?: string[];
  deleteAllInScope?: boolean;
  organizationId?: string;
}) {
  const { data } = await api.post<{ deleted: number }>(
    '/clients/bulk-delete',
    body,
  );
  return data;
}
