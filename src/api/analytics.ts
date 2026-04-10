import { api } from '@/lib/api';

export type BranchOverviewRow = {
  branchId: string;
  name: string;
  code: string | null;
  isVip: boolean;
  isBlocked: boolean;
  forSale: number;
  reserved: number;
  sold: number;
  total: number;
};

export type SuperadminInventoryRow = {
  organizationId: string;
  organizationName: string;
  branchId: string;
  branchName: string;
  branchCode: string | null;
  blocks: number;
  floors: number;
  apartments: number;
};

export async function fetchAnalyticsOverview() {
  const { data } = await api.get<BranchOverviewRow[]>('/analytics/overview');
  return data;
}

export async function fetchSuperadminInventory() {
  const { data } = await api.get<SuperadminInventoryRow[]>(
    '/analytics/superadmin-inventory',
  );
  return data;
}
