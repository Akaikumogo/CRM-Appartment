import { api } from '@/lib/api';

export type BlockRow = {
  id: string;
  code: string;
  name: string;
  branchId: string;
  branch?: { name: string };
};

export async function listBlocks() {
  const { data } = await api.get<BlockRow[]>('/blocks');
  return data;
}

export async function createBlock(body: {
  branchId: string;
  code: string;
  name: string;
}) {
  const { data } = await api.post<BlockRow>('/blocks', body);
  return data;
}

export async function patchBlock(
  id: string,
  body: { code?: string; name?: string },
) {
  const { data } = await api.patch<BlockRow>(`/blocks/${id}`, body);
  return data;
}

export async function deleteBlock(id: string) {
  await api.delete(`/blocks/${id}`);
}

export async function bulkDeleteBlocks(body: {
  ids?: string[];
  deleteAllInScope?: boolean;
  branchId?: string;
}) {
  const { data } = await api.post<{ deleted: number; skipped: number }>(
    '/blocks/bulk-delete',
    body,
  );
  return data;
}

export async function bulkAssignBlocksBranch(body: {
  targetBranchId: string;
  ids: string[];
}) {
  const { data } = await api.post<{ updated: number; skipped: number }>(
    '/blocks/bulk-assign-branch',
    body,
  );
  return data;
}

export async function duplicateBlock(
  id: string,
  body: { name: string; code?: string },
) {
  const { data } = await api.post<BlockRow>(`/blocks/${id}/duplicate`, body);
  return data;
}
