/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Home,
  Building2,
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

const { Title, Text } = Typography;
const { Search: AntSearch } = Input;
const { Option } = Select;

// Floor data type
export type FloorDetailDto = {
  id: string;
  floorNumber: number;
  blockName: string;
  blockId: string;
  totalApartments: number;
  soldApartments: number;
  reservedApartments: number;
  availableApartments: number;
  totalRevenue: number;
  avgPrice: number;
  floorPlan?: string;
  description?: string;
  apartments: ApartmentSummaryDto[];
};

export type ApartmentSummaryDto = {
  id: string;
  apartmentNumber: string;
  rooms: number;
  area: number;
  price: number;
  status: 'available' | 'reserved' | 'sold';
  clientName?: string;
};

// Generate mock floors
const generateMockFloors = (): FloorDetailDto[] => {
  const blocks = ['A Blok', 'B Blok', 'C Blok', 'D Blok'];
  const floors: FloorDetailDto[] = [];

  blocks.forEach((blockName, blockIndex) => {
    const floorCount =
      blockIndex === 1 ? 10 : blockIndex === 2 ? 8 : blockIndex === 3 ? 6 : 7;

    for (let floor = 1; floor <= floorCount; floor++) {
      const apartments: ApartmentSummaryDto[] = [];
      const apartmentCount = 6;

      for (let apt = 1; apt <= apartmentCount; apt++) {
        const statuses = ['available', 'reserved', 'sold'] as const;
        const status = statuses[Math.floor(Math.random() * 3)];

        apartments.push({
          id: `apt-${blockName.charAt(0).toLowerCase()}-${floor}-${apt}`,
          apartmentNumber: `${blockName.charAt(0)}-${floor}-${apt
            .toString()
            .padStart(2, '0')}`,
          rooms: Math.floor(Math.random() * 3) + 1, // 1-3 rooms
          area: Math.floor(Math.random() * 40) + 45, // 45-85 sqm
          price: Math.floor(Math.random() * 50000) + 70000, // 70k-120k
          status,
          clientName:
            status === 'sold'
              ? `Mijoz ${Math.floor(Math.random() * 100)}`
              : undefined
        });
      }

      const soldCount = apartments.filter((a) => a.status === 'sold').length;
      const reservedCount = apartments.filter(
        (a) => a.status === 'reserved'
      ).length;
      const availableCount = apartments.filter(
        (a) => a.status === 'available'
      ).length;
      const totalRevenue = apartments
        .filter((a) => a.status === 'sold')
        .reduce((sum, a) => sum + a.price, 0);

      floors.push({
        id: `floor-${blockName.charAt(0).toLowerCase()}-${floor}`,
        floorNumber: floor,
        blockName,
        blockId: `block-${blockName.charAt(0).toLowerCase()}`,
        totalApartments: apartmentCount,
        soldApartments: soldCount,
        reservedApartments: reservedCount,
        availableApartments: availableCount,
        totalRevenue,
        avgPrice: soldCount > 0 ? Math.round(totalRevenue / soldCount) : 0,
        description: `${blockName} ${floor}-qavat, zamonaviy planirovka`,
        apartments
      });
    }
  });

  return floors;
};

export default function FloorsPage() {
  const [floors, setFloors] = useState<FloorDetailDto[]>([]);
  const [filteredFloors, setFilteredFloors] = useState<FloorDetailDto[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<FloorDetailDto | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [blockFilter, setBlockFilter] = useState<string>('all');
  const [form] = Form.useForm();

  useEffect(() => {
    const mockData = generateMockFloors();
    setFloors(mockData);
    setFilteredFloors(mockData);
  }, []);

  // Filter floors
  useEffect(() => {
    let filtered = floors;

    if (searchTerm) {
      filtered = filtered.filter(
        (floor) =>
          floor.blockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          floor.floorNumber.toString().includes(searchTerm)
      );
    }

    if (blockFilter !== 'all') {
      filtered = filtered.filter((floor) => floor.blockName === blockFilter);
    }

    setFilteredFloors(filtered);
  }, [floors, searchTerm, blockFilter]);

  // Statistics
  const stats = {
    totalFloors: floors.length,
    totalApartments: floors.reduce((acc, f) => acc + f.totalApartments, 0),
    totalSold: floors.reduce((acc, f) => acc + f.soldApartments, 0),
    totalRevenue: floors.reduce((acc, f) => acc + f.totalRevenue, 0),
    avgOccupancy: Math.round(
      (floors.reduce(
        (acc, f) => acc + f.soldApartments + f.reservedApartments,
        0
      ) /
        floors.reduce((acc, f) => acc + f.totalApartments, 0)) *
        100
    )
  };

  // Get unique blocks for filter
  const uniqueBlocks = Array.from(new Set(floors.map((f) => f.blockName)));

  // Status colors
  const getStatusColor = (status: string) => {
    const colors = {
      available: '#6bd2bc',
      reserved: '#3b82f6',
      sold: '#10b981'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  // Apartment columns for expanded view
  const apartmentColumns = [
    {
      title: 'Kvartira',
      dataIndex: 'apartmentNumber',
      key: 'apartmentNumber',
      render: (number: string) => (
        <div className="flex items-center gap-2">
          <Home size={16} className="text-slate-400" />
          <Text className="font-medium text-slate-900 dark:text-white">
            {number}
          </Text>
        </div>
      )
    },
    {
      title: 'Xonalar',
      dataIndex: 'rooms',
      key: 'rooms',
      render: (rooms: number) => <Text>{rooms} xona</Text>
    },
    {
      title: 'Maydon',
      dataIndex: 'area',
      key: 'area',
      render: (area: number) => <Text>{area} m²</Text>
    },
    {
      title: 'Narx',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <Text className="font-semibold text-green-600">
          ${price.toLocaleString()}
        </Text>
      )
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusText = {
          available: 'Mavjud',
          reserved: 'Bron',
          sold: 'Sotilgan'
        };
        return (
          <Tag
            color={getStatusColor(status)}
            style={{ color: 'white', border: 'none' }}
          >
            {statusText[status as keyof typeof statusText]}
          </Tag>
        );
      }
    },
    {
      title: 'Mijoz',
      dataIndex: 'clientName',
      key: 'clientName',
      render: (name: string) => name || '-'
    }
  ];

  // Main table columns
  const columns = [
    {
      title: 'Qavat',
      key: 'floor',
      render: (record: FloorDetailDto) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#6bd2bc] to-[#4ade80] rounded-lg flex items-center justify-center">
            <Layers size={20} className="text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <div className="font-medium text-slate-900 dark:text-white text-lg">
              {record.floorNumber}-qavat
            </div>
            <div className="text-sm text-slate-500">{record.blockName}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Blok',
      dataIndex: 'blockName',
      key: 'blockName',
      render: (blockName: string) => (
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-slate-400" />
          <Text className="font-medium text-slate-900 dark:text-white">
            {blockName}
          </Text>
        </div>
      ),
      filters: uniqueBlocks.map((block) => ({ text: block, value: block })),
      onFilter: (value: any, record: FloorDetailDto) =>
        record.blockName === value
    },
    {
      title: 'Kvartiralar',
      key: 'apartments',
      render: (record: FloorDetailDto) => (
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
            percent={Math.round(
              (record.soldApartments / record.totalApartments) * 100
            )}
            strokeColor="#10b981"
            trailColor="#e2e8f0"
            size="small"
          />
          <Text className="text-xs text-slate-500">
            {record.totalApartments} ta kvartira
          </Text>
        </div>
      )
    },
    {
      title: 'Daromad',
      key: 'revenue',
      render: (record: FloorDetailDto) => (
        <div className="text-right">
          <div className="font-semibold text-green-600 text-lg">
            ${record.totalRevenue.toLocaleString()}
          </div>
          {record.avgPrice > 0 && (
            <div className="text-xs text-slate-500">
              O'rtacha: ${record.avgPrice.toLocaleString()}
            </div>
          )}
        </div>
      ),
      sorter: (a: FloorDetailDto, b: FloorDetailDto) =>
        a.totalRevenue - b.totalRevenue
    },
    {
      title: 'Band etilganlik',
      key: 'occupancy',
      render: (record: FloorDetailDto) => {
        const occupancy = Math.round(
          ((record.soldApartments + record.reservedApartments) /
            record.totalApartments) *
            100
        );
        return (
          <div className="text-center">
            <div className="text-2xl font-bold text-[#6bd2bc]">
              {occupancy}%
            </div>
            <div className="text-xs text-slate-500">band etilgan</div>
          </div>
        );
      },
      sorter: (a: FloorDetailDto, b: FloorDetailDto) =>
        (a.soldApartments + a.reservedApartments) / a.totalApartments -
        (b.soldApartments + b.reservedApartments) / b.totalApartments
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (record: FloorDetailDto) => (
        <Space>
          <Tooltip title="Ko'rish">
            <Button
              type="text"
              icon={<Eye size={16} />}
              onClick={() => {
                setSelectedFloor(record);
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

  const handleAddFloor = (_values: any) => {
    message.success("Qavat muvaffaqiyatli qo'shildi!");
    setIsAddModalVisible(false);
    form.resetFields();
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
                    Jami Qavatlar
                  </span>
                }
                value={stats.totalFloors}
                prefix={
                  <Layers className="text-slate-600 dark:text-slate-400" />
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
                    Band etilganlik
                  </span>
                }
                value={stats.avgOccupancy}
                suffix="%"
                valueStyle={{
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
        </Row>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <AntSearch
                placeholder="Blok nomi yoki qavat raqami bo'yicha qidirish..."
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<Search size={16} />}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Select
                placeholder="Blok"
                value={blockFilter}
                onChange={setBlockFilter}
                style={{ width: '100%' }}
                suffixIcon={<Filter size={16} />}
              >
                <Option value="all">Barcha bloklar</Option>
                {uniqueBlocks.map((block) => (
                  <Option key={block} value={block}>
                    {block}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={10}>
              <div className="flex justify-end">
                <Text className="text-slate-600 dark:text-slate-400">
                  Jami: {filteredFloors.length} ta qavat •{' '}
                  {stats.totalApartments} ta kvartira
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Floors Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card
          className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800"
          title={
            <div className="flex items-center justify-between">
              <Title
                level={4}
                className="!text-slate-900 dark:!text-white !mb-0"
              >
                Qavatlar Ro'yxati
              </Title>
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
                Yangi Qavat
              </Button>
            </div>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredFloors}
            rowKey="id"
            expandable={{
              expandedRowRender: (record) => (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <Title
                    level={5}
                    className="!text-slate-900 dark:!text-white !mb-4"
                  >
                    {record.blockName} {record.floorNumber}-qavat kvartiralar (
                    {record.totalApartments} ta)
                  </Title>
                  <Table
                    columns={apartmentColumns}
                    dataSource={record.apartments}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    className="nested-table"
                  />
                </div>
              ),
              expandIcon: ({ expanded, onExpand, record }) => (
                <Button
                  type="text"
                  size="small"
                  onClick={(e) => onExpand(record, e)}
                  style={{ color: '#6bd2bc' }}
                >
                  {expanded
                    ? 'Yashirish'
                    : `${record.totalApartments} ta ko'rish`}
                </Button>
              )
            }}
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

      {/* Add Floor Modal */}
      <Modal
        title="Yangi Qavat Qo'shish"
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
        <Form form={form} layout="vertical" onFinish={handleAddFloor}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="blockName"
                label="Blok"
                rules={[{ required: true, message: 'Blokni tanlang' }]}
              >
                <Select placeholder="Blokni tanlang">
                  {uniqueBlocks.map((block) => (
                    <Option key={block} value={block}>
                      {block}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="floorNumber"
                label="Qavat raqami"
                rules={[{ required: true, message: 'Qavat raqamini kiriting' }]}
              >
                <Input type="number" placeholder="1" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="totalApartments"
            label="Kvartiralar soni"
            rules={[{ required: true, message: 'Kvartiralar sonini kiriting' }]}
          >
            <Input type="number" placeholder="6" />
          </Form.Item>

          <Form.Item name="description" label="Tavsif">
            <Input.TextArea
              rows={3}
              placeholder="Qavat haqida qisqacha ma'lumot..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Floor Modal */}
      <Modal
        title="Qavat Tafsilotlari"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Yopish
          </Button>
        ]}
        width={900}
      >
        {selectedFloor && (
          <div className="space-y-6">
            {/* Floor Header */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#6bd2bc]/10 to-blue-500/10 rounded-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6bd2bc] to-[#4ade80] rounded-lg flex items-center justify-center">
                <Layers
                  size={32}
                  className="text-slate-600 dark:text-slate-400"
                />
              </div>
              <div className="flex-1">
                <Title level={3} className="!mb-1">
                  {selectedFloor.blockName} {selectedFloor.floorNumber}-qavat
                </Title>
                <Text className="text-slate-600">
                  {selectedFloor.description}
                </Text>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${selectedFloor.totalRevenue.toLocaleString()}
                </div>
                <Text className="text-slate-600">Jami daromad</Text>
              </div>
            </div>

            {/* Statistics */}
            <Row gutter={16}>
              <Col span={6}>
                <Card size="small" className="text-center">
                  <Statistic
                    title="Jami kvartiralar"
                    value={selectedFloor.totalApartments}
                    valueStyle={{ color: '#6bd2bc' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" className="text-center">
                  <Statistic
                    title="Sotilgan"
                    value={selectedFloor.soldApartments}
                    valueStyle={{ color: '#10b981' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" className="text-center">
                  <Statistic
                    title="Bron qilingan"
                    value={selectedFloor.reservedApartments}
                    valueStyle={{ color: '#3b82f6' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" className="text-center">
                  <Statistic
                    title="Mavjud"
                    value={selectedFloor.availableApartments}
                    valueStyle={{ color: '#f59e0b' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Apartments Table */}
            <Card title="Kvartiralar Ro'yxati" size="small">
              <Table
                columns={apartmentColumns}
                dataSource={selectedFloor.apartments}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}
