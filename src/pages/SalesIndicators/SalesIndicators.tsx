/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  PieChartIcon as PieIcon,
  Building2,
  Home,
  Grid3X3,
  TableIcon,
} from 'lucide-react';
import {
  Alert,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Segmented,
  Progress,
  Badge,
  Table,
  Tag,
  Button,
  Input,
  Spin,
  Empty,
} from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
  Pie,
} from 'recharts';
import dayjs from 'dayjs';
import type { ApartmentWithContext } from '@/api/salesInventory';
import type { BlockRow } from '@/api/blocks';
import {
  useContractsQuery,
  useSalesInventoryQuery,
} from '@/hooks/api/crmHooks';
import { can } from '@/lib/permissions';
import { getSessionUser } from '@/lib/sessionUser';
import ChessBoard, { type SalesRoomRow } from './Chess';

const { Title, Text } = Typography;
const { Search } = Input;

const statusColors = {
  sold: '#ef4444',
  available: '#6bd2bc',
  reserved: '#3b82f6',
};

function mapApartmentToSalesRow(a: ApartmentWithContext): SalesRoomRow {
  const block = a.floor?.block;
  const blockId = block?.id ?? a.floor?.blockId ?? 'unknown';
  const blockLabel = block
    ? `${block.name}${block.code ? ` (${block.code})` : ''}`
    : '—';
  const floor = a.floor?.level ?? 0;
  const digits = String(a.number).replace(/\D/g, '');
  const room = digits ? parseInt(digits, 10) : 0;
  let status: SalesRoomRow['status'] = 'empty';
  if (a.status === 'sold') {
    status = 'selled';
  } else if (a.status === 'reserved') {
    status = 'broned';
  }
  return {
    _id: a.id,
    blockId,
    blockLabel,
    floor,
    room: Number.isFinite(room) ? room : 0,
    status,
    areaSqm: a.areaSqm,
  };
}

type ApiContractRow = {
  id: string;
  contractDate: string;
  amount: number;
};

export default function SalesIndicatorsPage() {
  const navigate = useNavigate();
  const user = getSessionUser();
  const perms = user?.effectivePermissions;
  const canSales = can(perms, user?.role, 'sales.indicators');
  const canContractsRead = can(perms, user?.role, 'contracts.read');

  const { data: inventory, isLoading: invLoading } = useSalesInventoryQuery(
    canSales,
  );
  const { data: contractsRaw = [], isLoading: contractsLoading } =
    useContractsQuery(canContractsRead);

  const blocks = useMemo(
    () => (inventory?.blocks ?? []) as BlockRow[],
    [inventory?.blocks],
  );
  const salesRows = useMemo(() => {
    const list = (inventory?.apartments ?? []).filter(
      (a) => a.status !== 'not_for_sale',
    );
    return list.map((a) => mapApartmentToSalesRow(a));
  }, [inventory?.apartments]);

  const contracts = contractsRaw as ApiContractRow[];

  const totals = useMemo(() => {
    let sold = 0;
    let reserved = 0;
    let available = 0;
    for (const r of salesRows) {
      if (r.status === 'selled') {
        sold += 1;
      } else if (r.status === 'broned') {
        reserved += 1;
      } else {
        available += 1;
      }
    }
    return { sold, reserved, available, total: salesRows.length };
  }, [salesRows]);

  const blockData = useMemo(() => {
    const byBlock = new Map<
      string,
      { name: string; sold: number; reserved: number; available: number }
    >();
    for (const b of blocks) {
      byBlock.set(b.id, { name: b.name, sold: 0, reserved: 0, available: 0 });
    }
    for (const r of salesRows) {
      const cur = byBlock.get(r.blockId);
      if (!cur) {
        continue;
      }
      if (r.status === 'selled') {
        cur.sold += 1;
      } else if (r.status === 'broned') {
        cur.reserved += 1;
      } else {
        cur.available += 1;
      }
    }
    return [...byBlock.values()].map((row) => {
      const t = row.sold + row.reserved + row.available;
      const percentage =
        t === 0 ? 0 : Math.round((row.sold / t) * 100);
      return {
        name: row.name,
        total: t,
        sold: row.sold,
        reserved: row.reserved,
        available: row.available,
        percentage,
      };
    });
  }, [blocks, salesRows]);

  const floorData = useMemo(() => {
    const m = new Map<
      string,
      { floor: string; sold: number; reserved: number; available: number }
    >();
    for (const r of salesRows) {
      const label = `${r.blockLabel} · ${r.floor}-qavat`;
      const cur = m.get(label) ?? {
        floor: label,
        sold: 0,
        reserved: 0,
        available: 0,
      };
      if (r.status === 'selled') {
        cur.sold += 1;
      } else if (r.status === 'broned') {
        cur.reserved += 1;
      } else {
        cur.available += 1;
      }
      m.set(label, cur);
    }
    return [...m.values()].slice(0, 24);
  }, [salesRows]);

  const statusDistribution = useMemo(
    () => [
      {
        name: 'Sotilgan',
        value: totals.sold,
        color: statusColors.sold,
      },
      {
        name: 'Bron',
        value: totals.reserved,
        color: statusColors.reserved,
      },
      {
        name: 'Mavjud',
        value: totals.available,
        color: statusColors.available,
      },
    ],
    [totals.sold, totals.reserved, totals.available],
  );

  const monthlyTrend = useMemo(() => {
    const map = new Map<
      string,
      { month: string; signed: number; amount: number }
    >();
    for (const c of contracts) {
      const d = dayjs(c.contractDate);
      const key = d.format('YYYY-MM');
      const cur = map.get(key) ?? {
        month: d.format('MMM'),
        signed: 0,
        amount: 0,
      };
      cur.signed += 1;
      cur.amount += Number(c.amount ?? 0);
      map.set(key, cur);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({
        month: v.month,
        signed: v.signed,
        amount: v.amount,
      }));
  }, [contracts]);

  const [activeView, setActiveView] = useState<string>('table');
  const [filteredData, setFilteredData] = useState<SalesRoomRow[]>([]);

  useEffect(() => {
    setFilteredData(salesRows);
  }, [salesRows]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <p className="font-medium text-slate-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const blockFilters = useMemo(() => {
    const labels = new Map<string, string>();
    for (const r of salesRows) {
      labels.set(r.blockId, r.blockLabel);
    }
    return [...labels.entries()].map(([value, text]) => ({
      text,
      value,
    }));
  }, [salesRows]);

  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      width: 120,
      render: (text: string) => (
        <Text className="font-mono text-xs">{text.slice(0, 8)}…</Text>
      ),
    },
    {
      title: 'Blok',
      dataIndex: 'blockLabel',
      key: 'blockLabel',
      width: 140,
      render: (label: string) => (
        <Tag color="#6bd2bc" className="font-medium">
          {label}
        </Tag>
      ),
      filters: blockFilters,
      onFilter: (value: any, record: SalesRoomRow) => record.blockId === value,
    },
    {
      title: 'Qavat',
      dataIndex: 'floor',
      key: 'floor',
      width: 80,
      sorter: (a: SalesRoomRow, b: SalesRoomRow) => a.floor - b.floor,
      render: (floor: number) => <Text className="font-medium">{floor}</Text>,
    },
    {
      title: 'Xona',
      dataIndex: 'room',
      key: 'room',
      width: 80,
      sorter: (a: SalesRoomRow, b: SalesRoomRow) => a.room - b.room,
      render: (room: number) => <Text className="font-medium">{room}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusConfig = {
          empty: {
            color: 'success',
            text: 'Mavjud',
            bgColor: statusColors.available,
          },
          broned: {
            color: 'processing',
            text: 'Bron',
            bgColor: statusColors.reserved,
          },
          selled: {
            color: 'error',
            text: 'Sotilgan',
            bgColor: statusColors.sold,
          },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Tag
            color={config.color}
            style={{
              backgroundColor: config.bgColor,
              color: 'white',
              border: 'none',
            }}
          >
            {config.text}
          </Tag>
        );
      },
      filters: [
        { text: 'Mavjud', value: 'empty' },
        { text: 'Bron', value: 'broned' },
        { text: 'Sotilgan', value: 'selled' },
      ],
      onFilter: (value: any, record: SalesRoomRow) => record.status === value,
    },
    {
      title: 'm²',
      key: 'area',
      width: 100,
      render: (_: unknown, record: SalesRoomRow) => record.areaSqm ?? '—',
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 160,
      render: (record: SalesRoomRow) => (
        <Space>
          <Button
            type="link"
            size="small"
            style={{ color: '#6bd2bc' }}
            onClick={() =>
              navigate('/dashboard/appartments', {
                state: { highlightApartmentId: record._id },
              })
            }
          >
            Kvartiralar
          </Button>
        </Space>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    const q = value.trim().toLowerCase();
    if (!q) {
      setFilteredData(salesRows);
      return;
    }
    setFilteredData(
      salesRows.filter(
        (item) =>
          item._id.toLowerCase().includes(q) ||
          item.blockLabel.toLowerCase().includes(q) ||
          String(item.floor).includes(q) ||
          String(item.room).includes(q) ||
          item.status.toLowerCase().includes(q),
      ),
    );
  };

  if (!canSales) {
    return (
      <div className="p-6 text-slate-600 dark:text-slate-400">
        Sotuv ko‘rsatkichlari uchun ruxsat yo‘q.
      </div>
    );
  }

  const loading = invLoading || (canContractsRead && contractsLoading);

  const soldPct =
    totals.total === 0
      ? 0
      : Math.round((totals.sold / totals.total) * 1000) / 10;
  const resPct =
    totals.total === 0
      ? 0
      : Math.round((totals.reserved / totals.total) * 1000) / 10;
  const availPct =
    totals.total === 0
      ? 0
      : Math.round((totals.available / totals.total) * 1000) / 10;

  return (
    <div className="min-h-full space-y-6 p-2">
      <Spin spinning={loading}>
        <div>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <div className="rounded-md border-0 bg-gradient-to-br from-red-400 to-red-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/80">Sotilgan</div>
                    <div className="text-3xl font-bold">{totals.sold}</div>
                    <div className="text-sm text-white/60">
                      {soldPct}% jami
                    </div>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                    <Home size={32} className="text-white" />
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="rounded-md border-0 bg-gradient-to-br from-blue-400 to-blue-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/80">Bron qilingan</div>
                    <div className="text-3xl font-bold">{totals.reserved}</div>
                    <div className="text-sm text-white/60">
                      {resPct}% jami
                    </div>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                    <Building2 size={32} className="text-white" />
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="rounded-md border-0 bg-gradient-to-br from-[#6fe0c8] to-[#419380da] p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/80">Mavjud</div>
                    <div className="text-3xl font-bold">{totals.available}</div>
                    <div className="text-sm text-white/60">
                      {availPct}% jami
                    </div>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                    <PieIcon size={32} className="text-white" />
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <Segmented
              value={activeView}
              onChange={setActiveView}
              options={[
                {
                  label: (
                    <div className="flex items-center justify-center p-2">
                      <TableIcon size={16} />
                    </div>
                  ),
                  value: 'table',
                },
                {
                  label: (
                    <div className="flex items-center justify-center p-2">
                      <BarChart3 size={16} />
                    </div>
                  ),
                  value: 'charts',
                },
                {
                  label: (
                    <div className="flex items-center justify-center p-2">
                      <Grid3X3 size={16} />
                    </div>
                  ),
                  value: 'grid',
                },
              ]}
              size="large"
            />
          </div>
        </div>

        {activeView === 'charts' ? (
          <>
            <Row gutter={[24, 24]} className="mt-4">
              <Col xs={24} lg={12}>
                <Card
                  className="border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-[#101010]"
                  title={
                    <Title
                      level={4}
                      className="!mb-0 !text-slate-900 dark:!text-white"
                    >
                      Bloklarga bo‘yicha
                    </Title>
                  }
                >
                  {!blockData.length ? (
                    <Empty description="Blok yoki kvartira yo‘q" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={blockData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="sold"
                          fill={statusColors.sold}
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="reserved"
                          fill={statusColors.reserved}
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="available"
                          fill={statusColors.available}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card
                  className="border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-[#101010]"
                  title={
                    <Title
                      level={4}
                      className="!mb-0 !text-slate-900 dark:!text-white"
                    >
                      Umumiy taqsimot
                    </Title>
                  }
                >
                  {totals.total === 0 ? (
                    <Empty description="Kvartira yo‘q" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              </Col>
            </Row>

            <Row gutter={[24, 24]} className="mt-4">
              <Col xs={24} lg={16}>
                <Card
                  className="border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-[#101010]"
                  title={
                    <Title
                      level={4}
                      className="!mb-0 !text-slate-900 dark:!text-white"
                    >
                      Qavatlar kesimida
                    </Title>
                  }
                >
                  {!floorData.length ? (
                    <Empty description="Ma’lumot yo‘q" />
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart
                        data={floorData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="floor" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="sold"
                          stackId="1"
                          stroke={statusColors.sold}
                          fill={statusColors.sold}
                          fillOpacity={0.8}
                        />
                        <Area
                          type="monotone"
                          dataKey="reserved"
                          stackId="1"
                          stroke={statusColors.reserved}
                          fill={statusColors.reserved}
                          fillOpacity={0.8}
                        />
                        <Area
                          type="monotone"
                          dataKey="available"
                          stackId="1"
                          stroke={statusColors.available}
                          fill={statusColors.available}
                          fillOpacity={0.8}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card
                  className="border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-[#101010]"
                  title={
                    <Title
                      level={4}
                      className="!mb-0 !text-slate-900 dark:!text-white"
                    >
                      Blok: sotilgan ulushi
                    </Title>
                  }
                >
                  <Space direction="vertical" size="large" className="w-full">
                    {!blockData.length ? (
                      <Empty description="Blok yo‘q" />
                    ) : (
                      blockData.map((block, index) => (
                        <div key={block.name + index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Text className="font-medium text-slate-900 dark:text-white">
                              {block.name}
                            </Text>
                            <Badge
                              color={
                                block.percentage > 80
                                  ? 'green'
                                  : block.percentage > 60
                                    ? 'orange'
                                    : 'red'
                              }
                              text={`${block.percentage}%`}
                            />
                          </div>
                          <Progress
                            percent={block.percentage}
                            strokeColor={{
                              '0%': statusColors.available,
                              '50%': statusColors.reserved,
                              '100%': statusColors.sold,
                            }}
                            trailColor="#e2e8f0"
                            size={12}
                          />
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Sotilgan: {block.sold}</span>
                            <span>Jami: {block.total}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>

            <div className="mt-4">
              <Card
                className="border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-[#101010]"
                title={
                  <Title
                    level={4}
                    className="!mb-0 !text-slate-900 dark:!text-white"
                  >
                    Oylik shartnomalar (soni)
                  </Title>
                }
              >
                {!canContractsRead ? (
                  <Alert
                    type="info"
                    showIcon
                    message="Shartnomalar ro‘yxatini ko‘rish uchun «contracts.read» ruxsati kerak."
                  />
                ) : !monthlyTrend.length ? (
                  <Empty description="Shartnoma yo‘q yoki ro‘yxat bo‘sh" />
                ) : (
                  <>
                    <Alert
                      type="info"
                      showIcon
                      className="mb-3"
                      message="Grafik joriy API ro‘yxati asosida: katta hajmda paginatsiya bo‘lsa, to‘liq tarix ko‘rinmasligi mumkin."
                    />
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={monthlyTrend}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="signed"
                          stroke={statusColors.sold}
                          strokeWidth={3}
                          dot={{
                            fill: statusColors.sold,
                            strokeWidth: 2,
                            r: 6,
                          }}
                          name="Shartnomalar"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                )}
              </Card>
            </div>
          </>
        ) : activeView === 'grid' ? (
          <div className="mt-4 flex items-center justify-center">
            {totals.total === 0 && !loading ? (
              <Empty description="Ko‘rsatish uchun kvartira yo‘q" />
            ) : (
              <ChessBoard blocks={blocks} rooms={salesRows} />
            )}
          </div>
        ) : (
          <div className="mt-4">
            <Card
              className="border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-[#101010]"
              title={
                <div className="flex items-center justify-between">
                  <Title
                    level={4}
                    className="!mb-0 !text-slate-900 dark:!text-white"
                  >
                    Xonalar jadvali
                  </Title>
                  <Search
                    placeholder="Qidirish..."
                    allowClear
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                  />
                </div>
              }
            >
              <Table
                columns={columns as any}
                dataSource={filteredData}
                rowKey="_id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} / ${total} ta`,
                }}
                scroll={{ x: 800 }}
                size="middle"
                className="custom-table"
                locale={{
                  emptyText: <Empty description="Kvartira yo‘q" />,
                }}
              />
            </Card>
          </div>
        )}
      </Spin>
    </div>
  );
}
