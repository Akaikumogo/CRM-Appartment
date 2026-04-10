import { api } from '@/lib/api';

export type BranchMgmtRow = {
  id: string;
  name: string;
  code: string | null;
  isBlocked: boolean;
  isVip: boolean;
  blockedReason: string | null;
};

export async function listBranchesByOrg(organizationId: string) {
  const { data } = await api.get<BranchMgmtRow[]>(
    `/organizations/${organizationId}/branches`,
  );
  return data;
}

/** STAFF: only their branch (token branchId must match). ORG_ADMIN/superadmin: any branch in org. */
export async function getBranch(id: string) {
  const { data } = await api.get<BranchMgmtRow>(`/branches/${id}`);
  return data;
}

export async function patchBranch(
  id: string,
  body: {
    isVip?: boolean;
    isBlocked?: boolean;
    blockedReason?: string;
    name?: string;
    code?: string | null;
  },
) {
  const { data } = await api.patch<BranchMgmtRow>(`/branches/${id}`, body);
  return data;
}
