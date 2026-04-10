'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BulkDeleteConfirmModal,
  type BulkDeleteChoice,
} from '@/components/BulkDeleteConfirmModal';
import { Building2, Copy, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { BlockRow } from '@/api/blocks';
import type { BranchMgmtRow } from '@/api/branches';
import {
  useBlockMutations,
  useBlocksQuery,
  useBranchQuery,
  useBranchesOrgQuery,
} from '@/hooks/api/crmHooks';
import { can, refreshAuthMe } from '@/lib/permissions';
import { getSessionUser } from '@/lib/sessionUser';
import { BlockHierarchyPanel } from './BlockHierarchyPanel';

const { Title, Text } = Typography;

export default function BlocksPage() {
  const user = getSessionUser();
  const perms = user?.effectivePermissions;
  const canRead = can(perms, user?.role, 'blocks.read');
  const canWrite = can(perms, user?.role, 'blocks.write');
  const canDelete = can(perms, user?.role, 'blocks.delete');
  const canFloorRead = can(perms, user?.role, 'floors.read');
  const canFloorWrite = can(perms, user?.role, 'floors.write');
  const canFloorDelete = can(perms, user?.role, 'floors.delete');
  const canAptRead = can(perms, user?.role, 'apartments.read');
  const canAptWrite = can(perms, user?.role, 'apartments.write');
  const canAptDelete = can(perms, user?.role, 'apartments.delete');

  const orgId = user?.organizationId ?? undefined;
  const isStaff = user?.role === 'staff';
  const staffBranchId = user?.branchId ?? undefined;

  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<BlockRow | null>(null);
  const [dupSource, setDupSource] = useState<BlockRow | null>(null);
  const [form] = Form.useForm<{ branchId: string; code: string; name: string }>();
  const [editForm] = Form.useForm<{ code: string; name: string }>();
  const [dupForm] = Form.useForm<{ name: string; code?: string }>();
  const [branchFilter, setBranchFilter] = useState<string | undefined>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [expandedBlockKeys, setExpandedBlockKeys] = useState<string[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignBranchId, setAssignBranchId] = useState<string>('');

  useEffect(() => {
    void refreshAuthMe();
  }, []);

  const { data: orgBranches = [], isLoading: orgBranchesLoading } =
    useBranchesOrgQuery(orgId, Boolean(orgId) && !isStaff);

  const { data: staffBranch, isLoading: staffBranchLoading } = useBranchQuery(
    staffBranchId,
    isStaff && Boolean(staffBranchId),
  );

  const branches = useMemo((): BranchMgmtRow[] => {
    if (isStaff && staffBranch) {
      return [staffBranch];
    }
    return orgBranches;
  }, [isStaff, staffBranch, orgBranches]);

  const branchesLoading = isStaff ? staffBranchLoading : orgBranchesLoading;

  const { data: blocks = [], isLoading: blocksLoading } =
    useBlocksQuery(canRead);

  const { create, patch, remove, bulkRemove, duplicate, bulkAssignBranch } =
    useBlockMutations();

  useEffect(() => {
    if (addOpen && branches.length === 1) {
      form.setFieldsValue({ branchId: branches[0].id });
    }
  }, [addOpen, branches, form]);

  const loading = branchesLoading || blocksLoading;

  const branchNameById = useMemo(() => {
    const m = new Map<string, string>();
    branches.forEach((b) => m.set(b.id, b.name));
    return m;
  }, [branches]);

  const filteredBlocks = useMemo(() => {
    if (!branchFilter) {
      return blocks;
    }
    return blocks.filter((b) => b.branchId === branchFilter);
  }, [blocks, branchFilter]);

  const runBulkDeleteBlocks = async (choice: BulkDeleteChoice) => {
    try {
      if (choice === 'selected') {
        await bulkRemove.mutateAsync({ ids: selectedRowKeys });
      } else {
        await bulkRemove.mutateAsync({
          deleteAllInScope: true,
          ...(branchFilter ? { branchId: branchFilter } : {}),
        });
      }
      message.success('O‘chirildi');
      setSelectedRowKeys([]);
    } catch {
      message.error('O‘chirishda xatolik');
    }
  };

  const runAssignBranch = async () => {
    if (!assignBranchId || selectedRowKeys.length === 0) {
      return;
    }
    const selectedRows = blocks.filter((b) => selectedRowKeys.includes(b.id));
    if (!selectedRows.length) {
      return;
    }
    const alreadyInTarget = selectedRows.filter(
      (b) => b.branchId === assignBranchId,
    ).length;
    if (alreadyInTarget === selectedRowKeys.length) {
      message.info('Tanlangan bloklar allaqachon shu filialga biriktirilgan');
      return;
    }
    try {
      const res = await bulkAssignBranch.mutateAsync({
        targetBranchId: assignBranchId,
        ids: selectedRowKeys,
      });
      message.success(`Biriktirildi: ${res.updated}, tashlab ketildi: ${res.skipped}`);
      setAssignOpen(false);
      setAssignBranchId('');
      setSelectedRowKeys([]);
    } catch {
      message.error('Birikitrishda xatolik (kod konflikti yoki ruxsat)')
    }
  };

  const submitCreate = async () => {
    const v = await form.validateFields();
    try {
      await create.mutateAsync(v);
      message.success('Blok qo‘shildi');
      setAddOpen(false);
      form.resetFields();
    } catch {
      message.error('Saqlashda xatolik');
    }
  };

  const submitEdit = async () => {
    if (!editRow) {
      return;
    }
    const v = await editForm.validateFields();
    try {
      await patch.mutateAsync({ id: editRow.id, body: v });
      message.success('Yangilandi');
      setEditRow(null);
    } catch {
      message.error('Yangilashda xatolik');
    }
  };

  const submitDuplicate = async () => {
    if (!dupSource) {
      return;
    }
    const v = await dupForm.validateFields();
    try {
      await duplicate.mutateAsync({
        id: dupSource.id,
        body: {
          name: v.name.trim(),
          ...(v.code?.trim() ? { code: v.code.trim() } : {}),
        },
      });
      message.success('Blok nusxalandi');
      setDupSource(null);
      dupForm.resetFields();
    } catch {
      message.error('Nusxalashda xatolik');
    }
  };

  const columns: ColumnsType<BlockRow> = [
    {
      title: 'Blok',
      key: 'n',
      render: (_, r) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-teal-500" />
          <div>
            <div className="font-medium text-slate-900 dark:text-white">
              {r.name}
            </div>
            <Text type="secondary" className="text-xs">
              Kod: {r.code}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Filial',
      key: 'br',
      render: (_, r) =>
        r.branch?.name ?? branchNameById.get(r.branchId) ?? r.branchId,
    },
    {
      title: 'Amallar',
      key: 'a',
      width: 200,
      render: (_, r) => (
        <Space>
          {canWrite ? (
            <Tooltip title="Nusxalash">
              <Button
                type="text"
                icon={<Copy className="h-4 w-4" />}
                onClick={() => {
                  setDupSource(r);
                  dupForm.setFieldsValue({
                    name: `${r.name} (nusxa)`,
                    code: undefined,
                  });
                }}
              />
            </Tooltip>
          ) : null}
          {canWrite ? (
            <Button
              type="text"
              icon={<Pencil className="h-4 w-4" />}
              onClick={() => {
                setEditRow(r);
                editForm.setFieldsValue({ code: r.code, name: r.name });
              }}
            />
          ) : null}
          {canDelete ? (
            <Popconfirm
              title="Blokni o‘chirish?"
              description="Bog‘liq qavatlar va shartnomalarsiz kvartiralar ham o‘chadi."
              onConfirm={async () => {
                try {
                  await remove.mutateAsync(r.id);
                  message.success('O‘chirildi');
                } catch {
                  message.error('O‘chirish mumkin emas (shartnoma yoki FK)');
                }
              }}
            >
              <Button type="text" danger icon={<Trash2 className="h-4 w-4" />} />
            </Popconfirm>
          ) : null}
        </Space>
      ),
    },
  ];

  if (!canRead) {
    return (
      <div className="p-6 text-slate-600 dark:text-slate-400">
        Bloklar bo‘limiga ruxsat yo‘q.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2">
      <Card className="border-slate-200 dark:border-zinc-800 dark:bg-zinc-950/60">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Title level={4} className="!mb-0 !text-slate-900 dark:!text-white">
            Bloklar
          </Title>
          <Space wrap>
            <Select
              allowClear
              placeholder="Filial bo‘yicha"
              style={{ minWidth: 200 }}
              value={branchFilter}
              onChange={(v) => {
                setBranchFilter(v);
                setSelectedRowKeys([]);
              }}
              options={branches.map((b: BranchMgmtRow) => ({
                value: b.id,
                label: `${b.name}${b.code ? ` (${b.code})` : ''}`,
              }))}
            />
            {canWrite ? (
              <Button
                disabled={selectedRowKeys.length === 0}
                onClick={() => setAssignOpen(true)}
              >
                Filialga biriktirish
              </Button>
            ) : null}
            {canDelete ? (
              <Button danger onClick={() => setBulkDeleteOpen(true)}>
                O‘chirish
              </Button>
            ) : null}
            {canWrite ? (
              <Button
                type="primary"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setAddOpen(true)}
                className="!bg-teal-500 !border-teal-500 hover:!bg-teal-400"
              >
                Yangi blok
              </Button>
            ) : null}
          </Space>
        </div>
        <Table<BlockRow>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredBlocks}
          rowSelection={
            canDelete
              ? {
                  selectedRowKeys,
                  onChange: (keys) => setSelectedRowKeys(keys as string[]),
                }
              : undefined
          }
          pagination={{ pageSize: 12 }}
          expandable={{
            expandedRowKeys: expandedBlockKeys,
            onExpandedRowsChange: (keys) =>
              setExpandedBlockKeys(keys as string[]),
            expandedRowRender: (record) => (
              <BlockHierarchyPanel
                blockId={record.id}
                visible={expandedBlockKeys.includes(record.id)}
                canFloorRead={canFloorRead}
                canFloorWrite={canFloorWrite}
                canFloorDelete={canFloorDelete}
                canAptRead={canAptRead}
                canAptWrite={canAptWrite}
                canAptDelete={canAptDelete}
              />
            ),
          }}
        />
      </Card>

      <Modal
        title="Yangi blok"
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onOk={() => void submitCreate()}
        okText="Saqlash"
        confirmLoading={create.isPending}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="branchId"
            label="Filial"
            rules={[{ required: true, message: 'Tanlang' }]}
          >
            <Select
              placeholder="Filial"
              options={branches.map((b: BranchMgmtRow) => ({
                value: b.id,
                label: `${b.name}${b.code ? ` (${b.code})` : ''}`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="code"
            label="Kod"
            rules={[{ required: true, message: 'Kod kiriting' }]}
          >
            <Input placeholder="A" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Nomi"
            rules={[{ required: true, message: 'Nom kiriting' }]}
          >
            <Input placeholder="A bloki" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Blokni tahrirlash"
        open={!!editRow}
        onCancel={() => setEditRow(null)}
        onOk={() => void submitEdit()}
        okText="Saqlash"
        confirmLoading={patch.isPending}
      >
        <Form form={editForm} layout="vertical" className="mt-4">
          <Form.Item
            name="code"
            label="Kod"
            rules={[{ required: true, message: 'Kod kiriting' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="Nomi"
            rules={[{ required: true, message: 'Nom kiriting' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Blokni nusxalash"
        open={!!dupSource}
        onCancel={() => {
          setDupSource(null);
          dupForm.resetFields();
        }}
        onOk={() => void submitDuplicate()}
        okText="Nusxalash"
        confirmLoading={duplicate.isPending}
      >
        <Text type="secondary" className="mb-2 block text-sm">
          Qavatlar va kvartiralar ko‘chadi. Kod bo‘sh bo‘lsa, avtomatik
          (masalan {dupSource ? `${dupSource.code}-copy` : '…'}) beriladi.
        </Text>
        <Form form={dupForm} layout="vertical" className="mt-2">
          <Form.Item
            name="name"
            label="Yangi blok nomi"
            rules={[{ required: true, message: 'Nom kiriting' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Kod (ixtiyoriy)">
            <Input placeholder="Bo‘sh qoldiring — avtomatik" />
          </Form.Item>
        </Form>
      </Modal>

      <BulkDeleteConfirmModal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        entityLabel="Bloklar"
        selectedCount={selectedRowKeys.length}
        scopeDescription={
          branchFilter
            ? 'Tanlangan filialdagi barcha bloklar (API bilan bir xil branchId doirasi).'
            : 'Ruxsatingiz bo‘lgan barcha filiallardagi bloklar (joriy jadval filtri emas).'
        }
        onConfirm={runBulkDeleteBlocks}
      />

      <Modal
        title="Bloklarni filialga biriktirish"
        open={assignOpen}
        onCancel={() => {
          setAssignOpen(false);
          setAssignBranchId('');
        }}
        onOk={() => void runAssignBranch()}
        okText="Birikitrish"
        confirmLoading={bulkAssignBranch.isPending}
        okButtonProps={{ disabled: !assignBranchId || selectedRowKeys.length === 0 }}
      >
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Tanlangan: {selectedRowKeys.length} ta blok
        </div>
        <div className="mt-4">
          <div className="mb-2 text-sm font-medium text-slate-900 dark:text-white">
            Filial
          </div>
          <Select
            placeholder="Filialni tanlang"
            value={assignBranchId || undefined}
            onChange={(v) => setAssignBranchId(v)}
            style={{ width: '100%' }}
            options={branches.map((b: BranchMgmtRow) => ({
              value: b.id,
              label: `${b.name}${b.code ? ` (${b.code})` : ''}`,
            }))}
          />
        </div>
      </Modal>
    </div>
  );
}
