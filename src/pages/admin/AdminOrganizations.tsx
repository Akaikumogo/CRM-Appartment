import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { KeyRound, ShieldAlert, Building2, GitBranch } from 'lucide-react';
import { api } from '@/lib/api';
import { adminChangeUserPassword } from '@/api/users';

const MQTT_ENV_HINT =
  import.meta.env.VITE_MQTT_TOPIC_HINT ||
  'CRM .env da VITE_MQTT_TOPIC_HINT (ixtiyoriy)';

type Org = {
  id: string;
  name: string;
  isBlocked: boolean;
  isVip: boolean;
  paymentDueAt: string | null;
  blockedReason: string | null;
};

type Branch = {
  id: string;
  name: string;
  organizationId: string;
  code?: string | null;
  isVip?: boolean;
  isBlocked?: boolean;
};

type OrgUser = {
  id: string;
  email: string;
  fullName?: string | null;
  role: string;
  organizationId?: string | null;
};

type ResetTarget = {
  userId: string;
  label: string;
  context: string;
};

export default function AdminOrganizations() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [branchByOrgId, setBranchByOrgId] = useState<Record<string, Branch[]>>({});
  const [branchLoadingOrgId, setBranchLoadingOrgId] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<OrgUser[]>([]);

  const [orgCreateOpen, setOrgCreateOpen] = useState(false);
  const [branchCreateOpen, setBranchCreateOpen] = useState(false);
  const [branchCreateOrgId, setBranchCreateOrgId] = useState<string | null>(null);

  const [orgForm] = Form.useForm();
  const [branchForm] = Form.useForm();
  const [patchModal, setPatchModal] = useState<Org | null>(null);
  const [patchForm] = Form.useForm();
  const [branchEdit, setBranchEdit] = useState<Branch | null>(null);
  const [branchFormModal] = Form.useForm();

  // Password reset
  const [resetTarget, setResetTarget] = useState<ResetTarget | null>(null);
  const [resetForm] = Form.useForm();
  const [resetLoading, setResetLoading] = useState(false);

  const loadingRef = useRef(false);

  const loadOrgs = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const { data } = await api.get<Org[]>('/organizations');
      setOrgs(data);
    } catch {
      void message.error('Tashkilotlar yuklanmadi');
    } finally {
      loadingRef.current = false;
    }
  }, []);

  const loadAllUsers = useCallback(async () => {
    try {
      const { data } = await api.get<OrgUser[]>('/users');
      setAllUsers(data);
    } catch {
      // non-critical
    }
  }, []);

  const loadBranchesForOrg = useCallback(async (organizationId: string) => {
    setBranchLoadingOrgId(organizationId);
    try {
      const { data } = await api.get<Branch[]>(`/organizations/${organizationId}/branches`);
      setBranchByOrgId((m) => ({ ...m, [organizationId]: data }));
    } catch {
      void message.error('Filiallar yuklanmadi');
    } finally {
      setBranchLoadingOrgId(null);
    }
  }, []);

  useEffect(() => {
    void loadOrgs();
    void loadAllUsers();
  }, [loadOrgs, loadAllUsers]);

  const invalidateBranches = (organizationId: string) => {
    setBranchByOrgId((m) => {
      const next = { ...m };
      delete next[organizationId];
      return next;
    });
  };

  /** Org admini topadi (role === 'org_admin' AND organizationId match) */
  const findOrgAdmin = (orgId: string): OrgUser | null =>
    allUsers.find((u) => u.role === 'org_admin' && u.organizationId === orgId) ?? null;

  /** Filial xodimini topadi (role === 'staff' AND ...branchId kerak, lekin users da yo'q) */
  const findBranchStaff = (orgId: string): OrgUser[] =>
    allUsers.filter((u) => u.role === 'staff' && u.organizationId === orgId);

  const openResetForOrg = (org: Org) => {
    const admin = findOrgAdmin(org.id);
    if (!admin) {
      void message.warning(`"${org.name}" uchun org_admin topilmadi. Avval foydalanuvchi yarating.`);
      return;
    }
    setResetTarget({ userId: admin.id, label: admin.fullName || admin.email, context: `Tashkilot: ${org.name}` });
  };

  const openResetForBranch = (branch: Branch) => {
    const staffList = findBranchStaff(branch.organizationId);
    if (staffList.length === 0) {
      void message.warning(`"${branch.name}" filiali uchun staff topilmadi.`);
      return;
    }
    // If multiple — reset first one; in enterprise you'd pick from list
    const u = staffList[0];
    setResetTarget({ userId: u.id, label: u.fullName || u.email, context: `Filial: ${branch.name}` });
  };

  const handleReset = async (values: { newPassword: string }) => {
    if (!resetTarget) return;
    setResetLoading(true);
    try {
      await adminChangeUserPassword(resetTarget.userId, values.newPassword);
      void message.success(`"${resetTarget.label}" paroli yangilandi`);
      setResetTarget(null);
      resetForm.resetFields();
    } catch {
      void message.error('Parolni yangilab bo\'lmadi');
    } finally {
      setResetLoading(false);
    }
  };

  const branchColumns: ColumnsType<Branch> = [
    { title: 'Nomi', dataIndex: 'name' },
    {
      title: 'VIP',
      render: (_, r) => (r.isVip ? <Tag color="gold">VIP</Tag> : <Tag>—</Tag>),
    },
    {
      title: 'Holat',
      render: (_, r) =>
        r.isBlocked ? <Tag color="red">Blok</Tag> : <Tag color="green">Faol</Tag>,
    },
    {
      title: 'Xodim login',
      key: 'staffLogin',
      render: (_, r) => {
        const staffList = findBranchStaff(r.organizationId);
        if (staffList.length === 0) return <Typography.Text type="secondary" className="text-xs">—</Typography.Text>;
        return (
          <div className="space-y-0.5">
            {staffList.slice(0, 2).map((u) => (
              <div key={u.id}>
                <div className="text-xs font-medium text-slate-700 dark:text-slate-200">{u.email}</div>
                {u.fullName && <div className="text-[11px] text-slate-400">{u.fullName}</div>}
              </div>
            ))}
            {staffList.length > 2 && (
              <div className="text-[11px] text-slate-400">+{staffList.length - 2} ta</div>
            )}
          </div>
        );
      },
    },
    { title: 'ID', dataIndex: 'id', ellipsis: true },
    {
      title: 'Amallar',
      key: 'brAct',
      width: 260,
      render: (_, r) => (
        <Space size="small" wrap>
          <Tooltip title="Filial xodimi parolini tiklash">
            <Button
              type="text"
              size="small"
              icon={<KeyRound size={14} />}
              className="!text-amber-600 hover:!bg-amber-50 dark:hover:!bg-amber-900/20"
              onClick={() => openResetForBranch(r)}
            >
              Parol tiklash
            </Button>
          </Tooltip>
          <Button type="link" size="small" onClick={() => setBranchEdit(r)}>
            Sozlamalar
          </Button>
          <Popconfirm
            title="Filialni o'chirish?"
            description="Bloklar, qavatlar va kvartiralar ham o'chiriladi."
            okText="Ha, o'chirish"
            cancelText="Bekor"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              try {
                await api.delete(`/branches/${r.id}`);
                void message.success('Filial o\'chirildi');
                invalidateBranches(r.organizationId);
                await loadBranchesForOrg(r.organizationId);
              } catch {
                void message.error('O\'chirish mumkin emas');
              }
            }}
          >
            <Button type="link" danger size="small">
              O'chirish
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15">
            <Building2 size={20} className="text-amber-600" />
          </div>
          <div>
            <Typography.Title level={4} className="!mb-0">
              Tashkilotlar
            </Typography.Title>
            <Typography.Text type="secondary" className="text-xs">
              Barcha tashkilotlar va filiallarni boshqarish
            </Typography.Text>
          </div>
        </div>
        <Button
          type="primary"
          icon={<Building2 size={14} />}
          onClick={() => setOrgCreateOpen(true)}
          style={{ backgroundColor: '#f59e0b', border: 'none' }}
        >
          Yangi tashkilot
        </Button>
      </div>

      <Card
        className="!rounded-2xl !border-slate-200 dark:!border-slate-800"
        bodyStyle={{ padding: 0 }}
      >
        <Table<Org>
          rowKey="id"
          dataSource={orgs}
          pagination={{ pageSize: 15 }}
          className="rounded-2xl"
          columns={[
            {
              title: 'Nomi',
              dataIndex: 'name',
              render: (name: string) => (
                <span className="font-semibold text-slate-800 dark:text-white">{name}</span>
              ),
            },
            {
              title: 'VIP',
              render: (_, r) => (r.isVip ? <Tag color="gold">VIP</Tag> : <Tag>—</Tag>),
            },
            {
              title: 'Muddat',
              dataIndex: 'paymentDueAt',
              render: (v: string | null) => {
                if (!v) return '—';
                const expired = new Date(v) < new Date();
                return <Tag color={expired ? 'red' : 'blue'}>{dayjs(v).format('DD.MM.YYYY')}</Tag>;
              },
            },
            {
              title: 'Admin login',
              key: 'adminLogin',
              render: (_, r) => {
                const admin = findOrgAdmin(r.id);
                if (!admin) return <Typography.Text type="secondary" className="text-xs">—</Typography.Text>;
                return (
                  <div>
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-200">{admin.email}</div>
                    {admin.fullName && (
                      <div className="text-[11px] text-slate-400">{admin.fullName}</div>
                    )}
                  </div>
                );
              },
            },
            {
              title: 'Holat',
              render: (_, r) =>
                r.isBlocked ? (
                  <Tag color="red" icon={<ShieldAlert size={11} className="mr-1" />}>
                    Bloklangan
                  </Tag>
                ) : (
                  <Tag color="green">Faol</Tag>
                ),
            },
            {
              title: 'Amallar',
              key: 'orgAct',
              width: 280,
              render: (_, r) => (
                <Space size="small" wrap>
                  <Tooltip title="Org admin parolini tiklash (recovery)">
                    <Button
                      type="text"
                      size="small"
                      icon={<KeyRound size={14} />}
                      className="!text-amber-600 hover:!bg-amber-50 dark:hover:!bg-amber-900/20"
                      onClick={() => openResetForOrg(r)}
                    >
                      Parol tiklash
                    </Button>
                  </Tooltip>
                  <Button type="link" size="small" onClick={() => setPatchModal(r)}>
                    Tahrirlash
                  </Button>
                  <Popconfirm
                    title="Tashkilotni butunlay o'chirish?"
                    description="Barcha filiallar, mijozlar, shartnomalar va foydalanuvchilar o'chiriladi. Qaytarib bo'lmaydi."
                    okText="Ha, o'chirish"
                    cancelText="Bekor"
                    okButtonProps={{ danger: true }}
                    onConfirm={async () => {
                      try {
                        await api.delete(`/organizations/${r.id}`);
                        void message.success('Tashkilot o\'chirildi');
                        setBranchByOrgId((m) => {
                          const next = { ...m };
                          delete next[r.id];
                          return next;
                        });
                        await loadOrgs();
                      } catch {
                        void message.error('O\'chirish mumkin emas');
                      }
                    }}
                  >
                    <Button type="link" danger size="small">
                      O'chirish
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          expandable={{
            expandedRowRender: (org) => {
              const loading = branchLoadingOrgId === org.id;
              const list = branchByOrgId[org.id];
              return (
                <div className="border-l-2 border-amber-500/30 py-3 pl-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <GitBranch size={14} className="text-amber-600" />
                    <Typography.Text type="secondary" className="text-sm font-medium">
                      Filiallar
                    </Typography.Text>
                    <Button
                      size="small"
                      type="primary"
                      style={{ backgroundColor: '#f59e0b', border: 'none' }}
                      onClick={() => {
                        setBranchCreateOrgId(org.id);
                        setBranchCreateOpen(true);
                      }}
                    >
                      Yangi filial
                    </Button>
                  </div>
                  {loading && !list ? (
                    <Spin />
                  ) : (
                    <Table<Branch>
                      size="small"
                      rowKey="id"
                      dataSource={list ?? []}
                      columns={branchColumns}
                      pagination={false}
                    />
                  )}
                </div>
              );
            },
            onExpand: (expanded, org) => {
              if (expanded && !branchByOrgId[org.id]) {
                void loadBranchesForOrg(org.id);
              }
            },
          }}
        />
      </Card>

      {/* ===== Password Reset Modal ===== */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
              <KeyRound size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold">Parolni tiklash</p>
              {resetTarget && (
                <p className="text-xs font-normal text-slate-500">{resetTarget.context}</p>
              )}
            </div>
          </div>
        }
        open={!!resetTarget}
        onCancel={() => { setResetTarget(null); resetForm.resetFields(); }}
        onOk={() => resetForm.submit()}
        okText="Yangilash"
        cancelText="Bekor"
        confirmLoading={resetLoading}
        okButtonProps={{ style: { backgroundColor: '#f59e0b', border: 'none' } }}
        destroyOnClose
      >
        {resetTarget && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <strong>Foydalanuvchi:</strong> {resetTarget.label}
            </p>
            <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
              Bu amalni tasdiqlash orqali foydalanuvchi paroli o'zgartiriladi.
            </p>
          </div>
        )}
        <Form form={resetForm} layout="vertical" onFinish={handleReset}>
          <Form.Item
            name="newPassword"
            label="Yangi parol"
            rules={[{ required: true, min: 8, message: 'Kamida 8 belgi' }]}
          >
            <Input.Password placeholder="Yangi parol (kamida 8 belgi)" autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Parolni tasdiqlang"
            dependencies={['newPassword']}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('Parollar mos kelmadi'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Yangi parolni qayta kiriting" autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ===== Create Org Modal ===== */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-amber-500" />
            <span>Yangi tashkilot + admin akkaunt</span>
          </div>
        }
        open={orgCreateOpen}
        onCancel={() => { setOrgCreateOpen(false); orgForm.resetFields(); }}
        footer={null}
        destroyOnClose
        width={560}
      >
        <Form
          form={orgForm}
          layout="vertical"
          className="mt-2"
          onFinish={async (v: {
            name: string;
            adminEmail: string;
            adminPassword: string;
            adminFullName?: string;
          }) => {
            try {
              await api.post('/organizations', v);
              void message.success('Tashkilot yaratildi');
              orgForm.resetFields();
              setOrgCreateOpen(false);
              await loadOrgs();
              await loadAllUsers();
            } catch {
              void message.error('Xatolik (email band yoki validatsiya)');
            }
          }}
        >
          <Form.Item name="name" label="Tashkilot nomi" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="adminEmail" label="Admin email (login)" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="adminPassword" label="Admin parol (min 8)" rules={[{ required: true, min: 8 }]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="adminFullName" label="Admin ism familiya">
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" style={{ backgroundColor: '#f59e0b', border: 'none' }}>
            Yaratish
          </Button>
        </Form>
      </Modal>

      {/* ===== Edit Org Modal ===== */}
      <Modal
        title={patchModal?.name}
        open={!!patchModal}
        onCancel={() => { setPatchModal(null); patchForm.resetFields(); }}
        footer={null}
        destroyOnClose
        afterOpenChange={(open) => {
          if (open && patchModal) {
            patchForm.setFieldsValue({
              isBlocked: patchModal.isBlocked,
              blockedReason: patchModal.blockedReason ?? '',
              isVip: patchModal.isVip,
              paymentDue: patchModal.paymentDueAt ? dayjs(patchModal.paymentDueAt) : null,
            });
          }
        }}
      >
        <Form
          form={patchForm}
          layout="vertical"
          onFinish={async (v: { isBlocked: boolean; blockedReason?: string; isVip: boolean; paymentDue?: dayjs.Dayjs | null }) => {
            if (!patchModal) return;
            try {
              await api.patch(`/organizations/${patchModal.id}`, {
                isBlocked: v.isBlocked,
                blockedReason: v.blockedReason || undefined,
                isVip: v.isVip,
                paymentDueAt: v.paymentDue ? v.paymentDue.format('YYYY-MM-DD') : null,
              });
              void message.success('Saqlandi');
              setPatchModal(null);
              await loadOrgs();
            } catch {
              void message.error('Xatolik');
            }
          }}
        >
          <Form.Item name="isVip" label="VIP" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="isBlocked" label="Bloklangan" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="blockedReason" label="Blok sababi">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="paymentDue" label="To'lov muddati">
            <DatePicker className="w-full" />
          </Form.Item>
          <Button type="primary" htmlType="submit" style={{ backgroundColor: '#f59e0b', border: 'none' }}>
            Saqlash
          </Button>
        </Form>
      </Modal>

      {/* ===== Create Branch Modal ===== */}
      <Modal
        title={
          branchCreateOrgId
            ? `Yangi filial — ${orgs.find((o) => o.id === branchCreateOrgId)?.name ?? ''}`
            : 'Yangi filial'
        }
        open={branchCreateOpen}
        onCancel={() => { setBranchCreateOpen(false); setBranchCreateOrgId(null); branchForm.resetFields(); }}
        footer={null}
        destroyOnClose
        width={640}
      >
        <Form
          form={branchForm}
          layout="vertical"
          className="mt-2"
          onFinish={async (v: {
            name: string;
            code?: string;
            mqttUrl?: string;
            mqttUsername?: string;
            mqttPassword?: string;
            mqttTopic?: string;
            staffEmail?: string;
            staffPassword?: string;
            staffFullName?: string;
          }) => {
            if (!branchCreateOrgId) { void message.warning('Tashkilot tanlanmagan'); return; }
            try {
              await api.post(`/organizations/${branchCreateOrgId}/branches`, v);
              void message.success('Filial yaratildi');
              branchForm.resetFields();
              setBranchCreateOpen(false);
              invalidateBranches(branchCreateOrgId);
              await loadBranchesForOrg(branchCreateOrgId);
              setBranchCreateOrgId(null);
              await loadAllUsers();
            } catch {
              void message.error('Xatolik');
            }
          }}
        >
          <Form.Item name="name" label="Filial nomi" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Kod">
            <Input />
          </Form.Item>
          <Alert
            type="info"
            showIcon
            className="mb-4"
            message="MQTT broker"
            description={
              <Typography.Text type="secondary" className="text-sm">
                Broker URL, foydalanuvchi nomi va parolni{' '}
                <Typography.Text code>backend/.env.example</Typography.Text> dagi{' '}
                <Typography.Text code>MQTT_URL</Typography.Text> o'zgaruvchilaridan oling. Mavzu namunalari:{' '}
                <Typography.Text code>{MQTT_ENV_HINT}</Typography.Text>
              </Typography.Text>
            }
          />
          <Form.Item name="mqttUrl" label="MQTT URL">
            <Input placeholder="mqtt://host:1883" />
          </Form.Item>
          <Form.Item name="mqttUsername" label="MQTT user">
            <Input />
          </Form.Item>
          <Form.Item name="mqttPassword" label="MQTT parol">
            <Input.Password />
          </Form.Item>
          <Form.Item name="mqttTopic" label="MQTT topic">
            <Input placeholder="showroom/block" />
          </Form.Item>
          <Typography.Text type="secondary" className="mb-2 block">
            <strong>Filial xodimi</strong> (ixtiyoriy) — alohida login va parol.
          </Typography.Text>
          <Form.Item name="staffEmail" label="Xodim email (login)">
            <Input type="email" autoComplete="off" />
          </Form.Item>
          <Form.Item name="staffPassword" label="Xodim paroli (min 8 belgi)">
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="staffFullName" label="Xodim ism familiyasi">
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" style={{ backgroundColor: '#f59e0b', border: 'none' }}>
            Filial yaratish
          </Button>
        </Form>
      </Modal>

      {/* ===== Edit Branch Modal ===== */}
      <Modal
        title={branchEdit ? `Filial sozlamalari: ${branchEdit.name}` : ''}
        open={!!branchEdit}
        onCancel={() => { setBranchEdit(null); branchFormModal.resetFields(); }}
        footer={null}
        destroyOnClose
        afterOpenChange={(o) => {
          if (o && branchEdit) {
            branchFormModal.setFieldsValue({ isVip: branchEdit.isVip ?? false, isBlocked: branchEdit.isBlocked ?? false });
          }
        }}
      >
        <Form
          form={branchFormModal}
          layout="vertical"
          onFinish={async (v: { isVip: boolean; isBlocked: boolean; blockedReason?: string }) => {
            if (!branchEdit) return;
            try {
              await api.patch(`/branches/${branchEdit.id}`, {
                isVip: v.isVip,
                isBlocked: v.isBlocked,
                blockedReason: v.blockedReason || undefined,
              });
              void message.success('Saqlandi');
              const oid = branchEdit.organizationId;
              setBranchEdit(null);
              invalidateBranches(oid);
              await loadBranchesForOrg(oid);
            } catch {
              void message.error('Xatolik');
            }
          }}
        >
          <Form.Item name="isVip" label="VIP" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="isBlocked" label="Bloklangan" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="blockedReason" label="Blok sababi">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Button type="primary" htmlType="submit" style={{ backgroundColor: '#f59e0b', border: 'none' }}>
            Saqlash
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
