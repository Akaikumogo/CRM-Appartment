'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BulkDeleteConfirmModal,
  type BulkDeleteChoice,
} from '@/components/BulkDeleteConfirmModal';
import { Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { BlockRow } from '@/api/blocks';
import type { FloorRow } from '@/api/floors';
import {
  useBlocksQuery,
  useFloorMutations,
  useFloorsQuery,
} from '@/hooks/api/crmHooks';
import { can, refreshAuthMe } from '@/lib/permissions';
import { getSessionUser } from '@/lib/sessionUser';

const { Title, Text } = Typography;

export default function FloorsPage() {
  const user = getSessionUser();
  const perms = user?.effectivePermissions;
  const canRead = can(perms, user?.role, 'floors.read');
  const canWrite = can(perms, user?.role, 'floors.write');
  const canDelete = can(perms, user?.role, 'floors.delete');

  useEffect(() => {
    void refreshAuthMe();
  }, []);

  const { data: blocks = [], isLoading: blocksLoading } = useBlocksQuery(true);
  const { data: floors = [], isLoading: floorsLoading } = useFloorsQuery(
    undefined,
    canRead,
  );
  const { create, patch, remove, bulkRemove } = useFloorMutations();

  const [blockFilter, setBlockFilter] = useState<string | undefined>();
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<FloorRow | null>(null);
  const [form] = Form.useForm<{
    blockId: string;
    level: number;
    name?: string;
  }>();
  const [editForm] = Form.useForm<{
    level: number;
    name?: string;
  }>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const loading = blocksLoading || floorsLoading;

  const runBulkDeleteFloors = async (choice: BulkDeleteChoice) => {
    try {
      if (choice === 'selected') {
        await bulkRemove.mutateAsync({ ids: selectedRowKeys });
      } else {
        await bulkRemove.mutateAsync({
          deleteAllInScope: true,
          ...(blockFilter ? { blockId: blockFilter } : {}),
        });
      }
      message.success('O‘chirildi');
      setSelectedRowKeys([]);
    } catch {
      message.error('O‘chirishda xatolik');
    }
  };

  const filteredFloors = useMemo(() => {
    if (!blockFilter) {
      return floors;
    }
    return floors.filter((f) => f.blockId === blockFilter);
  }, [floors, blockFilter]);

  const blockLabel = (id: string) => {
    const b = blocks.find((x) => x.id === id);
    return b ? `${b.name} (${b.code})` : id;
  };

  const submitCreate = async () => {
    const v = await form.validateFields();
    try {
      await create.mutateAsync({
        blockId: v.blockId,
        level: v.level,
        name: v.name || undefined,
      });
      message.success('Qavat qo‘shildi');
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
      await patch.mutateAsync({
        id: editRow.id,
        body: {
          level: v.level,
          name: v.name ?? null,
        },
      });
      message.success('Yangilandi');
      setEditRow(null);
    } catch {
      message.error('Yangilashda xatolik');
    }
  };

  const columns: ColumnsType<FloorRow> = [
    {
      title: 'Qavat',
      key: 'lv',
      render: (_, r) => (
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-teal-500" />
          <div>
            <div className="font-medium text-slate-900 dark:text-white">
              {r.level}-qavat
            </div>
            {r.name ? (
              <Text type="secondary" className="text-xs">
                {r.name}
              </Text>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      title: 'Blok',
      key: 'b',
      render: (_, r) => r.block?.name ?? blockLabel(r.blockId),
    },
    {
      title: 'Amallar',
      key: 'a',
      width: 160,
      render: (_, r) => (
        <Space>
          {canWrite ? (
            <Button
              type="text"
              icon={<Pencil className="h-4 w-4" />}
              onClick={() => {
                setEditRow(r);
                editForm.setFieldsValue({
                  level: r.level,
                  name: r.name ?? undefined,
                });
              }}
            />
          ) : null}
          {canDelete ? (
            <Popconfirm
              title="Qavatni o‘chirish?"
              onConfirm={async () => {
                try {
                  await remove.mutateAsync(r.id);
                  message.success('O‘chirildi');
                } catch {
                  message.error('O‘chirish mumkin emas');
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
        Qavatlar bo‘limiga ruxsat yo‘q.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2">
      <Card className="border-slate-200 dark:border-zinc-800 dark:bg-zinc-950/60">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Title level={4} className="!mb-0 !text-slate-900 dark:!text-white">
            Qavatlar
          </Title>
          <Space wrap>
            <Select
              allowClear
              placeholder="Blok bo‘yicha"
              style={{ minWidth: 200 }}
              value={blockFilter}
              onChange={(v) => {
                setBlockFilter(v);
                setSelectedRowKeys([]);
              }}
              options={blocks.map((b: BlockRow) => ({
                value: b.id,
                label: `${b.name} (${b.code})`,
              }))}
            />
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
                Yangi qavat
              </Button>
            ) : null}
          </Space>
        </div>
        <Table<FloorRow>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredFloors}
          rowSelection={
            canDelete
              ? {
                  selectedRowKeys,
                  onChange: (keys) => setSelectedRowKeys(keys as string[]),
                }
              : undefined
          }
          pagination={{ pageSize: 12 }}
        />
      </Card>

      <Modal
        title="Yangi qavat"
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onOk={() => void submitCreate()}
        okText="Saqlash"
        confirmLoading={create.isPending}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="blockId"
            label="Blok"
            rules={[{ required: true, message: 'Tanlang' }]}
          >
            <Select
              options={blocks.map((b: BlockRow) => ({
                value: b.id,
                label: `${b.name} (${b.code})`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="level"
            label="Qavat raqami"
            rules={[{ required: true, message: 'Raqam kiriting' }]}
          >
            <InputNumber className="!w-full" min={0} />
          </Form.Item>
          <Form.Item name="name" label="Nom (ixtiyoriy)">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Qavatni tahrirlash"
        open={!!editRow}
        onCancel={() => setEditRow(null)}
        onOk={() => void submitEdit()}
        okText="Saqlash"
        confirmLoading={patch.isPending}
      >
        <Form form={editForm} layout="vertical" className="mt-4">
          <Form.Item
            name="level"
            label="Qavat raqami"
            rules={[{ required: true, message: 'Raqam kiriting' }]}
          >
            <InputNumber className="!w-full" min={0} />
          </Form.Item>
          <Form.Item name="name" label="Nom (ixtiyoriy)">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <BulkDeleteConfirmModal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        entityLabel="Qavatlar"
        selectedCount={selectedRowKeys.length}
        scopeDescription={
          blockFilter
            ? 'Tanlangan blokdagi barcha qavatlar (API blockId bilan bir xil).'
            : 'Ruxsatingizdagi barcha qavatlar (joriy jadval filtri emas).'
        }
        onConfirm={runBulkDeleteFloors}
      />
    </div>
  );
}
