import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Table,
  Typography,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { api } from '@/lib/api';

type Org = { id: string; name: string };

type PaymentRow = {
  id: string;
  organizationId: string;
  amount: string;
  paidAt: string;
  note: string | null;
  createdAt: string;
  organization?: { name: string };
};

export default function AdminKassa() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [form] = Form.useForm();
  const [addOpen, setAddOpen] = useState(false);
  const [paymentOrgFilter, setPaymentOrgFilter] = useState<
    string | undefined
  >();

  const loadOrgs = async () => {
    const { data } = await api.get<Org[]>('/organizations');
    setOrgs(data);
  };

  const loadPayments = async (organizationId?: string) => {
    const { data } = await api.get<PaymentRow[]>('/admin/payments', {
      params: organizationId ? { organizationId } : {},
    });
    setRows(data);
  };

  useEffect(() => {
    loadOrgs().catch(() => message.error('Tashkilotlar'));
    loadPayments().catch(() => message.error('Kassa'));
  }, []);

  return (
    <div className="space-y-6">
      <Typography.Title level={4}>Kassa — to‘lov yozuvlari</Typography.Title>

      <Card
        title="Ro‘yxat"
        extra={
          <Button type="primary" onClick={() => setAddOpen(true)}>
            Yangi yozuv
          </Button>
        }
      >
        <div className="mb-3">
          <Select
            allowClear
            placeholder="Tashkilot bo‘yicha filtr"
            className="min-w-[240px]"
            value={paymentOrgFilter}
            options={orgs.map((o) => ({ value: o.id, label: o.name }))}
            onChange={(id) => {
              setPaymentOrgFilter(id);
              void loadPayments(id || undefined);
            }}
          />
        </div>
        <Table
          rowKey="id"
          dataSource={rows}
          pagination={{ pageSize: 20 }}
          columns={[
            { title: 'Tashkilot', render: (_, r) => r.organization?.name ?? '—' },
            { title: 'Summa', dataIndex: 'amount' },
            { title: 'Sana', dataIndex: 'paidAt' },
            { title: 'Izoh', dataIndex: 'note' },
            { title: 'Yaratilgan', dataIndex: 'createdAt', ellipsis: true },
            {
              title: '',
              key: 'del',
              width: 100,
              render: (_, r) => (
                <Popconfirm
                  title="Yozuvni o‘chirish?"
                  okText="Ha"
                  cancelText="Yo‘q"
                  okButtonProps={{ danger: true }}
                  onConfirm={async () => {
                    try {
                      await api.delete(`/admin/payments/${r.id}`);
                      message.success('O‘chirildi');
                      await loadPayments(paymentOrgFilter);
                    } catch {
                      message.error('O‘chirish mumkin emas');
                    }
                  }}
                >
                  <Button type="link" danger size="small">
                    O‘chirish
                  </Button>
                </Popconfirm>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="Yangi to‘lov yozuvi"
        open={addOpen}
        onCancel={() => {
          setAddOpen(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
        width={480}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-2 max-w-md"
          onFinish={async (v: {
            organizationId: string;
            amount: number;
            paidAt: dayjs.Dayjs;
            note?: string;
          }) => {
            try {
              await api.post('/admin/payments', {
                organizationId: v.organizationId,
                amount: v.amount,
                paidAt: v.paidAt.format('YYYY-MM-DD'),
                note: v.note,
              });
              message.success('Qo‘shildi');
              form.resetFields();
              setAddOpen(false);
              await loadPayments(paymentOrgFilter);
            } catch {
              message.error('Xatolik');
            }
          }}
        >
          <Form.Item
            name="organizationId"
            label="Tashkilot"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={orgs.map((o) => ({ value: o.id, label: o.name }))}
            />
          </Form.Item>
          <Form.Item name="amount" label="Summa" rules={[{ required: true }]}>
            <InputNumber className="w-full" min={0.01} step={1000} />
          </Form.Item>
          <Form.Item name="paidAt" label="Sana" rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="note" label="Izoh">
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
