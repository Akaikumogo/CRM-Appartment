/** Central React Query keys for CRM org/branch scope. */
export const qk = {
  analyticsOverview: ['analytics', 'overview'] as const,
  blocks: ['blocks'] as const,
  floors: (blockId?: string) => ['floors', { blockId }] as const,
  apartments: (floorId?: string) => ['apartments', { floorId }] as const,
  contracts: ['contracts'] as const,
  contractDetail: (id: string) => ['contracts', 'detail', id] as const,
  clients: (orgId?: string) => ['clients', { orgId }] as const,
  users: ['users'] as const,
  branches: (orgId: string) => ['branches', orgId] as const,
  /** Single branch (STAFF uses own branchId; org list is not allowed for STAFF). */
  branchOne: (branchId: string) => ['branches', 'one', branchId] as const,
  salesInventory: ['sales', 'inventory'] as const,
  organizations: ['organizations'] as const,
};
