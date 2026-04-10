'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BulkDeleteConfirmModal,
  type BulkDeleteChoice,
} from '@/components/BulkDeleteConfirmModal';
import { Home, Pencil, Plus, Trash2 } from 'lucide-react';
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
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ApartmentWithContext } from '@/api/salesInventory';
import {
  useApartmentMutations,
  useSalesInventoryQuery,
} from '@/hooks/api/crmHooks';
import { can, refreshAuthMe } from '@/lib/permissions';
import { connectCrmRealtime } from '@/lib/realtime';
import { getSessionUser } from '@/lib/sessionUser';

const { Title } = Typography;

type AptRow = ApartmentWithContext;

const STATUS_UZ: Record<string, string> = {
  for_sale: 'Sotuvda',
  sold: 'Sotilgan',
  reserved: 'Bron',
  not_for_sale: 'Sotuv uchun emas',
};

const STATUS_COLOR: Record<string, string> = {
  for_sale: 'cyan',
  sold: 'green',
  reserved: 'blue',
  not_for_sale: 'default',
};

export default function ApartmentsPage() {
  const user = getSessionUser();
  const perms = user?.effectivePermissions;
  const canRead = can(perms, user?.role, 'apartments.read');
  const canWrite = can(perms, user?.role, 'apartments.write');
  const canDelete = can(perms, user?.role, 'apartments.delete');
  const canPresence = can(perms, user?.role, 'apartments.presence');

  useEffect(() => {
    void refreshAuthMe();
  }, []);

  const { data: inventory, isLoading: loading } = useSalesInventoryQuery(
    canRead,
  );
  const blocks = useMemo(
    () => inventory?.blocks ?? [],
    [inventory?.blocks],
  );
  const floors = useMemo(
    () => inventory?.floors ?? [],
    [inventory?.floors],
  );
  const apartments = useMemo(
    () => inventory?.apartments ?? [],
    [inventory?.apartments],
  );

  const { create, patch, remove, bulkRemove } = useApartmentMutations();

  const [floorFilter, setFloorFilter] = useState<string | undefined>();
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<AptRow | null>(null);
  const [form] = Form.useForm<{
    floorId: string;
    number: string;
    status?: string;
    areaSqm?: number;
    rooms?: number;
    priceTotal?: number;
    pricePerSqm?: number;
  }>();
  const [editForm] = Form.useForm<{
    number: string;
    status?: string;
    areaSqm?: number | null;
    rooms?: number | null;
    priceTotal?: number | null;
    pricePerSqm?: number | null;
  }>();
  const [presenceViewers, setPresenceViewers] = useState<
    { userId: string; fullName: string | null; phase: string }[]
  >([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const runBulkDeleteApartments = async (choice: BulkDeleteChoice) => {
    try {
      if (choice === 'selected') {
        await bulkRemove.mutateAsync({ ids: selectedRowKeys });
      } else {
        await bulkRemove.mutateAsync({
          deleteAllInScope: true,
          ...(floorFilter ? { floorId: floorFilter } : {}),
        });
      }
      message.success('O‘chirildi');
      setSelectedRowKeys([]);
    } catch {
      message.error('O‘chirishda xatolik');
    }
  };

  useEffect(() => {
    if (!editRow || !canPresence) {
      setPresenceViewers([]);
      return;
    }
    const branchId = user?.branchId ?? blocks[0]?.branchId;
    const token = localStorage.getItem('token');
    if (!branchId || !token) {
      return;
    }
    const s = connectCrmRealtime(branchId, token);
    const onPres = (p: {
      apartmentId: string;
      viewers: { userId: string; fullName: string | null; phase: string }[];
    }) => {
      if (p.apartmentId === editRow.id) {
        setPresenceViewers(p.viewers);
      }
    };
    s.on('apartment.presence', onPres);
    const enter = () => {
      s.emit('apartment.enter', {
        apartmentId: editRow.id,
        phase: 'editing',
      });
    };
    s.on('connect', enter);
    if (s.connected) {
      enter();
    }
    return () => {
      s.emit('apartment.leave', { apartmentId: editRow.id });
      s.off('apartment.presence', onPres);
      s.off('connect', enter);
      s.disconnect();
    };
  }, [editRow, canPresence, user?.branchId, blocks]);

  const filtered = useMemo(() => {
    if (!floorFilter) {
      return apartments;
    }
    return apartments.filter((a) => a.floorId === floorFilter);
  }, [apartments, floorFilter]);

  const floorLabel = (id: string) => {
    const f = floors.find((x) => x.id === id);
    if (!f) {
      return id;
    }
    const bc = f.block?.code ?? '';
    return `${f.block?.name ?? ''} ${bc ? `(${bc}) ` : ''}${f.level}-qavat`;
  };

  const submitCreate = async () => {
    const v = await form.validateFields();
    try {
      await create.mutateAsync({
        floorId: v.floorId,
        number: v.number,
        status: v.status,
        areaSqm: v.areaSqm,
        rooms: v.rooms,
        priceTotal: v.priceTotal,
        pricePerSqm: v.pricePerSqm,
      });
      message.success('Kvartira qo‘shildi');
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
          number: v.number,
          status: v.status,
          areaSqm:
            v.areaSqm === null || v.areaSqm === undefined ? null : v.areaSqm,
          rooms: v.rooms === null || v.rooms === undefined ? null : v.rooms,
          priceTotal:
            v.priceTotal === null || v.priceTotal === undefined
              ? null
              : v.priceTotal,
          pricePerSqm:
            v.pricePerSqm === null || v.pricePerSqm === undefined
              ? null
              : v.pricePerSqm,
        },
      });
      message.success('Yangilandi');
      setEditRow(null);
    } catch {
      message.error('Yangilashda xatolik');
    }
  };

  const columns: ColumnsType<AptRow> = [
    {
      title: 'Raqam',
      dataIndex: 'number',
      key: 'number',
      render: (n: string) => (
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-teal-500" />
          <span className="font-medium text-slate-900 dark:text-white">{n}</span>
        </div>
      ),
    },
    {
      title: 'Qavat',
      key: 'fl',
      render: (_, r) => floorLabel(r.floorId),
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <Tag color={STATUS_COLOR[s] ?? 'default'}>
          {STATUS_UZ[s] ?? s}
        </Tag>
      ),
    },
    {
      title: 'm²',
      dataIndex: 'areaSqm',
      key: 'areaSqm',
      render: (v: string | null) => v ?? '—',
    },
    {
      title: 'Xonalar',
      dataIndex: 'rooms',
      key: 'rooms',
      render: (v: number | null) => v ?? '—',
    },
    {
      title: 'Narx',
      dataIndex: 'priceTotal',
      key: 'priceTotal',
      width: 100,
      render: (v: string | null) =>
        v != null && v !== '' ? Number(v).toLocaleString('uz-UZ') : '—',
    },
    {
      title: 'm² narx',
      dataIndex: 'pricePerSqm',
      key: 'pricePerSqm',
      width: 90,
      render: (v: string | null) =>
        v != null && v !== '' ? Number(v).toLocaleString('uz-UZ') : '—',
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
                  number: r.number,
                  status: r.status,
                  areaSqm: r.areaSqm ? parseFloat(r.areaSqm) : undefined,
                  rooms: r.rooms ?? undefined,
                  priceTotal: r.priceTotal
                    ? parseFloat(r.priceTotal)
                    : undefined,
                  pricePerSqm: r.pricePerSqm
                    ? parseFloat(r.pricePerSqm)
                    : undefined,
                });
              }}
            />
          ) : null}
          {canDelete ? (
            <Popconfirm
              title="Kvartirani o‘chirish?"
              onConfirm={async () => {
                try {
                  await remove.mutateAsync(r.id);
                  message.success('O‘chirildi');
                } catch {
                  message.error('Shartnoma bog‘langan — o‘chirib bo‘lmaydi');
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
        Kvartiralar bo‘limiga ruxsat yo‘q.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2">
      <Card className="border-slate-200 dark:border-zinc-800 dark:bg-zinc-950/60">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Title level={4} className="!mb-0 !text-slate-900 dark:!text-white">
            Kvartiralar
          </Title>
          <Space wrap>
            <Select
              allowClear
              placeholder="Qavat bo‘yicha"
              style={{ minWidth: 220 }}
              value={floorFilter}
              onChange={(v) => {
                setFloorFilter(v);
                setSelectedRowKeys([]);
              }}
              options={floors.map((f) => ({
                value: f.id,
                label: floorLabel(f.id),
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
                Yangi kvartira
              </Button>
            ) : null}
          </Space>
        </div>
        <Table<AptRow>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filtered}
          rowSelection={
            canDelete
              ? {
                  selectedRowKeys,
                  onChange: (keys) => setSelectedRowKeys(keys as string[]),
                }
              : undefined
          }
          pagination={{ pageSize: 15 }}
        />
      </Card>

      <Modal
        title="Yangi kvartira"
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onOk={() => void submitCreate()}
        okText="Saqlash"
        confirmLoading={create.isPending}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="floorId"
            label="Qavat"
            rules={[{ required: true, message: 'Tanlang' }]}
          >
            <Select
              options={floors.map((f) => ({
                value: f.id,
                label: floorLabel(f.id),
              }))}
            />
          </Form.Item>
          <Form.Item
            name="number"
            label="Kvartira raqami"
            rules={[{ required: true, message: 'Kiriting' }]}
          >
            <Input placeholder="12" />
          </Form.Item>
          <Form.Item name="status" label="Holat" initialValue="for_sale">
            <Select
              options={[
                { value: 'for_sale', label: 'Sotuvda' },
                { value: 'reserved', label: 'Bron' },
                { value: 'sold', label: 'Sotilgan' },
                { value: 'not_for_sale', label: 'Sotuv uchun emas' },
              ]}
            />
          </Form.Item>
          <Form.Item name="areaSqm" label="Maydon (m²)">
            <InputNumber className="!w-full" min={0} step={0.01} />
          </Form.Item>
          <Form.Item name="rooms" label="Xonalar soni">
            <InputNumber className="!w-full" min={0} />
          </Form.Item>
          <Form.Item name="priceTotal" label="Umumiy narx">
            <InputNumber className="!w-full" min={0} step={1000} />
          </Form.Item>
          <Form.Item name="pricePerSqm" label="m² narxi">
            <InputNumber className="!w-full" min={0} step={0.01} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Kvartirani tahrirlash"
        open={!!editRow}
        onCancel={() => setEditRow(null)}
        onOk={() => void submitEdit()}
        okText="Saqlash"
        confirmLoading={patch.isPending}
      >
        {canPresence && presenceViewers.length > 0 ? (
          <div className="mb-3 rounded-lg border border-teal-500/30 bg-teal-950/20 px-3 py-2 text-sm text-teal-200">
            Hozir ko‘rayapti:{' '}
            {presenceViewers
              .map((v) => v.fullName || v.userId.slice(0, 8))
              .join(', ')}
          </div>
        ) : null}
        <Form form={editForm} layout="vertical" className="mt-4">
          <Form.Item
            name="number"
            label="Raqam"
            rules={[{ required: true, message: 'Kiriting' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Holat">
            <Select
              options={[
                { value: 'for_sale', label: 'Sotuvda' },
                { value: 'reserved', label: 'Bron' },
                { value: 'sold', label: 'Sotilgan' },
                { value: 'not_for_sale', label: 'Sotuv uchun emas' },
              ]}
            />
          </Form.Item>
          <Form.Item name="areaSqm" label="Maydon (m²)">
            <InputNumber className="!w-full" min={0} step={0.01} />
          </Form.Item>
          <Form.Item name="rooms" label="Xonalar soni">
            <InputNumber className="!w-full" min={0} />
          </Form.Item>
          <Form.Item name="priceTotal" label="Umumiy narx">
            <InputNumber className="!w-full" min={0} step={1000} />
          </Form.Item>
          <Form.Item name="pricePerSqm" label="m² narxi">
            <InputNumber className="!w-full" min={0} step={0.01} />
          </Form.Item>
        </Form>
      </Modal>

      <BulkDeleteConfirmModal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        entityLabel="Kvartiralar"
        selectedCount={selectedRowKeys.length}
        scopeDescription={
          floorFilter
            ? 'Tanlangan qavatdagi barcha kvartiralar (shartnomasi bo‘lmaganlar o‘chadi; qolganlari tashlab yuboriladi).'
            : 'Ruxsatingizdagi barcha kvartiralar (xuddi shu qoida; API doirasi joriy filtr emas).'
        }
        onConfirm={runBulkDeleteApartments}
      />
    </div>
  );
}
