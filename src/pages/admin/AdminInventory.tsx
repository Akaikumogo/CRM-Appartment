import { useQuery } from '@tanstack/react-query';
import { Card, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fetchSuperadminInventory, type SuperadminInventoryRow } from '@/api/analytics';

export default function AdminInventory() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['analytics', 'superadmin-inventory'],
    queryFn: fetchSuperadminInventory,
  });

  const columns: ColumnsType<SuperadminInventoryRow> = [
    {
      title: 'Tashkilot',
      dataIndex: 'organizationName',
      key: 'org',
      width: 220,
      ellipsis: true,
    },
    {
      title: 'Filial',
      key: 'br',
      render: (_, r) => (
        <span>
          {r.branchName}
          {r.branchCode ? (
            <span className="text-slate-500"> ({r.branchCode})</span>
          ) : null}
        </span>
      ),
    },
    {
      title: 'Bloklar',
      dataIndex: 'blocks',
      width: 100,
      align: 'right',
    },
    {
      title: 'Qavatlar',
      dataIndex: 'floors',
      width: 100,
      align: 'right',
    },
    {
      title: 'Kvartiralar',
      dataIndex: 'apartments',
      width: 120,
      align: 'right',
    },
  ];

  return (
    <div className="space-y-4 p-4">
      <Typography.Title level={4} className="!mb-0">
        Inventar
      </Typography.Title>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Har bir tashkilot va filial uchun blok, qavat va kvartira soni.
      </p>
      <Card className="border-slate-200 dark:border-zinc-800 dark:bg-zinc-950/60">
        <Table<SuperadminInventoryRow>
          rowKey="branchId"
          loading={isLoading}
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 720 }}
        />
      </Card>
    </div>
  );
}
