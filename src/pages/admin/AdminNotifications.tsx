import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { KeyRound, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { approvePasswordReset } from '@/api/users';

type NotificationRow = {
  id: string;
  type: string;
  message: string;
  readAt: string | null;
  isApproved: boolean;
  createdAt: string;
  organization?: { name: string } | null;
  requestedUser?: { id: string; email: string; fullName?: string | null } | null;
};

export default function AdminNotifications() {
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [approveTarget, setApproveTarget] = useState<NotificationRow | null>(null);
  const [approveForm] = Form.useForm();

  const load = async () => {
    const { data } = await api.get<NotificationRow[]>('/admin/notifications');
    setRows(data);
  };

  useEffect(() => {
    load().catch(() => message.error('Yuklanmadi'));
  }, []);

  const handleApprove = async (values: { newPassword: string }) => {
    if (!approveTarget) return;
    try {
      await approvePasswordReset(approveTarget.id, values.newPassword);
      message.success('Parol muvaffaqiyatli yangilandi');
      setApproveTarget(null);
      approveForm.resetFields();
      await load();
    } catch {
      message.error('Xatolik yuz berdi');
    }
  };

  const markRead = async (id: string) => {
    try {
      await api.patch(`/admin/notifications/${id}/read`);
      message.success('O\'qilgan deb belgilandi');
      await load();
    } catch {
      message.error('Xatolik');
    }
  };

  const typeLabel = (type: string) => {
    if (type === 'password_reset_request') {
      return <Tag color="orange" icon={<KeyRound size={12} />}>Parol tiklash so'rovi</Tag>;
    }
    if (type === 'payment_due') {
      return <Tag color="red">To'lov muddati</Tag>;
    }
    return <Tag>{type}</Tag>;
  };

  const unreadCount = rows.filter((r) => !r.readAt).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Typography.Title level={4} className="!mb-0">
          Bildirishnomalar
        </Typography.Title>
        {unreadCount > 0 && (
          <Badge count={unreadCount} color="red" />
        )}
      </div>

      <Card>
        <Table
          rowKey="id"
          dataSource={rows}
          pagination={{ pageSize: 25 }}
          rowClassName={(r) => (!r.readAt ? 'font-semibold bg-yellow-50 dark:bg-yellow-900/10' : '')}
          columns={[
            {
              title: 'Tur',
              dataIndex: 'type',
              render: (t: string) => typeLabel(t),
              width: 180,
            },
            {
              title: 'Tashkilot',
              render: (_: unknown, r: NotificationRow) => r.organization?.name ?? '—',
              width: 150,
            },
            {
              title: 'Foydalanuvchi',
              render: (_: unknown, r: NotificationRow) =>
                r.requestedUser
                  ? `${r.requestedUser.fullName ?? ''} (${r.requestedUser.email})`
                  : '—',
            },
            {
              title: 'Matn',
              dataIndex: 'message',
              ellipsis: true,
            },
            {
              title: 'Vaqt',
              dataIndex: 'createdAt',
              render: (v: string) => new Date(v).toLocaleString('uz-UZ'),
              width: 160,
            },
            {
              title: 'Holat',
              width: 120,
              render: (_: unknown, r: NotificationRow) => {
                if (r.type === 'password_reset_request' && r.isApproved) {
                  return <Tag color="green" icon={<CheckCircle size={12} />}>Tasdiqlangan</Tag>;
                }
                if (r.readAt) {
                  return <Tag color="default">O'qilgan</Tag>;
                }
                return <Tag color="orange">Yangi</Tag>;
              },
            },
            {
              title: 'Amallar',
              width: 220,
              render: (_: unknown, r: NotificationRow) => (
                <div className="flex gap-2 flex-wrap">
                  {r.type === 'password_reset_request' && !r.isApproved && (
                    <Button
                      size="small"
                      type="primary"
                      icon={<KeyRound size={13} />}
                      style={{ backgroundColor: '#6bd2bc', border: 'none' }}
                      onClick={() => {
                        setApproveTarget(r);
                        approveForm.resetFields();
                      }}
                    >
                      Tasdiqlash
                    </Button>
                  )}
                  {!r.readAt && (
                    <Button
                      size="small"
                      type="link"
                      onClick={() => markRead(r.id)}
                    >
                      O'qilgan
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Parol tiklashni tasdiqlash modal */}
      <Modal
        title={
          <span>
            Parol tiklashni tasdiqlash
            {approveTarget?.requestedUser && (
              <span className="ml-2 text-sm font-normal text-slate-500">
                — {approveTarget.requestedUser.fullName ?? approveTarget.requestedUser.email}
              </span>
            )}
          </span>
        }
        open={!!approveTarget}
        onCancel={() => { setApproveTarget(null); approveForm.resetFields(); }}
        onOk={() => approveForm.submit()}
        okText="Tasdiqlash va saqlash"
        cancelText="Bekor qilish"
        okButtonProps={{ style: { backgroundColor: '#6bd2bc', border: 'none' } }}
      >
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Foydalanuvchi uchun yangi parol o'rnating. Eski parol talab qilinmaydi.
        </p>
        <Form form={approveForm} layout="vertical" onFinish={handleApprove}>
          <Form.Item
            name="newPassword"
            label="Yangi parol"
            rules={[{ required: true, min: 8, message: 'Kamida 8 belgi kiriting' }]}
          >
            <Input.Password placeholder="Yangi parol (kamida 8 belgi)" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Parolni tasdiqlang"
            dependencies={['newPassword']}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Parollar mos kelmadi'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Parolni qayta kiriting" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
