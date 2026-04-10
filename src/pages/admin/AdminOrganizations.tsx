import { useCallback, useEffect, useState } from 'react';
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
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { api } from '@/lib/api';

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

export default function AdminOrganizations() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [branchByOrgId, setBranchByOrgId] = useState<Record<string, Branch[]>>(
    {},
  );
  const [branchLoadingOrgId, setBranchLoadingOrgId] = useState<string | null>(
    null,
  );

  const [orgCreateOpen, setOrgCreateOpen] = useState(false);
  const [branchCreateOpen, setBranchCreateOpen] = useState(false);
  const [branchCreateOrgId, setBranchCreateOrgId] = useState<string | null>(
    null,
  );

  const [orgForm] = Form.useForm();
  const [branchForm] = Form.useForm();
  const [patchModal, setPatchModal] = useState<Org | null>(null);
  const [patchForm] = Form.useForm();
  const [branchEdit, setBranchEdit] = useState<Branch | null>(null);
  const [branchFormModal] = Form.useForm();

  const loadOrgs = async () => {
    const { data } = await api.get<Org[]>('/organizations');
    setOrgs(data);
  };

  const loadBranchesForOrg = useCallback(async (organizationId: string) => {
    setBranchLoadingOrgId(organizationId);
    try {
      const { data } = await api.get<Branch[]>(
        `/organizations/${organizationId}/branches`,
      );
      setBranchByOrgId((m) => ({ ...m, [organizationId]: data }));
    } catch {
      message.error('Filiallar yuklanmadi');
    } finally {
      setBranchLoadingOrgId(null);
    }
  }, []);

  useEffect(() => {
    loadOrgs().catch(() => message.error('Tashkilotlar yuklanmadi'));
  }, []);

  const invalidateBranches = (organizationId: string) => {
    setBranchByOrgId((m) => {
      const next = { ...m };
      delete next[organizationId];
      return next;
    });
  };

  const branchColumns: ColumnsType<Branch> = [
    { title: 'Nomi', dataIndex: 'name' },
    {
      title: 'VIP',
      render: (_, r) =>
        r.isVip ? <Tag color="gold">VIP</Tag> : <Tag>—</Tag>,
    },
    {
      title: 'Holat',
      render: (_, r) =>
        r.isBlocked ? (
          <Tag color="red">Blok</Tag>
        ) : (
          <Tag color="green">Faol</Tag>
        ),
    },
    { title: 'ID', dataIndex: 'id', ellipsis: true },
    {
      title: 'Amallar',
      key: 'brAct',
      width: 220,
      render: (_, r) => (
        <Space size="small" wrap>
          <Button type="link" onClick={() => setBranchEdit(r)}>
            Sozlamalar
          </Button>
          <Popconfirm
            title="Filialni o‘chirish?"
            description="Bloklar, qavatlar va kvartiralar ham o‘chiriladi. Shartnomalar avvalo olib tashlanadi."
            okText="Ha, o‘chirish"
            cancelText="Bekor"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              try {
                await api.delete(`/branches/${r.id}`);
                message.success('Filial o‘chirildi');
                invalidateBranches(r.organizationId);
                await loadBranchesForOrg(r.organizationId);
              } catch {
                message.error('O‘chirish mumkin emas');
              }
            }}
          >
            <Button type="link" danger>
              O‘chirish
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Typography.Title level={4}>Tashkilotlar</Typography.Title>

      <Card
        title="Barcha tashkilotlar"
        extra={
          <Button type="primary" onClick={() => setOrgCreateOpen(true)}>
            Yangi tashkilot
          </Button>
        }
      >
        <Table<Org>
          rowKey="id"
          dataSource={orgs}
          pagination={{ pageSize: 15 }}
          columns={[
            { title: 'Nomi', dataIndex: 'name' },
            {
              title: 'VIP',
              render: (_, r) =>
                r.isVip ? <Tag color="gold">VIP</Tag> : <Tag>—</Tag>,
            },
            {
              title: 'Muddat',
              dataIndex: 'paymentDueAt',
              render: (v: string | null) => v || '—',
            },
            {
              title: 'Holat',
              render: (_, r) =>
                r.isBlocked ? (
                  <Tag color="red">Bloklangan</Tag>
                ) : (
                  <Tag color="green">Faol</Tag>
                ),
            },
            {
              title: 'Amallar',
              key: 'orgAct',
              width: 240,
              render: (_, r) => (
                <Space size="small" wrap>
                  <Button type="link" onClick={() => setPatchModal(r)}>
                    Tahrirlash
                  </Button>
                  <Popconfirm
                    title="Tashkilotni butunlay o‘chirish?"
                    description="Barcha filiallar, mijozlar, shartnomalar va tashkilot foydalanuvchilari o‘chiriladi. Qaytarib bo‘lmaydi."
                    okText="Ha, o‘chirish"
                    cancelText="Bekor"
                    okButtonProps={{ danger: true }}
                    onConfirm={async () => {
                      try {
                        await api.delete(`/organizations/${r.id}`);
                        message.success('Tashkilot o‘chirildi');
                        setBranchByOrgId((m) => {
                          const next = { ...m };
                          delete next[r.id];
                          return next;
                        });
                        await loadOrgs();
                      } catch {
                        message.error('O‘chirish mumkin emas');
                      }
                    }}
                  >
                    <Button type="link" danger>
                      O‘chirish
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
                <div className="border-l-2 border-teal-500/40 py-2 pl-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Typography.Text type="secondary" className="text-sm">
                      Filiallar
                    </Typography.Text>
                    <Button
                      size="small"
                      type="primary"
                      className="!bg-teal-500 !border-teal-500"
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

      <Modal
        title="Yangi tashkilot + admin akkaunt"
        open={orgCreateOpen}
        onCancel={() => {
          setOrgCreateOpen(false);
          orgForm.resetFields();
        }}
        footer={null}
        destroyOnClose
        width={560}
      >
        <Form
          form={orgForm}
          layout="vertical"
          className="mt-2 max-w-xl"
          onFinish={async (v: {
            name: string;
            adminEmail: string;
            adminPassword: string;
            adminFullName?: string;
          }) => {
            try {
              await api.post('/organizations', v);
              message.success('Yaratildi');
              orgForm.resetFields();
              setOrgCreateOpen(false);
              await loadOrgs();
            } catch {
              message.error('Xatolik (email band yoki validatsiya)');
            }
          }}
        >
          <Form.Item name="name" label="Tashkilot nomi" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="adminEmail"
            label="Admin email (login)"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="adminPassword"
            label="Admin parol (min 8)"
            rules={[{ required: true, min: 8 }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="adminFullName" label="Admin ism familiya">
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Yaratish
          </Button>
        </Form>
      </Modal>

      <Modal
        title={patchModal?.name}
        open={!!patchModal}
        onCancel={() => {
          setPatchModal(null);
          patchForm.resetFields();
        }}
        footer={null}
        destroyOnClose
        afterOpenChange={(open) => {
          if (open && patchModal) {
            patchForm.setFieldsValue({
              isBlocked: patchModal.isBlocked,
              blockedReason: patchModal.blockedReason ?? '',
              isVip: patchModal.isVip,
              paymentDue: patchModal.paymentDueAt
                ? dayjs(patchModal.paymentDueAt)
                : null,
            });
          }
        }}
      >
        <Form
          form={patchForm}
          layout="vertical"
          onFinish={async (v: {
            isBlocked: boolean;
            blockedReason?: string;
            isVip: boolean;
            paymentDue?: dayjs.Dayjs | null;
          }) => {
            if (!patchModal) {
              return;
            }
            try {
              await api.patch(`/organizations/${patchModal.id}`, {
                isBlocked: v.isBlocked,
                blockedReason: v.blockedReason || undefined,
                isVip: v.isVip,
                paymentDueAt: v.paymentDue
                  ? v.paymentDue.format('YYYY-MM-DD')
                  : null,
              });
              message.success('Saqlandi');
              setPatchModal(null);
              await loadOrgs();
            } catch {
              message.error('Xatolik');
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
          <Form.Item name="paymentDue" label="To‘lov muddati">
            <DatePicker className="w-full" />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Saqlash
          </Button>
        </Form>
      </Modal>

      <Modal
        title={
          branchCreateOrgId
            ? `Yangi filial — ${
                orgs.find((o) => o.id === branchCreateOrgId)?.name ?? ''
              }`
            : 'Yangi filial'
        }
        open={branchCreateOpen}
        onCancel={() => {
          setBranchCreateOpen(false);
          setBranchCreateOrgId(null);
          branchForm.resetFields();
        }}
        footer={null}
        destroyOnClose
        width={640}
      >
        <Form
          form={branchForm}
          layout="vertical"
          className="mt-2 max-w-xl"
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
            if (!branchCreateOrgId) {
              message.warning('Tashkilot tanlanmagan');
              return;
            }
            try {
              await api.post(`/organizations/${branchCreateOrgId}/branches`, v);
              message.success('Filial yaratildi');
              branchForm.resetFields();
              setBranchCreateOpen(false);
              invalidateBranches(branchCreateOrgId);
              await loadBranchesForOrg(branchCreateOrgId);
              setBranchCreateOrgId(null);
            } catch {
              message.error('Xatolik');
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
              <Space direction="vertical" size="small" className="w-full">
                <Typography.Text type="secondary" className="text-sm">
                  Broker URL, foydalanuvchi nomi va parolni{' '}
                  <Typography.Text code>backend/.env.example</Typography.Text>{' '}
                  dagi <Typography.Text code>MQTT_URL</Typography.Text>,{' '}
                  <Typography.Text code>MQTT_USERNAME</Typography.Text>,{' '}
                  <Typography.Text code>MQTT_PASSWORD</Typography.Text>{' '}
                  o‘zgaruvchilaridan oling — ularni UI da ko‘rsatmaymiz. Mavzu
                  namunalari: <Typography.Text code>{MQTT_ENV_HINT}</Typography.Text>
                </Typography.Text>
              </Space>
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
            <strong>Filial admini</strong> (ixtiyoriy) — alohida login va parol.
          </Typography.Text>
          <Form.Item name="staffEmail" label="Filial admini email (login)">
            <Input type="email" autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="staffPassword"
            label="Filial admini paroli (min 8 belgi)"
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="staffFullName" label="Filial admini ism familiyasi">
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Filial yaratish
          </Button>
        </Form>
      </Modal>

      <Modal
        title={branchEdit ? `Filial: ${branchEdit.name}` : ''}
        open={!!branchEdit}
        onCancel={() => {
          setBranchEdit(null);
          branchFormModal.resetFields();
        }}
        footer={null}
        destroyOnClose
        afterOpenChange={(o) => {
          if (o && branchEdit) {
            branchFormModal.setFieldsValue({
              isVip: branchEdit.isVip ?? false,
              isBlocked: branchEdit.isBlocked ?? false,
            });
          }
        }}
      >
        <Form
          form={branchFormModal}
          layout="vertical"
          onFinish={async (v: {
            isVip: boolean;
            isBlocked: boolean;
            blockedReason?: string;
          }) => {
            if (!branchEdit) {
              return;
            }
            try {
              await api.patch(`/branches/${branchEdit.id}`, {
                isVip: v.isVip,
                isBlocked: v.isBlocked,
                blockedReason: v.blockedReason || undefined,
              });
              message.success('Saqlandi');
              const oid = branchEdit.organizationId;
              setBranchEdit(null);
              invalidateBranches(oid);
              await loadBranchesForOrg(oid);
            } catch {
              message.error('Xatolik');
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
          <Button type="primary" htmlType="submit">
            Saqlash
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
