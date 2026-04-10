import { api } from '@/lib/api';
import type { ApartmentRow } from './apartments';

export type FloorRow = {
  id: string;
  level: number;
  name: string | null;
  blockId: string;
  block?: { code: string; name: string };
  /** GET /floors?blockId=... bilan keladi */
  apartments?: ApartmentRow[];
};

export async function listFloors(blockId?: string) {
  const { data } = await api.get<FloorRow[]>('/floors', {
    params: blockId ? { blockId } : undefined,
  });
  return data;
}

export async function createFloor(body: {
  blockId: string;
  level: number;
  name?: string;
}) {
  const { data } = await api.post<FloorRow>('/floors', body);
  return data;
}

export async function patchFloor(
  id: string,
  body: { level?: number; name?: string | null },
) {
  const { data } = await api.patch<FloorRow>(`/floors/${id}`, body);
  return data;
}

export async function deleteFloor(id: string) {
  await api.delete(`/floors/${id}`);
}

export async function bulkDeleteFloors(body: {
  ids?: string[];
  deleteAllInScope?: boolean;
  blockId?: string;
}) {
  const { data } = await api.post<{ deleted: number; skipped: number }>(
    '/floors/bulk-delete',
    body,
  );
  return data;
}
