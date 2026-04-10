import { api } from '@/lib/api';

export type ApartmentRow = {
  id: string;
  number: string;
  status: string;
  floorId: string;
  areaSqm: string | null;
  rooms: number | null;
  priceTotal: string | null;
  pricePerSqm: string | null;
};

export async function listApartments(floorId?: string) {
  const { data } = await api.get<ApartmentRow[]>('/apartments', {
    params: floorId ? { floorId } : undefined,
  });
  return data;
}

export async function createApartment(body: {
  floorId: string;
  number: string;
  status?: string;
  areaSqm?: number;
  rooms?: number;
  priceTotal?: number;
  pricePerSqm?: number;
}) {
  const { data } = await api.post<ApartmentRow>('/apartments', body);
  return data;
}

export async function patchApartment(
  id: string,
  body: {
    number?: string;
    status?: string;
    areaSqm?: number | null;
    rooms?: number | null;
    priceTotal?: number | null;
    pricePerSqm?: number | null;
  },
) {
  const { data } = await api.patch<ApartmentRow>(`/apartments/${id}`, body);
  return data;
}

export async function deleteApartment(id: string) {
  await api.delete(`/apartments/${id}`);
}

export async function bulkDeleteApartments(body: {
  ids?: string[];
  deleteAllInScope?: boolean;
  floorId?: string;
}) {
  const { data } = await api.post<{ deleted: number; skipped: number }>(
    '/apartments/bulk-delete',
    body,
  );
  return data;
}

export type CopyFromFloorResult = {
  created: number;
  skippedNonNumeric: number;
  skippedConflict: number;
  targetsProcessed: number;
  sourceApartments: number;
};

/** Bir blok ichida: manba qavatdagi kvartiralarni tanlangan qavatlarga nusxalash. */
export async function copyApartmentsFromFloor(body: {
  sourceFloorId: string;
  targetFloorIds: string[];
  levelMultiplier?: number;
}) {
  const { data } = await api.post<CopyFromFloorResult>(
    '/apartments/copy-from-floor',
    body,
  );
  return data;
}

export async function bulkCreateApartmentsOnFloor(body: {
  floorId: string;
  count: number;
}) {
  const { data } = await api.post<{ created: number }>(
    '/apartments/bulk-create-on-floor',
    body,
  );
  return data;
}
