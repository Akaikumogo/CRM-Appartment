import { api } from '@/lib/api';

export async function listContracts() {
  const { data } = await api.get<unknown[]>('/contracts');
  return data;
}

export async function getContract(id: string) {
  const { data } = await api.get<unknown>(`/contracts/${id}`);
  return data;
}

export async function createContract(body: Record<string, unknown>) {
  const { data } = await api.post<unknown>('/contracts', body);
  return data;
}

export async function bulkDeleteContracts(body: {
  ids?: string[];
  deleteAllInScope?: boolean;
  organizationId?: string;
}) {
  const { data } = await api.post<{ deleted: number }>(
    '/contracts/bulk-delete',
    body,
  );
  return data;
}
