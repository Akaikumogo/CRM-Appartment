/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Home,
  Users
} from 'lucide-react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Tag,
  Badge,
  Input,
  Select,
  Modal,
  Form,
  message,
  Statistic,
  Progress,
  Space,
  Tooltip
} from 'antd';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip
} from 'recharts';

const { Title, Text } = Typography;
const { Search: AntSearch } = Input;
const { Option } = Select;

// Block data type
export type BlockDto = {
  id: string;
  name: string;
  totalFloors: number;
  totalApartments: number;
  soldApartments: number;
  reservedApartments: number;
  availableApartments: number;
  totalRevenue: number;
  constructionStatus: 'planning' | 'construction' | 'completed';
  completionPercentage: number;
  startDate: string;
  expectedCompletionDate: string;
  description?: string;
  floors: FloorDto[];
};

export type FloorDto = {
  id: string;
  floorNumber: number;
  totalApartments: number;
  soldApartments: number;
  reservedApartments: number;
  availableApartments: number;
};

// Generate mock blocks
const generateMockBlocks = (): BlockDto[] => [
  {
    id: 'block-a',
    name: 'A Blok',
    totalFloors: 7,
    totalApartments: 42,
    soldApartments: 28,
    reservedApartments: 8,
    availableApartments: 6,
    totalRevenue: 2650000,
    constructionStatus: 'completed',
    completionPercentage: 100,
    startDate: '2022-01-15',
    expectedCompletionDate: '2023-12-20',
    description:
      'Lux darajadagi turar joy majmuasi, barcha zamonaviy qulayliklar bilan',
    floors: Array.from({ length: 7 }, (_, i) => ({
      id: `floor-a-${i + 1}`,
      floorNumber: i + 1,
      totalApartments: 6,
      soldApartments: Math.floor(Math.random() * 4) + 2,
      reservedApartments: Math.floor(Math.random() * 2) + 1,
      availableApartments: Math.floor(Math.random() * 2)
    }))
  },
  {
    id: 'block-b',
    name: 'B Blok',
    totalFloors: 10,
    totalApartments: 70,
    soldApartments: 45,
    reservedApartments: 15,
    availableApartments: 10,
    totalRevenue: 4200000,
    constructionStatus: 'completed',
    completionPercentage: 100,
    startDate: '2022-03-01',
    expectedCompletionDate: '2024-02-15',
    description: 'Oilaviy turar joy, keng xonalar va yashil hudud',
    floors: Array.from({ length: 10 }, (_, i) => ({
      id: `floor-b-${i + 1}`,
      floorNumber: i + 1,
      totalApartments: 7,
      soldApartments: Math.floor(Math.random() * 5) + 2,
      reservedApartments: Math.floor(Math.random() * 3) + 1,
      availableApartments: Math.floor(Math.random() * 3)
    }))
  },
  {
    id: 'block-c',
    name: 'C Blok',
    totalFloors: 8,
    totalApartments: 48,
    soldApartments: 32,
    reservedApartments: 10,
    availableApartments: 6,
    totalRevenue: 3100000,
    constructionStatus: 'construction',
    completionPercentage: 75,
    startDate: '2023-01-10',
    expectedCompletionDate: '2024-08-30',
    description: 'Zamonaviy arxitektura va energiya tejamkor texnologiyalar',
    floors: Array.from({ length: 8 }, (_, i) => ({
      id: `floor-c-${i + 1}`,
      floorNumber: i + 1,
      totalApartments: 6,
      soldApartments: Math.floor(Math.random() * 4) + 1,
      reservedApartments: Math.floor(Math.random() * 2) + 1,
      availableApartments: Math.floor(Math.random() * 3)
    }))
  },
  {
    id: 'block-d',
    name: 'D Blok',
    totalFloors: 6,
    totalApartments: 36,
    soldApartments: 15,
    reservedApartments: 12,
    availableApartments: 9,
    totalRevenue: 1450000,
    constructionStatus: 'planning',
    completionPercentage: 25,
    startDate: '2023-06-01',
    expectedCompletionDate: '2025-03-15',
    description: "Premium segment, panoramik ko'rinish va VIP xizmatlar",
    floors: Array.from({ length: 6 }, (_, i) => ({
      id: `floor-d-${i + 1}`,
      floorNumber: i + 1,
      totalApartments: 6,
      soldApartments: Math.floor(Math.random() * 3),
      reservedApartments: Math.floor(Math.random() * 3) + 1,
      availableApartments: Math.floor(Math.random() * 4) + 1
    }))
  }
];

export default function BlocksPage() {
  const [blocks, setBlocks] = useState<BlockDto[]>([]);
  const [filteredBlocks, setFilteredBlocks] = useState<BlockDto[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [form] = Form.useForm();

  useEffect(() => {
    const mockData = generateMockBlocks();
    setBlocks(mockData);
    setFilteredBlocks(mockData);
  }, []);

  // Filter blocks
  useEffect(() => {
    let filtered = blocks;

    if (searchTerm) {
      filtered = filtered.filter(
        (block) =>
          block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          block.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (block) => block.constructionStatus === statusFilter
      );
    }

    setFilteredBlocks(filtered);
  }, [blocks, searchTerm, statusFilter]);

  // Statistics
  const stats = {
    totalBlocks: blocks.length,
    totalApartments: blocks.reduce((acc, b) => acc + b.totalApartments, 0),
    totalSold: blocks.reduce((acc, b) => acc + b.soldApartments, 0),
    totalRevenue: blocks.reduce((acc, b) => acc + b.totalRevenue, 0),
    completedBlocks: blocks.filter((b) => b.constructionStatus === 'completed')
      .length,
    avgCompletion: Math.round(
      blocks.reduce((acc, b) => acc + b.completionPercentage, 0) / blocks.length
    )
  };

  // Status colors
  const getStatusColor = (status: string) => {
    const colors = {
      planning: '#f59e0b',
      construction: '#3b82f6',
      completed: '#10b981'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const getStatusText = (status: string) => {
    const texts = {
      planning: 'Rejalashtirilmoqda',
      construction: 'Qurilmoqda',
      completed: 'Tugallangan'
    };
    return texts[status as keyof typeof texts] || status;
  };

  // // Chart data
  // const pieChartData = blocks.map((block) => ({
  //   name: block.name,
  //   sold: block.soldApartments,
  //   reserved: block.reservedApartments,
  //   available: block.availableApartments
  // }));

  const barChartData = blocks.map((block) => ({
    name: block.name,
    sold: block.soldApartments,
    reserved: block.reservedApartments,
    available: block.availableApartments,
    total: block.totalApartments
  }));

  // Table columns
  const columns = [
    {
      title: 'Blok',
      key: 'block',
      render: (record: BlockDto) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#6bd2bc] to-[#4ade80] rounded-lg flex items-center justify-center">
            <Building2
              size={24}
              className="text-slate-600 dark:text-slate-400"
            />
          </div>
          <div>
            <div className="font-medium text-slate-900 dark:text-white text-lg">
              {record.name}
            </div>
            <div className="text-sm text-slate-500">
              {record.totalFloors} qavat • {record.totalApartments} kvartira
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Holat',
      dataIndex: 'constructionStatus',
      key: 'constructionStatus',
      render: (status: string, record: BlockDto) => (
        <div>
          <Tag
            color={getStatusColor(status)}
            style={{ color: 'white', border: 'none', marginBottom: '4px' }}
          >
            {getStatusText(status)}
          </Tag>
          <div>
            <Progress
              percent={record.completionPercentage}
              size="small"
              strokeColor={getStatusColor(status)}
              showInfo={false}
            />
            <Text className="text-xs text-slate-500">
              {record.completionPercentage}% tugallangan
            </Text>
          </div>
        </div>
      ),
      filters: [
        { text: 'Rejalashtirilmoqda', value: 'planning' },
        { text: 'Qurilmoqda', value: 'construction' },
        { text: 'Tugallangan', value: 'completed' }
      ],
      onFilter: (value: any, record: BlockDto) =>
        record.constructionStatus === value
    },
    {
      title: 'Sotuvlar',
      key: 'sales',
      render: (record: BlockDto) => {
        const soldPercentage = Math.round(
          (record.soldApartments / record.totalApartments) * 100
        );
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-600">
                Sotilgan: {record.soldApartments}
              </span>
              <span className="text-blue-600">
                Bron: {record.reservedApartments}
              </span>
              <span className="text-slate-500">
                Mavjud: {record.availableApartments}
              </span>
            </div>
            <Progress
              percent={soldPercentage}
              strokeColor="#10b981"
              trailColor="#e2e8f0"
              size="small"
            />
          </div>
        );
      },
      sorter: (a: BlockDto, b: BlockDto) => a.soldApartments - b.soldApartments
    },
    {
      title: 'Daromad',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (revenue: number) => (
        <div className="text-right">
          <div className="font-semibold text-green-600 text-lg">
            ${revenue.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">USD</div>
        </div>
      ),
      sorter: (a: BlockDto, b: BlockDto) => a.totalRevenue - b.totalRevenue
    },
    {
      title: 'Muddat',
      key: 'timeline',
      render: (record: BlockDto) => (
        <div className="text-sm">
          <div className="text-slate-900 dark:text-white">
            Boshlangan: {new Date(record.startDate).toLocaleDateString('uz-UZ')}
          </div>
          <div className="text-slate-500">
            Tugash:{' '}
            {new Date(record.expectedCompletionDate).toLocaleDateString(
              'uz-UZ'
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (record: BlockDto) => (
        <Space>
          <Tooltip title="Ko'rish">
            <Button
              type="text"
              icon={<Eye size={16} />}
              onClick={() => {
                setSelectedBlock(record);
                setIsViewModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Tahrirlash">
            <Button type="text" icon={<Edit size={16} />} />
          </Tooltip>
        </Space>
      )
    }
  ];

  const handleAddBlock = (values: any) => {
    const newBlock: BlockDto = {
      id: `block-${Date.now()}`,
      ...values,
      totalApartments: values.totalFloors * 6, // Assuming 6 apartments per floor
      soldApartments: 0,
      reservedApartments: 0,
      availableApartments: values.totalFloors * 6,
      totalRevenue: 0,
      completionPercentage: 0,
      floors: []
    };
    setBlocks([...blocks, newBlock]);
    setIsAddModalVisible(false);
    form.resetFields();
    message.success("Blok muvaffaqiyatli qo'shildi!");
  };

  return (
    <div className="p-2 space-y-6 min-h-full">
      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={6}>
            <Card className="bg-gradient-to-br from-[#6fe0c8] to-[#419380da] border-0 text-white">
              <Statistic
                className="text-slate-600 dark:text-slate-400"
                title={
                  <span className="text-slate-600 dark:text-slate-400">
                    Jami Bloklar
                  </span>
                }
                value={stats.totalBlocks}
                prefix={
                  <Building2 className="text-slate-600 dark:text-slate-400" />
                }
                valueStyle={{
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="bg-gradient-to-br from-blue-400 to-blue-600 border-0 text-white">
              <Statistic
                className="text-slate-600 dark:text-slate-400"
                title={
                  <span className="text-slate-600 dark:text-slate-400">
                    Jami Kvartiralar
                  </span>
                }
                value={stats.totalApartments}
                prefix={<Home className="text-slate-600 dark:text-slate-400" />}
                valueStyle={{
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="bg-gradient-to-br from-green-400 to-green-600 border-0 text-white">
              <Statistic
                className="text-slate-600 dark:text-slate-400"
                title={
                  <span className="text-slate-600 dark:text-slate-400">
                    Sotilgan
                  </span>
                }
                value={stats.totalSold}
                prefix={
                  <Users className="text-slate-600 dark:text-slate-400" />
                }
                valueStyle={{
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="bg-gradient-to-br from-purple-400 to-purple-600 border-0 text-white">
              <Statistic
                className="text-slate-600 dark:text-slate-400"
                title={
                  <span className="text-slate-600 dark:text-slate-400">
                    Jami Daromad
                  </span>
                }
                value={stats.totalRevenue}
                prefix="$"
                valueStyle={{
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
                formatter={(value) => `${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
        </Row>
      </motion.div>

      <Row gutter={[24, 24]}>
        {/* Charts */}
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
                  Bloklarga Bo'yicha Sotuvlar
                </Title>
              }
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <RechartsTooltip />
                  <Bar dataKey="sold" fill="#10b981" name="Sotilgan" />
                  <Bar dataKey="reserved" fill="#3b82f6" name="Bron" />
                  <Bar dataKey="available" fill="#6bd2bc" name="Mavjud" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Col>

        {/* Filters */}
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800 mb-6">
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12}>
                  <AntSearch
                    placeholder="Blok nomi yoki tavsif bo'yicha qidirish..."
                    allowClear
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    prefix={<Search size={16} />}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Select
                    placeholder="Holat"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: '100%' }}
                    suffixIcon={<Filter size={16} />}
                  >
                    <Option value="all">Barcha holatlar</Option>
                    <Option value="planning">Rejalashtirilmoqda</Option>
                    <Option value="construction">Qurilmoqda</Option>
                    <Option value="completed">Tugallangan</Option>
                  </Select>
                </Col>
              </Row>
            </Card>

            {/* Quick Stats */}
            <Card
              className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800"
              title={
                <Title
                  level={4}
                  className="!text-slate-900 dark:!text-white !mb-0"
                >
                  Tezkor Ma'lumotlar
                </Title>
              }
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Text>Tugallangan bloklar:</Text>
                  <Badge
                    count={stats.completedBlocks}
                    style={{ backgroundColor: '#10b981' }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Text>O'rtacha tugallanish:</Text>
                  <Text className="font-semibold text-[#6bd2bc]">
                    {stats.avgCompletion}%
                  </Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text>Sotilish foizi:</Text>
                  <Text className="font-semibold text-green-600">
                    {Math.round(
                      (stats.totalSold / stats.totalApartments) * 100
                    )}
                    %
                  </Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text>O'rtacha narx:</Text>
                  <Text className="font-semibold text-purple-600">
                    $
                    {Math.round(
                      stats.totalRevenue / stats.totalSold
                    ).toLocaleString()}
                  </Text>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Blocks Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card
          className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800"
          title={
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-end">
                <Title
                  level={4}
                  className="!text-slate-900 dark:!text-white !mb-0"
                >
                  Bloklar Ro'yxati
                </Title>
                <Text className="text-slate-600 dark:text-slate-400">
                  Jami: {filteredBlocks.length} ta blok
                </Text>{' '}
              </div>
              <Button
                type="primary"
                size="large"
                icon={<Plus size={18} />}
                onClick={() => setIsAddModalVisible(true)}
                style={{
                  background: '#6bd2bc',
                  border: 'none'
                }}
              >
                Yangi Blok
              </Button>
            </div>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredBlocks}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} / ${total} ta`
            }}
            scroll={{ x: 1000 }}
            size="middle"
          />
        </Card>
      </motion.div>

      {/* Add Block Modal */}
      <Modal
        title="Yangi Blok Qo'shish"
        open={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Saqlash"
        cancelText="Bekor qilish"
        okButtonProps={{
          style: { backgroundColor: '#6bd2bc', border: 'none' }
        }}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleAddBlock}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Blok nomi"
                rules={[{ required: true, message: 'Blok nomini kiriting' }]}
              >
                <Input placeholder="A Blok" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="totalFloors"
                label="Qavatlar soni"
                rules={[
                  { required: true, message: 'Qavatlar sonini kiriting' }
                ]}
              >
                <Input type="number" placeholder="7" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="constructionStatus"
                label="Qurilish holati"
                rules={[{ required: true, message: 'Holatni tanlang' }]}
              >
                <Select placeholder="Holatni tanlang">
                  <Option value="planning">Rejalashtirilmoqda</Option>
                  <Option value="construction">Qurilmoqda</Option>
                  <Option value="completed">Tugallangan</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="completionPercentage"
                label="Tugallanish foizi"
                rules={[{ required: true, message: 'Foizni kiriting' }]}
              >
                <Input type="number" placeholder="75" suffix="%" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Boshlash sanasi"
                rules={[{ required: true, message: 'Sanani kiriting' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expectedCompletionDate"
                label="Tugash sanasi"
                rules={[{ required: true, message: 'Sanani kiriting' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Tavsif">
            <Input.TextArea
              rows={3}
              placeholder="Blok haqida qisqacha ma'lumot..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Block Modal */}
      <Modal
        title="Blok Tafsilotlari"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Yopish
          </Button>
        ]}
        width={800}
      >
        {selectedBlock && (
          <div className="space-y-6">
            {/* Block Header */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#6bd2bc]/10 to-blue-500/10 rounded-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6bd2bc] to-[#4ade80] rounded-lg flex items-center justify-center">
                <Building2
                  size={32}
                  className="text-slate-600 dark:text-slate-400"
                />
              </div>
              <div className="flex-1">
                <Title level={3} className="!mb-1">
                  {selectedBlock.name}
                </Title>
                <Text className="text-slate-600">
                  {selectedBlock.description}
                </Text>
                <div className="mt-2">
                  <Tag
                    color={getStatusColor(selectedBlock.constructionStatus)}
                    style={{ color: 'white', border: 'none' }}
                  >
                    {getStatusText(selectedBlock.constructionStatus)}
                  </Tag>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${selectedBlock.totalRevenue.toLocaleString()}
                </div>
                <Text className="text-slate-600">Jami daromad</Text>
              </div>
            </div>

            {/* Statistics */}
            <Row gutter={16}>
              <Col span={6}>
                <Card size="small" className="text-center">
                  <Statistic
                    title="Qavatlar"
                    value={selectedBlock.totalFloors}
                    valueStyle={{ color: '#6bd2bc' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" className="text-center">
                  <Statistic
                    title="Kvartiralar"
                    value={selectedBlock.totalApartments}
                    valueStyle={{ color: '#3b82f6' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" className="text-center">
                  <Statistic
                    title="Sotilgan"
                    value={selectedBlock.soldApartments}
                    valueStyle={{ color: '#10b981' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" className="text-center">
                  <Statistic
                    title="Tugallanish"
                    value={selectedBlock.completionPercentage}
                    suffix="%"
                    valueStyle={{ color: '#f59e0b' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Text strong>Qurilish jarayoni:</Text>
                <Text>{selectedBlock.completionPercentage}%</Text>
              </div>
              <Progress
                percent={selectedBlock.completionPercentage}
                strokeColor={getStatusColor(selectedBlock.constructionStatus)}
              />
            </div>

            {/* Sales Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Text strong>Sotuvlar jarayoni:</Text>
                <Text>
                  {Math.round(
                    (selectedBlock.soldApartments /
                      selectedBlock.totalApartments) *
                      100
                  )}
                  %
                </Text>
              </div>
              <Progress
                percent={Math.round(
                  (selectedBlock.soldApartments /
                    selectedBlock.totalApartments) *
                    100
                )}
                strokeColor="#10b981"
              />
              <div className="flex justify-between text-sm mt-2">
                <span className="text-green-600">
                  Sotilgan: {selectedBlock.soldApartments}
                </span>
                <span className="text-blue-600">
                  Bron: {selectedBlock.reservedApartments}
                </span>
                <span className="text-slate-500">
                  Mavjud: {selectedBlock.availableApartments}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Text strong className="text-slate-600">
                    Boshlash sanasi:
                  </Text>
                  <div className="mt-1">
                    {new Date(selectedBlock.startDate).toLocaleDateString(
                      'uz-UZ'
                    )}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong className="text-slate-600">
                    Tugash sanasi:
                  </Text>
                  <div className="mt-1">
                    {new Date(
                      selectedBlock.expectedCompletionDate
                    ).toLocaleDateString('uz-UZ')}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}
