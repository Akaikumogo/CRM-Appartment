import { useEffect, useState } from 'react';
import { Button, Card, Table, Typography, message } from 'antd';
import { api } from '@/lib/api';

type Row = {
  id: string;
  type: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  organization?: { name: string };
};

export default function AdminNotifications() {
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    const { data } = await api.get<Row[]>('/admin/notifications');
    setRows(data);
  };

  useEffect(() => {
    load().catch(() => message.error('Yuklanmadi'));
  }, []);

  return (
    <div className="space-y-4">
      <Typography.Title level={4}>Bildirishnomalar</Typography.Title>
      <Card>
        <Table
          rowKey="id"
          dataSource={rows}
          pagination={{ pageSize: 25 }}
          columns={[
            { title: 'Tashkilot', render: (_, r) => r.organization?.name ?? '—' },
            { title: 'Tur', dataIndex: 'type' },
            { title: 'Matn', dataIndex: 'message' },
            { title: 'Vaqt', dataIndex: 'createdAt' },
            {
              title: 'O‘qilgan',
              dataIndex: 'readAt',
              render: (v: string | null) => (v ? v : '—'),
            },
            {
              title: '',
              render: (_, r) =>
                r.readAt ? null : (
                  <Button
                    type="link"
                    onClick={async () => {
                      try {
                        await api.patch(`/admin/notifications/${r.id}/read`);
                        message.success('OK');
                        await load();
                      } catch {
                        message.error('Xatolik');
                      }
                    }}
                  >
                    O‘qilgan
                  </Button>
                ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
