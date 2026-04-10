'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, Home, Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Popover,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ApartmentRow } from '@/api/apartments';
import type { FloorRow } from '@/api/floors';
import {
  useApartmentMutations,
  useFloorMutations,
  useFloorsQuery,
} from '@/hooks/api/crmHooks';

const { Text } = Typography;

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

export type BlockHierarchyPanelProps = {
  blockId: string;
  visible: boolean;
  canFloorRead: boolean;
  canFloorWrite: boolean;
  canFloorDelete: boolean;
  canAptRead: boolean;
  canAptWrite: boolean;
  canAptDelete: boolean;
};

export function BlockHierarchyPanel({
  blockId,
  visible,
  canFloorRead,
  canFloorWrite,
  canFloorDelete,
  canAptRead,
  canAptWrite,
  canAptDelete,
}: BlockHierarchyPanelProps) {
  const { data: floors = [], isLoading } = useFloorsQuery(
    blockId,
    visible && canFloorRead,
  );

  const floorCreate = useFloorMutations();
  const aptMut = useApartmentMutations();

  const [floorExpanded, setFloorExpanded] = useState<string[]>([]);

  const [addFloorOpen, setAddFloorOpen] = useState(false);
  const [floorForm] = Form.useForm<{ level: number; name?: string }>();
  const [editFloor, setEditFloor] = useState<FloorRow | null>(null);
  const [editFloorForm] = Form.useForm<{ level: number; name?: string }>();

  const [addAptOpen, setAddAptOpen] = useState(false);
  const [addAptFloorId, setAddAptFloorId] = useState<string | null>(null);
  const [aptForm] = Form.useForm<{
    number: string;
    status?: string;
    areaSqm?: number;
    rooms?: number;
    priceTotal?: number;
    pricePerSqm?: number;
  }>();

  const [editApt, setEditApt] = useState<ApartmentRow | null>(null);
  const [editAptForm] = Form.useForm<{
    number: string;
    status?: string;
    areaSqm?: number | null;
    rooms?: number | null;
    priceTotal?: number | null;
    pricePerSqm?: number | null;
  }>();

  const [dupTargetFloor, setDupTargetFloor] = useState<FloorRow | null>(null);
  const [dupFromId, setDupFromId] = useState<string | undefined>();
  const [dupMultiplier, setDupMultiplier] = useState(100);

  const [bulkQuickFloor, setBulkQuickFloor] = useState<FloorRow | null>(null);
  const [bulkQuickCount, setBulkQuickCount] = useState(5);

  useEffect(() => {
    if (!visible) {
      setFloorExpanded([]);
      setDupTargetFloor(null);
      setBulkQuickFloor(null);
    }
  }, [visible]);

  useEffect(() => {
    setDupFromId(undefined);
    setDupMultiplier(100);
  }, [dupTargetFloor?.id]);

  useEffect(() => {
    setBulkQuickCount(5);
  }, [bulkQuickFloor?.id]);

  const sortedFloors = useMemo(
    () => [...floors].sort((a, b) => a.level - b.level),
    [floors],
  );

  const submitAddFloor = async () => {
    const v = await floorForm.validateFields();
    try {
      await floorCreate.create.mutateAsync({
        blockId,
        level: v.level,
        name: v.name || undefined,
      });
      message.success('Qavat qo‘shildi');
      setAddFloorOpen(false);
      floorForm.resetFields();
    } catch {
      message.error('Saqlashda xatolik');
    }
  };

  const submitEditFloor = async () => {
    if (!editFloor) {
      return;
    }
    const v = await editFloorForm.validateFields();
    try {
      await floorCreate.patch.mutateAsync({
        id: editFloor.id,
        body: { level: v.level, name: v.name ?? null },
      });
      message.success('Yangilandi');
      setEditFloor(null);
    } catch {
      message.error('Xatolik');
    }
  };

  const openAddApartment = (floorId: string) => {
    setAddAptFloorId(floorId);
    aptForm.resetFields();
    aptForm.setFieldsValue({ status: 'for_sale' });
    setAddAptOpen(true);
  };

  const submitAddApt = async () => {
    if (!addAptFloorId) {
      return;
    }
    const v = await aptForm.validateFields();
    try {
      await aptMut.create.mutateAsync({
        floorId: addAptFloorId,
        number: v.number,
        status: v.status,
        areaSqm: v.areaSqm,
        rooms: v.rooms,
        priceTotal: v.priceTotal,
        pricePerSqm: v.pricePerSqm,
      });
      message.success('Kvartira qo‘shildi');
      setAddAptOpen(false);
      setAddAptFloorId(null);
    } catch {
      message.error('Saqlashda xatolik');
    }
  };

  const submitEditApt = async () => {
    if (!editApt) {
      return;
    }
    const v = await editAptForm.validateFields();
    try {
      await aptMut.patch.mutateAsync({
        id: editApt.id,
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
      setEditApt(null);
    } catch {
      message.error('Xatolik');
    }
  };

  const submitDuplicateToCurrent = async () => {
    if (!dupTargetFloor || !dupFromId) {
      message.warning('Manba qavatni tanlang');
      return;
    }
    try {
      const r = await aptMut.copyFromFloor.mutateAsync({
        sourceFloorId: dupFromId,
        targetFloorIds: [dupTargetFloor.id],
        levelMultiplier: dupMultiplier,
      });
      message.success(
        `Yaratildi: ${r.created}. O‘tkazib yuborildi (raqam emas): ${r.skippedNonNumeric}, band: ${r.skippedConflict}`,
      );
      setDupTargetFloor(null);
    } catch {
      message.error('Nusxalashda xatolik');
    }
  };

  const submitBulkQuick = async () => {
    if (!bulkQuickFloor) {
      return;
    }
    const n = bulkQuickCount ?? 0;
    if (n < 1 || n > 200) {
      message.warning('1–200 orasida kiriting');
      return;
    }
    try {
      const r = await aptMut.bulkCreateOnFloor.mutateAsync({
        floorId: bulkQuickFloor.id,
        count: n,
      });
      message.success(`Qo‘shildi: ${r.created}`);
      setBulkQuickFloor(null);
    } catch {
      message.error('Qo‘shishda xatolik');
    }
  };

  const apartmentColumns: ColumnsType<ApartmentRow> = [
    {
      title: 'Raqam',
      dataIndex: 'number',
      width: 90,
      render: (n: string) => (
        <span className="font-medium text-slate-900 dark:text-white">{n}</span>
      ),
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      width: 110,
      render: (s: string) => (
        <Tag color={STATUS_COLOR[s] ?? 'default'}>{STATUS_UZ[s] ?? s}</Tag>
      ),
    },
    { title: 'm²', dataIndex: 'areaSqm', width: 64, render: (v) => v ?? '—' },
    {
      title: 'Xonalar',
      dataIndex: 'rooms',
      width: 72,
      render: (v: number | null) => v ?? '—',
    },
    {
      title: 'Narx',
      dataIndex: 'priceTotal',
      width: 88,
      render: (v: string | null) =>
        v != null && v !== '' ? Number(v).toLocaleString('uz-UZ') : '—',
    },
    {
      title: 'm² narx',
      dataIndex: 'pricePerSqm',
      width: 80,
      render: (v: string | null) =>
        v != null && v !== '' ? Number(v).toLocaleString('uz-UZ') : '—',
    },
    {
      title: '',
      key: 'a',
      width: 100,
      render: (_, r) => (
        <Space>
          {canAptWrite ? (
            <Button
              type="text"
              size="small"
              icon={<Pencil className="h-3.5 w-3.5" />}
              onClick={() => {
                setEditApt(r);
                editAptForm.setFieldsValue({
                  number: r.number,
                  status: r.status,
                  areaSqm: r.areaSqm ? parseFloat(String(r.areaSqm)) : undefined,
                  rooms: r.rooms ?? undefined,
                  priceTotal: r.priceTotal
                    ? parseFloat(String(r.priceTotal))
                    : undefined,
                  pricePerSqm: r.pricePerSqm
                    ? parseFloat(String(r.pricePerSqm))
                    : undefined,
                });
              }}
            />
          ) : null}
          {canAptDelete ? (
            <Popconfirm
              title="O‘chirish?"
              onConfirm={async () => {
                try {
                  await aptMut.remove.mutateAsync(r.id);
                  message.success('O‘chirildi');
                } catch {
                  message.error('Shartnoma bog‘langan bo‘lishi mumkin');
                }
              }}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<Trash2 className="h-3.5 w-3.5" />}
              />
            </Popconfirm>
          ) : null}
        </Space>
      ),
    },
  ];

  const floorColumns: ColumnsType<FloorRow> = [
    {
      title: 'Qavat',
      key: 'lv',
      width: 160,
      render: (_, r) => (
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-teal-500" />
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
      title: 'Kvartiralar',
      key: 'c',
      width: 100,
      render: (_, r) => (r.apartments?.length ?? 0),
    },
    {
      title: 'Amallar',
      key: 'act',
      width: 400,
      render: (_, r) => (
        <Space wrap size="small">
          {canAptWrite ? (
            <Button
              type="link"
              size="small"
              className="!px-0"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => openAddApartment(r.id)}
            >
              Kvartira
            </Button>
          ) : null}
          {canAptWrite ? (
            <Popover
              trigger="click"
              placement="bottomLeft"
              open={bulkQuickFloor?.id === r.id}
              onOpenChange={(open) => {
                if (open) {
                  setBulkQuickFloor(r);
                } else {
                  setBulkQuickFloor((cur) => (cur?.id === r.id ? null : cur));
                }
              }}
              content={
                <div className="min-w-[220px] space-y-3 py-1">
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <strong>{r.level}-qavat</strong> — nechta kvartira qo‘shish
                    (raqamlar avtomatik: mavjud max raqamdan keyin, holat:
                    sotuvda).
                  </div>
                  <InputNumber
                    className="!w-full"
                    min={1}
                    max={200}
                    value={bulkQuickCount}
                    onChange={(v) => setBulkQuickCount(v ?? 1)}
                  />
                  <Space className="flex w-full justify-end">
                    <Button
                      size="small"
                      onClick={() => setBulkQuickFloor(null)}
                    >
                      Bekor
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      loading={aptMut.bulkCreateOnFloor.isPending}
                      className="!bg-teal-600"
                      onClick={() => void submitBulkQuick()}
                    >
                      Qo‘shish
                    </Button>
                  </Space>
                </div>
              }
            >
              <Button type="link" size="small" className="!px-0">
                + N ta
              </Button>
            </Popover>
          ) : null}
          {canAptWrite ? (
            sortedFloors.length > 1 ? (
              <Popover
                trigger="click"
                placement="bottomLeft"
                open={dupTargetFloor?.id === r.id}
                onOpenChange={(open) => {
                  if (!open) {
                    setDupTargetFloor((cur) => (cur?.id === r.id ? null : cur));
                  }
                }}
                content={
                  <div className="min-w-[240px] space-y-3 py-1">
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      <strong>{r.level}-qavat</strong>ga nusxa — manba qavatni
                      tanlang (from → bu qavat).
                    </div>
                    <Select
                      className="w-full"
                      placeholder="Manba qavat"
                      value={dupFromId}
                      onChange={(v) => setDupFromId(v)}
                      options={sortedFloors
                        .filter((f) => f.id !== r.id)
                        .map((f) => ({
                          value: f.id,
                          label: `${f.level}-qavat${f.name ? ` (${f.name})` : ''}`,
                        }))}
                    />
                    <div>
                      <div className="mb-1 text-xs text-slate-500">
                        Ko‘paytiruvchi (etaj farqi)
                      </div>
                      <InputNumber
                        className="!w-full"
                        min={1}
                        max={100000}
                        value={dupMultiplier}
                        onChange={(v) => setDupMultiplier(v ?? 100)}
                      />
                    </div>
                    <Space className="flex w-full justify-end">
                      <Button
                        size="small"
                        onClick={() => setDupTargetFloor(null)}
                      >
                        Bekor
                      </Button>
                      <Button
                        type="primary"
                        size="small"
                        loading={aptMut.copyFromFloor.isPending}
                        className="!bg-teal-600"
                        onClick={() => void submitDuplicateToCurrent()}
                      >
                        OK
                      </Button>
                    </Space>
                  </div>
                }
              >
                <Button
                  type="link"
                  size="small"
                  className="!px-0"
                  icon={<Copy className="h-3.5 w-3.5" />}
                  onClick={() => setDupTargetFloor(r)}
                >
                  Dublikat
                </Button>
              </Popover>
            ) : (
              <Tooltip
                title="Nusxalash uchun blokda kamida 2 ta qavat bo‘lishi kerak. Yuqoridagi «Qavat» tugmasi bilan yana bitta qavat qo‘shing."
                placement="topLeft"
              >
                <span className="inline-flex">
                  <Button
                    type="link"
                    size="small"
                    className="!px-0 opacity-60"
                    disabled
                    icon={<Copy className="h-3.5 w-3.5" />}
                  >
                    Dublikat
                  </Button>
                </span>
              </Tooltip>
            )
          ) : null}
          {canFloorWrite ? (
            <Button
              type="text"
              size="small"
              icon={<Pencil className="h-3.5 w-3.5" />}
              onClick={() => {
                setEditFloor(r);
                editFloorForm.setFieldsValue({
                  level: r.level,
                  name: r.name ?? undefined,
                });
              }}
            />
          ) : null}
          {canFloorDelete ? (
            <Popconfirm
              title="Qavatni o‘chirish?"
              description="Barcha kvartiralar ham o‘chadi (shartnomasiz)."
              onConfirm={async () => {
                try {
                  await floorCreate.remove.mutateAsync(r.id);
                  message.success('O‘chirildi');
                } catch {
                  message.error('O‘chirib bo‘lmadi');
                }
              }}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<Trash2 className="h-3.5 w-3.5" />}
              />
            </Popconfirm>
          ) : null}
        </Space>
      ),
    },
  ];

  if (!canFloorRead) {
    return (
      <div className="rounded-lg border border-dashed border-slate-600 p-4 text-sm text-slate-500">
        Qavatlarni ko‘rish uchun «floors.read» kerak.
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-zinc-900/50">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <Text className="text-slate-600 dark:text-slate-400">
          Blok ichidagi qavatlar va kvartiralar
        </Text>
        {canFloorWrite ? (
          <Button
            type="primary"
            size="small"
            className="!bg-teal-600 !border-teal-600"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => {
              floorForm.resetFields();
              setAddFloorOpen(true);
            }}
          >
            Qavat
          </Button>
        ) : null}
      </div>

      <Table<FloorRow>
        size="small"
        rowKey="id"
        loading={isLoading}
        columns={floorColumns}
        dataSource={sortedFloors}
        pagination={false}
        expandable={{
          expandedRowKeys: floorExpanded,
          onExpandedRowsChange: (keys) =>
            setFloorExpanded(keys as string[]),
          expandedRowRender: (floorRow) => {
            if (!canAptRead) {
              return (
                <div className="py-2 text-xs text-slate-500">
                  Kvartiralarni ko‘rish uchun «apartments.read» kerak.
                </div>
              );
            }
            const apts = floorRow.apartments ?? [];
            return (
              <div className="bg-white/90 py-2 pl-6 dark:bg-zinc-950/80">
                <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                  <Home className="h-3.5 w-3.5" />
                  {floorRow.level}-qavat kvartiralari
                </div>
                <Table<ApartmentRow>
                  size="small"
                  rowKey="id"
                  columns={apartmentColumns}
                  dataSource={apts}
                  pagination={false}
                  locale={{ emptyText: 'Kvartira yo‘q' }}
                />
              </div>
            );
          },
        }}
        locale={{ emptyText: 'Qavat yo‘q — yuqoridagi tugma bilan qo‘shing' }}
      />

      <Modal
        title="Yangi qavat"
        open={addFloorOpen}
        onCancel={() => setAddFloorOpen(false)}
        onOk={() => void submitAddFloor()}
        okText="Saqlash"
        confirmLoading={floorCreate.create.isPending}
      >
        <Form form={floorForm} layout="vertical" className="mt-2">
          <Form.Item
            name="level"
            label="Qavat raqami"
            rules={[{ required: true, message: 'Kiriting' }]}
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
        open={!!editFloor}
        onCancel={() => setEditFloor(null)}
        onOk={() => void submitEditFloor()}
        okText="Saqlash"
        confirmLoading={floorCreate.patch.isPending}
      >
        <Form form={editFloorForm} layout="vertical" className="mt-2">
          <Form.Item
            name="level"
            label="Qavat raqami"
            rules={[{ required: true, message: 'Kiriting' }]}
          >
            <InputNumber className="!w-full" min={0} />
          </Form.Item>
          <Form.Item name="name" label="Nom (ixtiyoriy)">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Yangi kvartira"
        open={addAptOpen}
        onCancel={() => {
          setAddAptOpen(false);
          setAddAptFloorId(null);
        }}
        onOk={() => void submitAddApt()}
        okText="Saqlash"
        confirmLoading={aptMut.create.isPending}
      >
        <Form form={aptForm} layout="vertical" className="mt-2">
          <Form.Item
            name="number"
            label="Raqam"
            rules={[{ required: true, message: 'Kiriting' }]}
          >
            <Input placeholder="Masalan 101" />
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
          <Form.Item name="rooms" label="Xonalar">
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
        open={!!editApt}
        onCancel={() => setEditApt(null)}
        onOk={() => void submitEditApt()}
        okText="Saqlash"
        confirmLoading={aptMut.patch.isPending}
      >
        <Form form={editAptForm} layout="vertical" className="mt-2">
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
          <Form.Item name="rooms" label="Xonalar">
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
    </div>
  );
}
