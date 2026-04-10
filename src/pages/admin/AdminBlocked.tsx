import { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, message } from 'antd';
import { api } from '@/lib/api';

type Org = {
  id: string;
  name: string;
  isBlocked: boolean;
  blockedReason: string | null;
  blockedAt: string | null;
  paymentDueAt: string | null;
};

export default function AdminBlocked() {
  const [rows, setRows] = useState<Org[]>([]);

  useEffect(() => {
    api
      .get<Org[]>('/organizations', { params: { blockedOnly: true } })
      .then(({ data }) => setRows(data))
      .catch(() => message.error('Yuklanmadi'));
  }, []);

  return (
    <div className="space-y-4">
      <Typography.Title level={4}>Bloklangan tashkilotlar</Typography.Title>
      <Card>
        <Table
          rowKey="id"
          dataSource={rows}
          pagination={false}
          columns={[
            { title: 'Nomi', dataIndex: 'name' },
            {
              title: 'Sababi',
              dataIndex: 'blockedReason',
              render: (v: string | null) => v || '—',
            },
            { title: 'Blok vaqti', dataIndex: 'blockedAt' },
            { title: 'To‘lov muddati', dataIndex: 'paymentDueAt' },
            {
              title: '',
              render: () => <Tag color="red">Blok</Tag>,
            },
          ]}
        />
      </Card>
    </div>
  );
}
