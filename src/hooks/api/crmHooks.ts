import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { qk } from '@/api/queryKeys';
import { fetchAnalyticsOverview } from '@/api/analytics';
import {
  bulkCreateApartmentsOnFloor,
  bulkDeleteApartments,
  copyApartmentsFromFloor,
  createApartment,
  deleteApartment,
  listApartments,
  patchApartment,
} from '@/api/apartments';
import {
  bulkDeleteBlocks,
  bulkAssignBlocksBranch,
  createBlock,
  deleteBlock,
  duplicateBlock,
  listBlocks,
  patchBlock,
} from '@/api/blocks';
import {
  bulkDeleteClients,
  createClient,
  deleteClient,
  listClients,
} from '@/api/clients';
import {
  bulkDeleteContracts,
  createContract,
  getContract,
  listContracts,
} from '@/api/contracts';
import {
  bulkDeleteFloors,
  createFloor,
  deleteFloor,
  listFloors,
  patchFloor,
} from '@/api/floors';
import { getBranch, listBranchesByOrg, patchBranch } from '@/api/branches';
import { listOrganizations } from '@/api/organizations';
import { fetchSalesInventory } from '@/api/salesInventory';
import {
  bulkDeleteUsers,
  createUser,
  deleteUser,
  listUsers,
  patchUserPermissions,
} from '@/api/users';

function useInvalidateBlockTree() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: qk.blocks });
    void qc.invalidateQueries({ queryKey: qk.floors() });
    void qc.invalidateQueries({ queryKey: qk.apartments() });
    void qc.invalidateQueries({ queryKey: qk.salesInventory });
  };
}

export function useAnalyticsOverviewQuery(
  enabled: boolean,
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof fetchAnalyticsOverview>>>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: qk.analyticsOverview,
    queryFn: fetchAnalyticsOverview,
    enabled,
    ...options,
  });
}

export function useBlocksQuery(enabled = true) {
  return useQuery({
    queryKey: qk.blocks,
    queryFn: listBlocks,
    enabled,
  });
}

export function useFloorsQuery(blockId?: string, enabled = true) {
  return useQuery({
    queryKey: qk.floors(blockId),
    queryFn: () => listFloors(blockId),
    enabled,
  });
}

export function useApartmentsQuery(floorId?: string, enabled = true) {
  return useQuery({
    queryKey: qk.apartments(floorId),
    queryFn: () => listApartments(floorId),
    enabled,
  });
}

export function useContractsQuery(enabled = true) {
  return useQuery({
    queryKey: qk.contracts,
    queryFn: listContracts,
    enabled,
  });
}

export function useContractQuery(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: qk.contractDetail(id ?? ''),
    queryFn: () => getContract(id!),
    enabled: Boolean(id) && enabled,
  });
}

export function useClientsQuery(listOrgId?: string, enabled = true) {
  return useQuery({
    queryKey: qk.clients(listOrgId),
    queryFn: () =>
      listClients({ organizationId: listOrgId, take: 200 }),
    enabled,
  });
}

export function useUsersQuery(enabled = true) {
  return useQuery({
    queryKey: qk.users,
    queryFn: listUsers,
    enabled,
  });
}

export function useBranchesOrgQuery(orgId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: qk.branches(orgId ?? ''),
    queryFn: () => listBranchesByOrg(orgId!),
    enabled: Boolean(orgId) && enabled,
  });
}

/** Current user's single branch (filial xodimi). Requires `branches.read`. */
export function useBranchQuery(branchId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: qk.branchOne(branchId ?? ''),
    queryFn: () => getBranch(branchId!),
    enabled: Boolean(branchId) && enabled,
  });
}

export function useOrganizationsQuery(enabled = true) {
  return useQuery({
    queryKey: qk.organizations,
    queryFn: listOrganizations,
    enabled,
  });
}

export function useSalesInventoryQuery(enabled = true) {
  return useQuery({
    queryKey: qk.salesInventory,
    queryFn: fetchSalesInventory,
    enabled,
  });
}

export function useBlockMutations() {
  const qc = useQueryClient();
  const inv = useInvalidateBlockTree();
  const create = useMutation({
    mutationFn: createBlock,
    onSuccess: () => {
      inv();
      void qc.invalidateQueries({ queryKey: qk.blocks });
    },
  });
  const patch = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { code?: string; name?: string } }) =>
      patchBlock(id, body),
    onSuccess: () => {
      inv();
      void qc.invalidateQueries({ queryKey: qk.blocks });
    },
  });
  const remove = useMutation({
    mutationFn: deleteBlock,
    onSuccess: () => inv(),
  });
  const bulkRemove = useMutation({
    mutationFn: bulkDeleteBlocks,
    onSuccess: () => inv(),
  });
  const duplicate = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { name: string; code?: string };
    }) => duplicateBlock(id, body),
    onSuccess: () => {
      inv();
      void qc.invalidateQueries({ queryKey: qk.blocks });
    },
  });
  const bulkAssignBranch = useMutation({
    mutationFn: bulkAssignBlocksBranch,
    onSuccess: () => {
      inv();
      void qc.invalidateQueries({ queryKey: qk.blocks });
    },
  });
  return { create, patch, remove, bulkRemove, duplicate, bulkAssignBranch };
}

export function useFloorMutations() {
  const inv = useInvalidateBlockTree();
  const create = useMutation({
    mutationFn: createFloor,
    onSuccess: () => inv(),
  });
  const patch = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { level?: number; name?: string | null };
    }) => patchFloor(id, body),
    onSuccess: () => inv(),
  });
  const remove = useMutation({
    mutationFn: deleteFloor,
    onSuccess: () => inv(),
  });
  const bulkRemove = useMutation({
    mutationFn: bulkDeleteFloors,
    onSuccess: () => inv(),
  });
  return { create, patch, remove, bulkRemove };
}

export function useApartmentMutations() {
  const inv = useInvalidateBlockTree();
  const create = useMutation({
    mutationFn: createApartment,
    onSuccess: () => inv(),
  });
  const patch = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof patchApartment>[1];
    }) => patchApartment(id, body),
    onSuccess: () => inv(),
  });
  const remove = useMutation({
    mutationFn: deleteApartment,
    onSuccess: () => inv(),
  });
  const bulkRemove = useMutation({
    mutationFn: bulkDeleteApartments,
    onSuccess: () => inv(),
  });
  const copyFromFloor = useMutation({
    mutationFn: copyApartmentsFromFloor,
    onSuccess: () => inv(),
  });
  const bulkCreateOnFloor = useMutation({
    mutationFn: bulkCreateApartmentsOnFloor,
    onSuccess: () => inv(),
  });
  return {
    create,
    patch,
    remove,
    bulkRemove,
    copyFromFloor,
    bulkCreateOnFloor,
  };
}

export function useClientMutations() {
  const qc = useQueryClient();
  const inv = () => {
    void qc.invalidateQueries({ queryKey: qk.clients() });
  };
  const create = useMutation({
    mutationFn: ({
      orgId,
      body,
    }: {
      orgId: string;
      body: { fullName: string; phone: string };
    }) => createClient(orgId, body),
    onSuccess: inv,
  });
  const remove = useMutation({
    mutationFn: deleteClient,
    onSuccess: inv,
  });
  const bulkRemove = useMutation({
    mutationFn: (body: Parameters<typeof bulkDeleteClients>[0]) =>
      bulkDeleteClients(body),
    onSuccess: inv,
  });
  return { create, remove, bulkRemove };
}

export function useContractMutations() {
  const qc = useQueryClient();
  const inv = () => {
    void qc.invalidateQueries({ queryKey: qk.contracts });
    void qc.invalidateQueries({ queryKey: ['contracts', 'detail'] });
    void qc.invalidateQueries({ queryKey: qk.salesInventory });
  };
  const create = useMutation({
    mutationFn: createContract,
    onSuccess: inv,
  });
  const bulkRemove = useMutation({
    mutationFn: bulkDeleteContracts,
    onSuccess: inv,
  });
  return { create, bulkRemove };
}

export function useUserMutations() {
  const qc = useQueryClient();
  const inv = () => void qc.invalidateQueries({ queryKey: qk.users });
  const create = useMutation({
    mutationFn: createUser,
    onSuccess: inv,
  });
  const remove = useMutation({
    mutationFn: deleteUser,
    onSuccess: inv,
  });
  const bulkRemove = useMutation({
    mutationFn: bulkDeleteUsers,
    onSuccess: inv,
  });
  const patchPermissions = useMutation({
    mutationFn: ({
      id,
      permissions,
    }: {
      id: string;
      permissions: string[];
    }) => patchUserPermissions(id, permissions),
    onSuccess: inv,
  });
  return { create, remove, bulkRemove, patchPermissions };
}

export function useBranchOrgMutations(orgId: string | undefined) {
  const qc = useQueryClient();
  const inv = () => {
    if (orgId) {
      void qc.invalidateQueries({ queryKey: qk.branches(orgId) });
    }
  };
  const patch = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof patchBranch>[1];
    }) => patchBranch(id, body),
    onSuccess: (_data, vars) => {
      inv();
      void qc.invalidateQueries({ queryKey: qk.branchOne(vars.id) });
    },
  });
  return { patch };
}
