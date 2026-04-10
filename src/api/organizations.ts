import { api } from '@/lib/api';

export type OrganizationListRow = { id: string; name: string };

export async function listOrganizations() {
  const { data } = await api.get<OrganizationListRow[]>('/organizations');
  return data;
}
