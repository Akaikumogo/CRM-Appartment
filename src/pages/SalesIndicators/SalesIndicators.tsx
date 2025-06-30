'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  PieChartIcon as PieIcon,
  Building2,
  Home,
  Grid3X3,
  TableIcon
} from 'lucide-react';
import {
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
  Input
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
  Pie // Import Pie from recharts
} from 'recharts';
import RoomTable from './Chess';

const { Title, Text } = Typography;
const { Search } = Input;

// Room data type
export type roomDto = {
  _id: string;
  block: 'block1' | 'block2' | 'block3' | 'block4';
  floor: number;
  room: number;
  status: 'empty' | 'broned' | 'selled';
};

// Generate mock rooms function
const generateMockRooms = (count: number, block: roomDto['block']): roomDto[] =>
  Array.from({ length: count }, (_, i) => ({
    _id: `${block}-${i + 1}`,
    block,
    floor: Math.floor(i / 5) + 1,
    room: (i % 5) + 1,
    status: ['empty', 'broned', 'selled'][
      Math.floor(Math.random() * 3)
    ] as roomDto['status']
  }));

// Colors for different statuses
const statusColors = {
  sold: '#ef4444', // Red for sold
  available: '#6bd2bc', // Primary color for available
  reserved: '#3b82f6' // Blue for reserved
};

// Mock data for blocks
const blockData = [
  {
    name: 'A Blok',
    total: 48,
    sold: 28,
    reserved: 12,
    available: 8,
    percentage: 83
  },
  {
    name: 'B Blok',
    total: 60,
    sold: 35,
    reserved: 15,
    available: 10,
    percentage: 83
  },
  {
    name: 'C Blok',
    total: 72,
    sold: 45,
    reserved: 18,
    available: 9,
    percentage: 88
  },
  {
    name: 'D Blok',
    total: 56,
    sold: 20,
    reserved: 16,
    available: 20,
    percentage: 64
  }
];

// Floor data
const floorData = [
  { floor: '1-qavat', sold: 15, reserved: 8, available: 5 },
  { floor: '2-qavat', sold: 18, reserved: 6, available: 4 },
  { floor: '3-qavat', sold: 22, reserved: 9, available: 3 },
  { floor: '4-qavat', sold: 20, reserved: 12, available: 6 },
  { floor: '5-qavat', sold: 25, reserved: 8, available: 2 },
  { floor: '6-qavat', sold: 18, reserved: 10, available: 7 },
  { floor: '7-qavat', sold: 12, reserved: 8, available: 15 }
];

// Overall status distribution
const statusDistribution = [
  { name: 'Sotilgan', value: 128, color: statusColors.sold },
  { name: 'Bron', value: 61, color: statusColors.reserved },
  { name: 'Mavjud', value: 47, color: statusColors.available }
];

// Monthly sales trend
const monthlyTrend = [
  { month: 'Yan', sold: 8, reserved: 12, target: 15 },
  { month: 'Fev', sold: 12, reserved: 8, target: 18 },
  { month: 'Mar', sold: 15, reserved: 10, target: 20 },
  { month: 'Apr', sold: 22, reserved: 15, target: 25 },
  { month: 'May', sold: 28, reserved: 18, target: 30 },
  { month: 'Iyun', sold: 25, reserved: 12, target: 28 }
];

export default function SalesIndicatorsPage() {
  const [activeView, setActiveView] = useState<string>('charts');
  const [allAppartments, setAllAppartments] = useState<roomDto[]>([]);
  const [filteredData, setFilteredData] = useState<roomDto[]>([]);

  useEffect(() => {
    const mockData = [
      ...generateMockRooms(42, 'block1'),
      ...generateMockRooms(70, 'block2'),
      ...generateMockRooms(48, 'block3'),
      ...generateMockRooms(42, 'block4')
    ];
    setAllAppartments(mockData);
    setFilteredData(mockData);
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
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

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      width: 120,
      render: (text: string) => (
        <Text className="font-mono text-xs">{text}</Text>
      )
    },
    {
      title: 'Blok',
      dataIndex: 'block',
      key: 'block',
      width: 100,
      render: (block: string) => (
        <Tag color="#6bd2bc" className="font-medium">
          {block.replace('block', 'Blok ')}
        </Tag>
      ),
      filters: [
        { text: 'Blok 1', value: 'block1' },
        { text: 'Blok 2', value: 'block2' },
        { text: 'Blok 3', value: 'block3' },
        { text: 'Blok 4', value: 'block4' }
      ],
      onFilter: (value: any, record: roomDto) => record.block === value
    },
    {
      title: 'Qavat',
      dataIndex: 'floor',
      key: 'floor',
      width: 80,
      sorter: (a: roomDto, b: roomDto) => a.floor - b.floor,
      render: (floor: number) => <Text className="font-medium">{floor}</Text>
    },
    {
      title: 'Xona',
      dataIndex: 'room',
      key: 'room',
      width: 80,
      sorter: (a: roomDto, b: roomDto) => a.room - b.room,
      render: (room: number) => <Text className="font-medium">{room}</Text>
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
            bgColor: statusColors.available
          },
          broned: {
            color: 'processing',
            text: 'Bron',
            bgColor: statusColors.reserved
          },
          selled: {
            color: 'error',
            text: 'Sotilgan',
            bgColor: statusColors.sold
          }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Tag
            color={config.color}
            style={{
              backgroundColor: config.bgColor,
              color: 'white',
              border: 'none'
            }}
          >
            {config.text}
          </Tag>
        );
      },
      filters: [
        { text: 'Mavjud', value: 'empty' },
        { text: 'Bron', value: 'broned' },
        { text: 'Sotilgan', value: 'selled' }
      ],
      onFilter: (value: any, record: roomDto) => record.status === value
    },
    {
      title: 'Narx',
      key: 'price',
      width: 120,
      render: (record: roomDto) => (
        <Text className="font-semibold text-green-600">
          ${record.floor * 10000}
        </Text>
      ),
      sorter: (a: roomDto, b: roomDto) => a.floor * 10000 - b.floor * 10000
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 120,
      render: () => (
        <Space>
          <Button type="link" size="small" style={{ color: '#6bd2bc' }}>
            Ko'rish
          </Button>
          <Button type="link" size="small">
            Tahrirlash
          </Button>
        </Space>
      )
    }
  ];

  const handleSearch = (value: string) => {
    const filtered = allAppartments.filter(
      (item) =>
        item._id.toLowerCase().includes(value.toLowerCase()) ||
        item.block.toLowerCase().includes(value.toLowerCase()) ||
        item.status.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  return (
    <div className="p-2 space-y-6 min-h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <div className="bg-gradient-to-br p-4 rounded-md from-red-400 to-red-600 border-0 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm">Sotilgan</div>
                  <div className="text-3xl font-bold">128</div>
                  <div className="text-white/60 text-sm">54.2% umumiy</div>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Home size={32} className="text-white" />
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="bg-gradient-to-br p-4 rounded-md from-blue-400 to-blue-600 border-0 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm">Bron qilingan</div>
                  <div className="text-3xl font-bold">61</div>
                  <div className="text-white/60 text-sm">25.8% umumiy</div>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Building2 size={32} className="text-white" />
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="bg-gradient-to-br p-4 rounded-md from-[#6fe0c8] to-[#419380da] border-0 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm">Mavjud</div>
                  <div className="text-3xl font-bold">47</div>
                  <div className="text-white/60 text-sm">20.0% umumiy</div>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <PieIcon size={32} className="text-white" />
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <Segmented
            value={activeView}
            onChange={setActiveView}
            options={[
              {
                label: (
                  <div className="flex items-center justify-center p-2">
                    <BarChart3 size={16} />
                  </div>
                ),
                value: 'charts'
              },
              {
                label: (
                  <div className="flex items-center justify-center p-2">
                    <Grid3X3 size={16} />
                  </div>
                ),
                value: 'grid'
              },
              {
                label: (
                  <div className="flex items-center justify-center p-2">
                    <TableIcon size={16} />
                  </div>
                ),
                value: 'table'
              }
            ]}
            size="large"
          />
        </div>
      </motion.div>

      {activeView === 'charts' ? (
        <>
          {/* Charts content remains the same */}
          <Row gutter={[24, 24]}>
            {/* Block Sales Chart */}
            <Col xs={24} lg={12}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card
                  className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800"
                  title={
                    <Title
                      level={4}
                      className="!text-slate-900 dark:!text-white !mb-0"
                    >
                      Bloklarga Bo'yicha Sotuv
                    </Title>
                  }
                >
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
                </Card>
              </motion.div>
            </Col>

            {/* Status Distribution Pie Chart */}
            <Col xs={24} lg={12}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card
                  className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800"
                  title={
                    <Title
                      level={4}
                      className="!text-slate-900 dark:!text-white !mb-0"
                    >
                      Umumiy Taqsimot
                    </Title>
                  }
                >
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
                </Card>
              </motion.div>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            {/* Floor Analysis */}
            <Col xs={24} lg={16}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card
                  className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800"
                  title={
                    <Title
                      level={4}
                      className="!text-slate-900 dark:!text-white !mb-0"
                    >
                      Qavatlarga Bo'yicha Tahlil
                    </Title>
                  }
                >
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
                </Card>
              </motion.div>
            </Col>

            {/* Block Completion Radial */}
            <Col xs={24} lg={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card
                  className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800"
                  title={
                    <Title
                      level={4}
                      className="!text-slate-900 dark:!text-white !mb-0"
                    >
                      Blok Tugallanish %
                    </Title>
                  }
                >
                  <Space direction="vertical" size="large" className="w-full">
                    {blockData.map((block, index) => (
                      <motion.div
                        key={block.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex justify-between items-center">
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
                            '100%': statusColors.sold
                          }}
                          trailColor="#e2e8f0"
                          strokeWidth={12}
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Sotilgan: {block.sold}</span>
                          <span>Jami: {block.total}</span>
                        </div>
                      </motion.div>
                    ))}
                  </Space>
                </Card>
              </motion.div>
            </Col>
          </Row>

          {/* Monthly Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card
              className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800"
              title={
                <Title
                  level={4}
                  className="!text-slate-900 dark:!text-white !mb-0"
                >
                  Oylik Sotuv Tendensiyasi
                </Title>
              }
            >
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
                    dataKey="sold"
                    stroke={statusColors.sold}
                    strokeWidth={3}
                    dot={{ fill: statusColors.sold, strokeWidth: 2, r: 6 }}
                    activeDot={{
                      r: 8,
                      stroke: statusColors.sold,
                      strokeWidth: 2
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="reserved"
                    stroke={statusColors.reserved}
                    strokeWidth={3}
                    dot={{ fill: statusColors.reserved, strokeWidth: 2, r: 6 }}
                    activeDot={{
                      r: 8,
                      stroke: statusColors.reserved,
                      strokeWidth: 2
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </>
      ) : activeView === 'grid' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center"
        >
          <RoomTable />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800"
            title={
              <div className="flex items-center justify-between">
                <Title
                  level={4}
                  className="!text-slate-900 dark:!text-white !mb-0"
                >
                  Xonalar Jadvali
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
              columns={columns}
              dataSource={filteredData}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} / ${total} ta`
              }}
              scroll={{ x: 800 }}
              size="middle"
              className="custom-table"
            />
          </Card>
        </motion.div>
      )}
    </div>
  );
}
