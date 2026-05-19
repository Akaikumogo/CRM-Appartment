import { api } from '@/lib/api';

export type ContractRow = {
  id: string;
  apartmentId: string;
  clientId: string;
  sellerId?: string | null;
  organizationId?: string | null;
  contractDate: string;
  amount: number;
  status?: string | null;
  paymentStatus?: string | null;
  progressPercent?: number | null;
  createdAt: string;
  updatedAt: string;
  client?: { id: string; fullName?: string | null; phone?: string | null } | null;
  seller?: { id: string; fullName?: string | null; email?: string } | null;
  apartment?: {
    id: string;
    number?: string | number | null;
    areaSqm?: number | null;
    floor?: {
      id: string;
      level?: number | null;
      block?: { id: string; name?: string | null; code?: string | null } | null;
    } | null;
  } | null;
};

export async function listContracts() {
  const { data } = await api.get<ContractRow[]>('/contracts');
  return data;
}

export async function getContract(id: string) {
  const { data } = await api.get<ContractRow>(`/contracts/${id}`);
  return data;
}

export async function createContract(body: Record<string, unknown>) {
  const { data } = await api.post<ContractRow>('/contracts', body);
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
