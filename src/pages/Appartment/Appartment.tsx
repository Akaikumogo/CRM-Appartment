/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Plus, Search, Eye, Edit, Phone, MapPin } from 'lucide-react';
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
  Space,
  Tooltip,
  Avatar,
  Descriptions,
  Image
} from 'antd';

const { Title, Text } = Typography;
const { Search: AntSearch } = Input;
const { Option } = Select;

// Apartment data type
export type ApartmentDetailDto = {
  id: string;
  apartmentNumber: string;
  blockName: string;
  floorNumber: number;
  rooms: number;
  area: number;
  price: number;
  status: 'available' | 'reserved' | 'sold';
  description?: string;
  features: string[];
  images: string[];
  floorPlan?: string;
  // Client info if sold/reserved
  clientInfo?: {
    name: string;
    phone: string;
    email?: string;
  };
  // Contract info if sold
  contractInfo?: {
    contractId: string;
    contractDate: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    sellerName: string;
  };
  // Reservation info if reserved
  reservationInfo?: {
    reservationDate: string;
    reservationAmount: number;
    expiryDate: string;
  };
};

// Generate mock apartments
const generateMockApartments = (): ApartmentDetailDto[] => {
  const blocks = ['A Blok', 'B Blok', 'C Blok', 'D Blok'];
  const apartments: ApartmentDetailDto[] = [];

  blocks.forEach((blockName, blockIndex) => {
    const floorCount =
      blockIndex === 1 ? 10 : blockIndex === 2 ? 8 : blockIndex === 3 ? 6 : 7;

    for (let floor = 1; floor <= floorCount; floor++) {
      for (let apt = 1; apt <= 6; apt++) {
        const statuses = ['available', 'reserved', 'sold'] as const;
        const status = statuses[Math.floor(Math.random() * 3)];
        const rooms = Math.floor(Math.random() * 3) + 1;
        const area = Math.floor(Math.random() * 40) + 45;
        const price = Math.floor(Math.random() * 50000) + 70000;

        const apartment: ApartmentDetailDto = {
          id: `apt-${blockName.charAt(0).toLowerCase()}-${floor}-${apt}`,
          apartmentNumber: `${blockName.charAt(0)}-${floor}-${apt
            .toString()
            .padStart(2, '0')}`,
          blockName,
          floorNumber: floor,
          rooms,
          area,
          price,
          status,
          description: `${rooms} xonali kvartira, ${area} m², zamonaviy remont`,
          features: [
            'Zamonaviy remont',
            'Panoramik oynalar',
            'Konditsioner',
            'Temir eshik',
            'Laminat pol',
            'Evropa planirovka'
          ].slice(0, Math.floor(Math.random() * 3) + 3),
          images: [
            '/placeholder.svg?height=300&width=400',
            '/placeholder.svg?height=300&width=400',
            '/placeholder.svg?height=300&width=400'
          ],
          floorPlan: '/placeholder.svg?height=400&width=600'
        };

        // Add client and contract info based on status
        if (status === 'sold') {
          apartment.clientInfo = {
            name: `Mijoz ${Math.floor(Math.random() * 100) + 1}`,
            phone: `+998901234${Math.floor(Math.random() * 1000)
              .toString()
              .padStart(3, '0')}`,
            email: `client${Math.floor(Math.random() * 100)}@email.com`
          };
          apartment.contractInfo = {
            contractId: `CNT-2024-${Math.floor(Math.random() * 100)
              .toString()
              .padStart(3, '0')}`,
            contractDate: new Date(
              2024,
              Math.floor(Math.random() * 12),
              Math.floor(Math.random() * 28) + 1
            )
              .toISOString()
              .split('T')[0],
            totalAmount: price,
            paidAmount: Math.floor(price * (0.5 + Math.random() * 0.5)),
            remainingAmount: 0,
            sellerName: ['Sardor Umarov', 'Dilshod Rahimov', 'Aziza Karimova'][
              Math.floor(Math.random() * 3)
            ]
          };
          apartment.contractInfo.remainingAmount =
            apartment.contractInfo.totalAmount -
            apartment.contractInfo.paidAmount;
        } else if (status === 'reserved') {
          apartment.clientInfo = {
            name: `Mijoz ${Math.floor(Math.random() * 100) + 1}`,
            phone: `+998901234${Math.floor(Math.random() * 1000)
              .toString()
              .padStart(3, '0')}`
          };
          apartment.reservationInfo = {
            reservationDate: new Date().toISOString().split('T')[0],
            reservationAmount: Math.floor(price * 0.1),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0]
          };
        }

        apartments.push(apartment);
      }
    }
  });

  return apartments;
};

export default function ApartmentsPage() {
  const [apartments, setApartments] = useState<ApartmentDetailDto[]>([]);
  const [filteredApartments, setFilteredApartments] = useState<
    ApartmentDetailDto[]
  >([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedApartment, setSelectedApartment] =
    useState<ApartmentDetailDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [blockFilter, setBlockFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roomsFilter, setRoomsFilter] = useState<string>('all');
  const [form] = Form.useForm();

  useEffect(() => {
    const mockData = generateMockApartments();
    setApartments(mockData);
    setFilteredApartments(mockData);
  }, []);

  // Filter apartments
  useEffect(() => {
    let filtered = apartments;

    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.apartmentNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          apt.blockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.clientInfo?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (blockFilter !== 'all') {
      filtered = filtered.filter((apt) => apt.blockName === blockFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    if (roomsFilter !== 'all') {
      filtered = filtered.filter((apt) => apt.rooms.toString() === roomsFilter);
    }

    setFilteredApartments(filtered);
  }, [apartments, searchTerm, blockFilter, statusFilter, roomsFilter]);

  // Statistics
  const stats = {
    total: apartments.length,
    available: apartments.filter((a) => a.status === 'available').length,
    reserved: apartments.filter((a) => a.status === 'reserved').length,
    sold: apartments.filter((a) => a.status === 'sold').length,
    totalRevenue: apartments
      .filter((a) => a.status === 'sold')
      .reduce((acc, a) => acc + a.price, 0),
    avgPrice: Math.round(
      apartments.reduce((acc, a) => acc + a.price, 0) / apartments.length
    ),
    avgArea: Math.round(
      apartments.reduce((acc, a) => acc + a.area, 0) / apartments.length
    )
  };

  // Get unique values for filters
  const uniqueBlocks = Array.from(new Set(apartments.map((a) => a.blockName)));
  const uniqueRooms = Array.from(
    new Set(apartments.map((a) => a.rooms.toString()))
  ).sort();

  // Status colors
  const getStatusColor = (status: string) => {
    const colors = {
      available: '#6bd2bc',
      reserved: '#3b82f6',
      sold: '#10b981'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const getStatusText = (status: string) => {
    const texts = {
      available: 'Mavjud',
      reserved: 'Bron qilingan',
      sold: 'Sotilgan'
    };
    return texts[status as keyof typeof texts] || status;
  };

  // Table columns
  const columns = [
    {
      title: 'Kvartira',
      key: 'apartment',
      render: (record: ApartmentDetailDto) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#6bd2bc] to-[#4ade80] rounded-lg flex items-center justify-center">
            <Home size={20} className="text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <div className="font-medium text-slate-900 dark:text-white text-lg">
              {record.apartmentNumber}
            </div>
            <div className="text-sm text-slate-500">
              {record.blockName} • {record.floorNumber}-qavat
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Xususiyatlar',
      key: 'specs',
      render: (record: ApartmentDetailDto) => (
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              <strong>{record.rooms}</strong> xona
            </span>
            <span className="text-sm text-slate-600">
              <strong>{record.area}</strong> m²
            </span>
          </div>
          <div className="text-xs text-slate-500">
            {record.features.slice(0, 2).join(', ')}
          </div>
        </div>
      )
    },
    {
      title: 'Narx',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <div className="text-right">
          <div className="font-semibold text-green-600 text-lg">
            ${price.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">USD</div>
        </div>
      ),
      sorter: (a: ApartmentDetailDto, b: ApartmentDetailDto) =>
        a.price - b.price
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag
          color={getStatusColor(status)}
          style={{ color: 'white', border: 'none' }}
        >
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: 'Mavjud', value: 'available' },
        { text: 'Bron qilingan', value: 'reserved' },
        { text: 'Sotilgan', value: 'sold' }
      ],
      onFilter: (value: any, record: ApartmentDetailDto) =>
        record.status === value
    },
    {
      title: 'Mijoz',
      key: 'client',
      render: (record: ApartmentDetailDto) => {
        if (!record.clientInfo) return '-';
        return (
          <div className="flex items-center gap-2">
            <Avatar size="small" style={{ backgroundColor: '#6bd2bc' }}>
              {record.clientInfo.name.charAt(0)}
            </Avatar>
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                {record.clientInfo.name}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Phone size={10} />
                {record.clientInfo.phone}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      title: "To'lov",
      key: 'payment',
      render: (record: ApartmentDetailDto) => {
        if (record.status === 'available') return '-';
        if (record.status === 'reserved' && record.reservationInfo) {
          return (
            <div className="text-center">
              <div className="text-sm font-medium text-blue-600">
                ${record.reservationInfo.reservationAmount.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">bron to'lovi</div>
            </div>
          );
        }
        if (record.status === 'sold' && record.contractInfo) {
          const percentage = Math.round(
            (record.contractInfo.paidAmount / record.contractInfo.totalAmount) *
              100
          );
          return (
            <div className="text-center">
              <div className="text-sm font-medium text-green-600">
                {percentage}%
              </div>
              <div className="text-xs text-slate-500">
                ${record.contractInfo.paidAmount.toLocaleString()} / $
                {record.contractInfo.totalAmount.toLocaleString()}
              </div>
            </div>
          );
        }
        return '-';
      }
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (record: ApartmentDetailDto) => (
        <Space>
          <Tooltip title="Ko'rish">
            <Button
              type="text"
              icon={<Eye size={16} />}
              onClick={() => {
                setSelectedApartment(record);
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

  const handleAddApartment = (_values: any) => {
    message.success("Kvartira muvaffaqiyatli qo'shildi!");
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
                    Jami Kvartiralar
                  </span>
                }
                value={stats.total}
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
                value={stats.sold}
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
                    Bron qilingan
                  </span>
                }
                value={stats.reserved}
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
                    Mavjud
                  </span>
                }
                value={stats.available}
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
            <Col xs={24} sm={6}>
              <AntSearch
                placeholder="Kvartira raqami yoki mijoz ismi..."
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<Search size={16} />}
              />
            </Col>
            <Col xs={24} sm={4}>
              <Select
                placeholder="Blok"
                value={blockFilter}
                onChange={setBlockFilter}
                style={{ width: '100%' }}
              >
                <Option value="all">Barcha bloklar</Option>
                {uniqueBlocks.map((block) => (
                  <Option key={block} value={block}>
                    {block}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={4}>
              <Select
                placeholder="Holat"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
              >
                <Option value="all">Barcha holatlar</Option>
                <Option value="available">Mavjud</Option>
                <Option value="reserved">Bron qilingan</Option>
                <Option value="sold">Sotilgan</Option>
              </Select>
            </Col>
            <Col xs={24} sm={4}>
              <Select
                placeholder="Xonalar"
                value={roomsFilter}
                onChange={setRoomsFilter}
                style={{ width: '100%' }}
              >
                <Option value="all">Barcha xonalar</Option>
                {uniqueRooms.map((rooms) => (
                  <Option key={rooms} value={rooms}>
                    {rooms} xona
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={6}>
              <div className="flex justify-end">
                <Text className="text-slate-600 dark:text-slate-400">
                  Jami: {filteredApartments.length} ta kvartira
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card size="small" className="text-center">
              <Statistic
                className="text-slate-600 dark:text-slate-400"
                title="O'rtacha narx"
                value={stats.avgPrice}
                prefix="$"
                valueStyle={{ color: '#10b981' }}
                formatter={(value) => `${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" className="text-center">
              <Statistic
                className="text-slate-600 dark:text-slate-400"
                title="O'rtacha maydon"
                value={stats.avgArea}
                suffix="m²"
                valueStyle={{ color: '#6bd2bc' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" className="text-center">
              <Statistic
                className="text-slate-600 dark:text-slate-400"
                title="Jami daromad"
                value={stats.totalRevenue}
                prefix="$"
                valueStyle={{ color: '#8b5cf6' }}
                formatter={(value) => `${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
        </Row>
      </motion.div>

      {/* Apartments Table */}
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
                Kvartiralar Ro'yxati
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
                Yangi Kvartira
              </Button>
            </div>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredApartments}
            rowKey="id"
            pagination={{
              pageSize: 15,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} / ${total} ta`
            }}
            scroll={{ x: 1200 }}
            size="middle"
          />
        </Card>
      </motion.div>

      {/* Add Apartment Modal */}
      <Modal
        title="Yangi Kvartira Qo'shish"
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
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleAddApartment}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="apartmentNumber"
                label="Kvartira raqami"
                rules={[
                  { required: true, message: 'Kvartira raqamini kiriting' }
                ]}
              >
                <Input placeholder="A-1-01" />
              </Form.Item>
            </Col>
            <Col span={8}>
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
            <Col span={8}>
              <Form.Item
                name="floorNumber"
                label="Qavat"
                rules={[{ required: true, message: 'Qavat raqamini kiriting' }]}
              >
                <Input type="number" placeholder="1" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="rooms"
                label="Xonalar soni"
                rules={[{ required: true, message: 'Xonalar sonini kiriting' }]}
              >
                <Select placeholder="Xonalar soni">
                  <Option value={1}>1 xona</Option>
                  <Option value={2}>2 xona</Option>
                  <Option value={3}>3 xona</Option>
                  <Option value={4}>4 xona</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="area"
                label="Maydon (m²)"
                rules={[{ required: true, message: 'Maydonni kiriting' }]}
              >
                <Input type="number" placeholder="65" suffix="m²" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Narx"
                rules={[{ required: true, message: 'Narxni kiriting' }]}
              >
                <Input type="number" placeholder="95000" prefix="$" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Tavsif">
            <Input.TextArea
              rows={3}
              placeholder="Kvartira haqida qisqacha ma'lumot..."
            />
          </Form.Item>

          <Form.Item name="features" label="Xususiyatlar">
            <Select mode="multiple" placeholder="Xususiyatlarni tanlang">
              <Option value="Zamonaviy remont">Zamonaviy remont</Option>
              <Option value="Panoramik oynalar">Panoramik oynalar</Option>
              <Option value="Konditsioner">Konditsioner</Option>
              <Option value="Temir eshik">Temir eshik</Option>
              <Option value="Laminat pol">Laminat pol</Option>
              <Option value="Evropa planirovka">Evropa planirovka</Option>
              <Option value="Balkon">Balkon</Option>
              <Option value="Lift">Lift</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Apartment Modal */}
      <Modal
        title="Kvartira Tafsilotlari"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Yopish
          </Button>
        ]}
        width={1000}
      >
        {selectedApartment && (
          <div className="space-y-6">
            {/* Apartment Header */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#6bd2bc]/10 to-blue-500/10 rounded-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6bd2bc] to-[#4ade80] rounded-lg flex items-center justify-center">
                <Home
                  size={32}
                  className="text-slate-600 dark:text-slate-400"
                />
              </div>
              <div className="flex-1">
                <Title level={3} className="!mb-1">
                  Kvartira {selectedApartment.apartmentNumber}
                </Title>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-slate-400" />
                    <Text>
                      {selectedApartment.blockName} •{' '}
                      {selectedApartment.floorNumber}-qavat
                    </Text>
                  </div>
                  <Tag
                    color={getStatusColor(selectedApartment.status)}
                    style={{ color: 'white', border: 'none' }}
                  >
                    {getStatusText(selectedApartment.status)}
                  </Tag>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${selectedApartment.price.toLocaleString()}
                </div>
                <Text className="text-slate-600">USD</Text>
              </div>
            </div>

            <Row gutter={24}>
              {/* Left Column - Images and Details */}
              <Col span={14}>
                {/* Images */}
                <Card title="Rasmlar" size="small" className="mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {selectedApartment.images.map((image, index) => (
                      <Image
                        key={index}
                        src={image || '/placeholder.svg'}
                        alt={`Kvartira ${index + 1}`}
                        className="rounded-lg"
                        height={150}
                      />
                    ))}
                  </div>
                </Card>

                {/* Specifications */}
                <Card title="Xususiyatlar" size="small">
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="Xonalar soni">
                      {selectedApartment.rooms} xona
                    </Descriptions.Item>
                    <Descriptions.Item label="Maydon">
                      {selectedApartment.area} m²
                    </Descriptions.Item>
                    <Descriptions.Item label="Blok">
                      {selectedApartment.blockName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Qavat">
                      {selectedApartment.floorNumber}-qavat
                    </Descriptions.Item>
                  </Descriptions>

                  <div className="mt-4">
                    <Text strong>Qo'shimcha xususiyatlar:</Text>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedApartment.features.map((feature, index) => (
                        <Tag
                          key={index}
                          color="#6bd2bc"
                          style={{ color: 'white', border: 'none' }}
                        >
                          {feature}
                        </Tag>
                      ))}
                    </div>
                  </div>

                  {selectedApartment.description && (
                    <div className="mt-4">
                      <Text strong>Tavsif:</Text>
                      <div className="mt-1">
                        {selectedApartment.description}
                      </div>
                    </div>
                  )}
                </Card>
              </Col>

              {/* Right Column - Client and Contract Info */}
              <Col span={10}>
                {/* Client Info */}
                {selectedApartment.clientInfo && (
                  <Card
                    title="Mijoz Ma'lumotlari"
                    size="small"
                    className="mb-4"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar size={48} style={{ backgroundColor: '#6bd2bc' }}>
                        {selectedApartment.clientInfo.name.charAt(0)}
                      </Avatar>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {selectedApartment.clientInfo.name}
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Phone size={14} />
                          {selectedApartment.clientInfo.phone}
                        </div>
                        {selectedApartment.clientInfo.email && (
                          <div className="text-sm text-slate-500">
                            {selectedApartment.clientInfo.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Contract Info */}
                {selectedApartment.contractInfo && (
                  <Card
                    title="Shartnoma Ma'lumotlari"
                    size="small"
                    className="mb-4"
                  >
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Shartnoma ID">
                        {selectedApartment.contractInfo.contractId}
                      </Descriptions.Item>
                      <Descriptions.Item label="Sana">
                        {new Date(
                          selectedApartment.contractInfo.contractDate
                        ).toLocaleDateString('uz-UZ')}
                      </Descriptions.Item>
                      <Descriptions.Item label="Sotuvchi">
                        {selectedApartment.contractInfo.sellerName}
                      </Descriptions.Item>
                    </Descriptions>

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <Text>Jami summa:</Text>
                        <Text className="font-medium">
                          $
                          {selectedApartment.contractInfo.totalAmount.toLocaleString()}
                        </Text>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <Text>To'langan:</Text>
                        <Text className="font-medium">
                          $
                          {selectedApartment.contractInfo.paidAmount.toLocaleString()}
                        </Text>
                      </div>
                      <div className="flex justify-between text-orange-600">
                        <Text>Qarz:</Text>
                        <Text className="font-medium">
                          $
                          {selectedApartment.contractInfo.remainingAmount.toLocaleString()}
                        </Text>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Reservation Info */}
                {selectedApartment.reservationInfo && (
                  <Card title="Bron Ma'lumotlari" size="small">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Bron sanasi">
                        {new Date(
                          selectedApartment.reservationInfo.reservationDate
                        ).toLocaleDateString('uz-UZ')}
                      </Descriptions.Item>
                      <Descriptions.Item label="Bron summasi">
                        $
                        {selectedApartment.reservationInfo.reservationAmount.toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Amal qilish muddati">
                        {new Date(
                          selectedApartment.reservationInfo.expiryDate
                        ).toLocaleDateString('uz-UZ')}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                )}

                {/* Floor Plan */}
                {selectedApartment.floorPlan && (
                  <Card title="Planirovka" size="small" className="mt-4">
                    <Image
                      src={selectedApartment.floorPlan || '/placeholder.svg'}
                      alt="Planirovka"
                      className="rounded-lg"
                      width="100%"
                    />
                  </Card>
                )}
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}
