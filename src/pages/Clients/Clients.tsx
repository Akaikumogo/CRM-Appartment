/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Home,
  DollarSign,
  Calendar,
  Eye,
  Edit
} from 'lucide-react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Avatar,
  Tag,
  Badge,
  Input,
  Select,
  Modal,
  Form,
  DatePicker,
  message,
  Statistic,
  Progress,
  Tooltip
} from 'antd';

import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Search: AntSearch } = Input;
const { Option } = Select;

// Client data type
export type ClientDto = {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  passportSeria: string;
  passportNumber: string;
  birthDate?: string;
  address?: string;
  registrationDate: string;
  status: 'active' | 'inactive';
  totalPurchases: number;
  totalAmount: number;
  lastPurchaseDate?: string;
  purchases: PurchaseDto[];
};

export type PurchaseDto = {
  id: string;
  apartmentNumber: string;
  blockName: string;
  floorNumber: number;
  purchaseDate: string;
  amount: number;
  status: 'completed' | 'active' | 'cancelled';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  progress: number;
  contractId: string;
  sellerName: string;
};

// Generate mock clients with multiple purchases
const generateMockClients = (): ClientDto[] => [
  {
    id: 'client-001',
    fullName: 'Alisher Karimov',
    phoneNumber: '+998901234567',
    email: 'alisher.karimov@gmail.com',
    passportSeria: 'AD',
    passportNumber: '1234567',
    birthDate: '1985-05-15',
    address: 'Toshkent shahar, Yunusobod tumani',
    registrationDate: '2023-01-15',
    status: 'active',
    totalPurchases: 3,
    totalAmount: 285000,
    lastPurchaseDate: '2024-02-20',
    purchases: [
      {
        id: 'purchase-001',
        apartmentNumber: 'A-1-12',
        blockName: 'A Blok',
        floorNumber: 1,
        purchaseDate: '2023-01-15',
        amount: 95000,
        status: 'completed',
        paymentStatus: 'paid',
        progress: 100,
        contractId: 'CNT-2023-001',
        sellerName: 'Sardor Umarov'
      },
      {
        id: 'purchase-002',
        apartmentNumber: 'B-3-25',
        blockName: 'B Blok',
        floorNumber: 3,
        purchaseDate: '2023-08-10',
        amount: 120000,
        status: 'completed',
        paymentStatus: 'paid',
        progress: 100,
        contractId: 'CNT-2023-045',
        sellerName: 'Dilshod Rahimov'
      },
      {
        id: 'purchase-003',
        apartmentNumber: 'C-2-18',
        blockName: 'C Blok',
        floorNumber: 2,
        purchaseDate: '2024-02-20',
        amount: 70000,
        status: 'active',
        paymentStatus: 'partial',
        progress: 65,
        contractId: 'CNT-2024-012',
        sellerName: 'Aziza Karimova'
      }
    ]
  },
  {
    id: 'client-002',
    fullName: 'Malika Tosheva',
    phoneNumber: '+998901234568',
    email: 'malika.tosheva@mail.ru',
    passportSeria: 'AD',
    passportNumber: '2345678',
    birthDate: '1990-12-03',
    address: 'Toshkent shahar, Mirobod tumani',
    registrationDate: '2023-03-20',
    status: 'active',
    totalPurchases: 2,
    totalAmount: 195000,
    lastPurchaseDate: '2024-01-15',
    purchases: [
      {
        id: 'purchase-004',
        apartmentNumber: 'D-1-05',
        blockName: 'D Blok',
        floorNumber: 1,
        purchaseDate: '2023-03-20',
        amount: 110000,
        status: 'completed',
        paymentStatus: 'paid',
        progress: 100,
        contractId: 'CNT-2023-015',
        sellerName: 'Jasur Toshev'
      },
      {
        id: 'purchase-005',
        apartmentNumber: 'A-4-08',
        blockName: 'A Blok',
        floorNumber: 4,
        purchaseDate: '2024-01-15',
        amount: 85000,
        status: 'active',
        paymentStatus: 'partial',
        progress: 80,
        contractId: 'CNT-2024-003',
        sellerName: 'Nigora Alieva'
      }
    ]
  },
  {
    id: 'client-003',
    fullName: 'Bobur Nazarov',
    phoneNumber: '+998901234569',
    email: 'bobur.nazarov@inbox.uz',
    passportSeria: 'AD',
    passportNumber: '3456789',
    birthDate: '1988-07-25',
    address: 'Toshkent shahar, Shayxontohur tumani',
    registrationDate: '2023-06-10',
    status: 'active',
    totalPurchases: 1,
    totalAmount: 75000,
    lastPurchaseDate: '2023-06-10',
    purchases: [
      {
        id: 'purchase-006',
        apartmentNumber: 'B-2-15',
        blockName: 'B Blok',
        floorNumber: 2,
        purchaseDate: '2023-06-10',
        amount: 75000,
        status: 'completed',
        paymentStatus: 'paid',
        progress: 100,
        contractId: 'CNT-2023-032',
        sellerName: 'Sardor Umarov'
      }
    ]
  },
  {
    id: 'client-004',
    fullName: 'Dilorom Ahmadova',
    phoneNumber: '+998901234570',
    email: 'dilorom.ahmadova@gmail.com',
    passportSeria: 'AD',
    passportNumber: '4567890',
    birthDate: '1992-04-18',
    address: 'Toshkent shahar, Olmazor tumani',
    registrationDate: '2023-09-05',
    status: 'active',
    totalPurchases: 4,
    totalAmount: 420000,
    lastPurchaseDate: '2024-03-01',
    purchases: [
      {
        id: 'purchase-007',
        apartmentNumber: 'A-3-07',
        blockName: 'A Blok',
        floorNumber: 3,
        purchaseDate: '2023-09-05',
        amount: 105000,
        status: 'completed',
        paymentStatus: 'paid',
        progress: 100,
        contractId: 'CNT-2023-058',
        sellerName: 'Dilshod Rahimov'
      },
      {
        id: 'purchase-008',
        apartmentNumber: 'B-1-03',
        blockName: 'B Blok',
        floorNumber: 1,
        purchaseDate: '2023-11-20',
        amount: 90000,
        status: 'completed',
        paymentStatus: 'paid',
        progress: 100,
        contractId: 'CNT-2023-078',
        sellerName: 'Aziza Karimova'
      },
      {
        id: 'purchase-009',
        apartmentNumber: 'C-4-22',
        blockName: 'C Blok',
        floorNumber: 4,
        purchaseDate: '2024-01-10',
        amount: 125000,
        status: 'completed',
        paymentStatus: 'paid',
        progress: 100,
        contractId: 'CNT-2024-002',
        sellerName: 'Jasur Toshev'
      },
      {
        id: 'purchase-010',
        apartmentNumber: 'D-3-18',
        blockName: 'D Blok',
        floorNumber: 3,
        purchaseDate: '2024-03-01',
        amount: 100000,
        status: 'active',
        paymentStatus: 'partial',
        progress: 45,
        contractId: 'CNT-2024-018',
        sellerName: 'Sardor Umarov'
      }
    ]
  },
  {
    id: 'client-005',
    fullName: 'Rustam Yusupov',
    phoneNumber: '+998901234571',
    passportSeria: 'AD',
    passportNumber: '5678901',
    birthDate: '1987-11-12',
    address: 'Toshkent shahar, Yashnobod tumani',
    registrationDate: '2024-01-20',
    status: 'inactive',
    totalPurchases: 1,
    totalAmount: 0,
    lastPurchaseDate: '2024-01-20',
    purchases: [
      {
        id: 'purchase-011',
        apartmentNumber: 'A-2-09',
        blockName: 'A Blok',
        floorNumber: 2,
        purchaseDate: '2024-01-20',
        amount: 80000,
        status: 'cancelled',
        paymentStatus: 'unpaid',
        progress: 10,
        contractId: 'CNT-2024-005',
        sellerName: 'Nigora Alieva'
      }
    ]
  }
];

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientDto[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [form] = Form.useForm();

  useEffect(() => {
    const mockData = generateMockClients();
    setClients(mockData);
    setFilteredClients(mockData);
  }, []);

  // Filter clients
  useEffect(() => {
    let filtered = clients;

    if (searchTerm) {
      filtered = filtered.filter(
        (client) =>
          client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.phoneNumber.includes(searchTerm) ||
          client.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((client) => client.status === statusFilter);
    }

    setFilteredClients(filtered);
  }, [clients, searchTerm, statusFilter]);

  // Statistics
  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.status === 'active').length,
    inactive: clients.filter((c) => c.status === 'inactive').length,
    totalPurchases: clients.reduce((acc, c) => acc + c.totalPurchases, 0),
    totalAmount: clients.reduce((acc, c) => acc + c.totalAmount, 0),
    avgPurchases: Math.round(
      clients.reduce((acc, c) => acc + c.totalPurchases, 0) / clients.length
    )
  };

  // Status colors
  const getStatusColor = (status: string) => {
    const colors = {
      completed: '#10b981',
      active: '#6bd2bc',
      cancelled: '#ef4444'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const getPaymentColor = (status: string) => {
    const colors = {
      paid: '#10b981',
      partial: '#f59e0b',
      unpaid: '#ef4444'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  // Expanded table columns for purchases
  const purchaseColumns: ColumnsType<PurchaseDto> = [
    {
      title: 'Kvartira',
      key: 'apartment',
      render: (record: PurchaseDto) => (
        <div className="flex items-center gap-2">
          <Home size={16} className="text-slate-400" />
          <div>
            <div className="font-medium  text-slate-600 dark:text-slate-400">
              {record.apartmentNumber}
            </div>
            <div className="text-sm text-slate-500">
              {record.blockName}, {record.floorNumber}-qavat
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Summa',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <div className="flex items-center gap-1">
          <DollarSign size={16} className="text-green-500" />
          <Text className="font-semibold text-green-600">
            ${amount.toLocaleString()}
          </Text>
        </div>
      )
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusText = {
          completed: 'Tugallangan',
          active: 'Faol',
          cancelled: 'Bekor qilingan'
        };
        return (
          <Tag color={getStatusColor(status)} style={{ border: 'none' }}>
            {statusText[status as keyof typeof statusText]}
          </Tag>
        );
      }
    },
    {
      title: "To'lov",
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status: string) => {
        const statusText = {
          paid: "To'langan",
          partial: 'Qisman',
          unpaid: "To'lanmagan"
        };
        return (
          <Badge
            color={getPaymentColor(status)}
            text={statusText[status as keyof typeof statusText]}
            style={{ color: getPaymentColor(status) }}
          />
        );
      }
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <div className="w-20">
          <Progress
            percent={progress}
            size="small"
            strokeColor={
              progress === 100
                ? '#10b981'
                : progress > 50
                ? '#6bd2bc'
                : '#f59e0b'
            }
            showInfo={false}
          />
          <Text className="text-xs text-slate-500">{progress}%</Text>
        </div>
      )
    },
    {
      title: 'Sana',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      render: (date: string) => (
        <div className="flex items-center gap-1">
          <Calendar size={14} className="text-slate-400" />
          <Text className=" text-slate-600 dark:text-slate-400">
            {dayjs(date).format('DD.MM.YYYY')}
          </Text>
        </div>
      )
    },
    {
      title: 'Sotuvchi',
      dataIndex: 'sellerName',
      key: 'sellerName',
      render: (name: string) => (
        <Text className=" text-slate-600 dark:text-slate-400">{name}</Text>
      )
    },
    {
      title: 'Shartnoma',
      dataIndex: 'contractId',
      key: 'contractId',
      render: (id: string) => (
        <Text className="font-mono text-sm text-slate-600">{id}</Text>
      )
    }
  ];

  // Main table columns
  const columns: ColumnsType<ClientDto> = [
    {
      title: 'Mijoz',
      key: 'client',
      render: (record: ClientDto) => (
        <div className="flex items-center gap-3">
          <Avatar size={48} style={{ backgroundColor: '#6bd2bc' }}>
            {record.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </Avatar>
          <div>
            <div className="font-medium  text-slate-600 dark:text-slate-400">
              {record.fullName}
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <Phone size={14} />
              {record.phoneNumber}
            </div>
            {record.email && (
              <div className="text-sm text-slate-500">{record.email}</div>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Passport',
      key: 'passport',
      render: (record: ClientDto) => (
        <Text className="font-mono  text-slate-600 dark:text-slate-400">
          {record.passportSeria} {record.passportNumber}
        </Text>
      )
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          color={status === 'active' ? 'green' : 'red'}
          text={status === 'active' ? 'Faol' : 'Nofaol'}
        />
      ),
      filters: [
        { text: 'Faol', value: 'active' },
        { text: 'Nofaol', value: 'inactive' }
      ],
      onFilter: (value: any, record: ClientDto) => record.status === value
    },
    {
      title: 'Xaridlar',
      key: 'purchases',
      render: (record: ClientDto) => (
        <div className="text-center">
          <div className="text-2xl font-bold text-[#6bd2bc]">
            {record.totalPurchases}
          </div>
          <div className="text-xs text-slate-500">ta kvartira</div>
        </div>
      ),
      sorter: (a: ClientDto, b: ClientDto) =>
        a.totalPurchases - b.totalPurchases
    },
    {
      title: 'Jami summa',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => (
        <div className="text-right">
          <div className="font-semibold text-green-600">
            ${amount.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">USD</div>
        </div>
      ),
      sorter: (a: ClientDto, b: ClientDto) => a.totalAmount - b.totalAmount
    },
    {
      title: 'Oxirgi xarid',
      dataIndex: 'lastPurchaseDate',
      key: 'lastPurchaseDate',
      render: (date: string) => (
        <div className="flex items-center gap-1">
          <Calendar size={14} className="text-slate-400" />
          <Text className=" text-slate-600 dark:text-slate-400">
            {dayjs(date).format('DD.MM.YYYY')}
          </Text>
        </div>
      ),
      sorter: (a: ClientDto, b: ClientDto) =>
        dayjs(a.lastPurchaseDate).unix() - dayjs(b.lastPurchaseDate || 0).unix()
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (record: ClientDto) => {
        return (
          <div className="w-full">
            <Tooltip title="Ko'rish">
              <Button
                type="text"
                icon={<Eye size={16} />}
                onClick={() => {
                  setSelectedClient(record);
                  setIsViewModalVisible(true);
                }}
              />
            </Tooltip>
            <Tooltip title="Tahrirlash">
              <Button type="text" icon={<Edit size={16} />} />
            </Tooltip>
          </div>
        );
      }
    }
  ];

  const handleAddClient = (values: any) => {
    const newClient: ClientDto = {
      id: Date.now().toString(),
      ...values,
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'active',
      totalPurchases: 0,
      totalAmount: 0,
      purchases: []
    };
    setClients([...clients, newClient]);
    setIsAddModalVisible(false);
    form.resetFields();
    message.success("Mijoz muvaffaqiyatli qo'shildi!");
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
            <Card className="bg-gradient-to-br from-[#6fe0c8] to-[#419380da] border-0  text-slate-600 dark:text-slate-400">
              <Statistic
                className="text-slate-600 dark:text-slate-400"
                title={
                  <span className="text-slate-600 dark:text-slate-400">
                    Jami Mijozlar
                  </span>
                }
                value={stats.total}
                prefix={
                  <Users className=" text-slate-600 dark:text-slate-400" />
                }
                valueStyle={{
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="bg-gradient-to-br from-green-400 to-green-600 border-0  text-slate-600 dark:text-slate-400">
              <Statistic
                className="text-slate-600 dark:text-slate-400"
                title={
                  <span className="text-slate-600 dark:text-slate-400">
                    Faol Mijozlar
                  </span>
                }
                value={stats.active}
                prefix={
                  <Users className=" text-slate-600 dark:text-slate-400" />
                }
                valueStyle={{
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="bg-gradient-to-br from-blue-400 to-blue-600 border-0  text-slate-600 dark:text-slate-400">
              <Statistic
                className="text-slate-600 dark:text-slate-400"
                title={
                  <span className="text-slate-600 dark:text-slate-400">
                    Jami Xaridlar
                  </span>
                }
                value={stats.totalPurchases}
                prefix={
                  <Home className=" text-slate-600 dark:text-slate-400" />
                }
                valueStyle={{
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="bg-gradient-to-br from-purple-400 to-purple-600 border-0  text-slate-600 dark:text-slate-400">
              <Statistic
                className="text-slate-600 dark:text-slate-400"
                title={
                  <span className="text-slate-600 dark:text-slate-400">
                    Jami Summa
                  </span>
                }
                value={stats.totalAmount}
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
                placeholder="Ism, telefon yoki email bo'yicha qidirish..."
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<Search size={16} />}
              />
            </Col>
            <Col xs={24} sm={4}>
              <Select
                placeholder="Holat"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
                suffixIcon={<Filter size={16} />}
              >
                <Option value="all">Barcha holatlar</Option>
                <Option value="active">Faol</Option>
                <Option value="inactive">Nofaol</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12}>
              <div className="flex justify-end">
                <Text className="text-slate-600 dark:text-slate-400">
                  Jami: {filteredClients.length} ta mijoz • O'rtacha:{' '}
                  {stats.avgPurchases} ta xarid
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Clients Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card
          className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800"
          title={
            <div className="flex items-center justify-between">
              <Title level={4} className="!!text-white !mb-0">
                Mijozlar Ro'yxati
              </Title>
              <Button
                type="primary"
                size="large"
                icon={<UserPlus size={18} />}
                onClick={() => setIsAddModalVisible(true)}
                style={{
                  background: '#6bd2bc',
                  border: 'none'
                }}
              >
                Yangi Mijoz
              </Button>
            </div>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredClients}
            rowKey="id"
            expandable={{
              expandedRowRender: (record) => (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <Title level={5} className="!!text-white !mb-4">
                    {record.fullName}ning xaridlari ({record.totalPurchases} ta)
                  </Title>
                  <Table
                    columns={purchaseColumns}
                    dataSource={record.purchases}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    className="nested-table"
                  />
                </div>
              ),
              rowExpandable: (record) => record.purchases.length > 0,
              expandIcon: ({ expanded, onExpand, record }) =>
                record.purchases.length > 0 ? (
                  <Button
                    type="text"
                    size="small"
                    onClick={(e) => onExpand(record, e)}
                    style={{ color: '#6bd2bc' }}
                  >
                    {expanded
                      ? 'Yashirish'
                      : `${record.totalPurchases} ta ko'rish`}
                  </Button>
                ) : null
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

      {/* Add Client Modal */}
      <Modal
        title="Yangi Mijoz Qo'shish"
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
        <Form form={form} layout="vertical" onFinish={handleAddClient}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="To'liq ism"
                rules={[{ required: true, message: "To'liq ismni kiriting" }]}
              >
                <Input placeholder="To'liq ismni kiriting" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Telefon raqam"
                rules={[
                  { required: true, message: 'Telefon raqamni kiriting' }
                ]}
              >
                <Input placeholder="+998901234567" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email">
                <Input placeholder="email@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="birthDate" label="Tug'ilgan sana">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="passportSeria"
                label="Passport seriya"
                rules={[
                  { required: true, message: 'Passport seriyasini kiriting' }
                ]}
              >
                <Input placeholder="AD" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="passportNumber"
                label="Passport raqam"
                rules={[
                  { required: true, message: 'Passport raqamini kiriting' }
                ]}
              >
                <Input placeholder="1234567" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Manzil">
            <Input.TextArea rows={3} placeholder="To'liq manzilni kiriting" />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Client Modal */}
      <Modal
        title="Mijoz Ma'lumotlari"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Yopish
          </Button>
        ]}
        width={1000}
      >
        {selectedClient && (
          <div className="space-y-6">
            {/* Client Header */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#6bd2bc]/10 to-blue-500/10 rounded-lg">
              <Avatar size={64} style={{ backgroundColor: '#6bd2bc' }}>
                {selectedClient.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </Avatar>
              <div className="flex-1">
                <Title level={4} className="!mb-1">
                  {selectedClient.fullName}
                </Title>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Phone size={14} />
                    <Text>{selectedClient.phoneNumber}</Text>
                  </div>
                  {selectedClient.email && (
                    <Text className="text-slate-500">
                      {selectedClient.email}
                    </Text>
                  )}
                </div>
                <div className="mt-2">
                  <Badge
                    color={selectedClient.status === 'active' ? 'green' : 'red'}
                    text={
                      selectedClient.status === 'active'
                        ? 'Faol mijoz'
                        : 'Nofaol mijoz'
                    }
                  />
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#6bd2bc]">
                  {selectedClient.totalPurchases}
                </div>
                <Text className="text-slate-600">ta xarid</Text>
              </div>
            </div>

            {/* Statistics */}
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small" className="text-center">
                  <Statistic
                    className="text-slate-600 dark:text-slate-400"
                    title="Jami summa"
                    value={selectedClient.totalAmount}
                    prefix="$"
                    valueStyle={{ color: '#10b981' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" className="text-center">
                  <Statistic
                    className="text-slate-600 dark:text-slate-400"
                    title="Xaridlar soni"
                    value={selectedClient.totalPurchases}
                    valueStyle={{ color: '#6bd2bc' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" className="text-center">
                  <Statistic
                    className="text-slate-600 dark:text-slate-400"
                    title="Oxirgi xarid"
                    value={
                      selectedClient.lastPurchaseDate
                        ? dayjs(selectedClient.lastPurchaseDate).format(
                            'DD.MM.YYYY'
                          )
                        : "Yo'q"
                    }
                    valueStyle={{ color: '#f59e0b' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Personal Info */}
            <Card title="Shaxsiy Ma'lumotlar" size="small">
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text strong>Passport:</Text>
                  <div>
                    {selectedClient.passportSeria}{' '}
                    {selectedClient.passportNumber}
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong>Tug'ilgan sana:</Text>
                  <div>
                    {selectedClient.birthDate
                      ? dayjs(selectedClient.birthDate).format('DD.MM.YYYY')
                      : 'Kiritilmagan'}
                  </div>
                </Col>
                <Col span={24}>
                  <Text strong>Manzil:</Text>
                  <div>{selectedClient.address || 'Kiritilmagan'}</div>
                </Col>
                <Col span={12}>
                  <Text strong>Ro'yxatga olingan:</Text>
                  <div>
                    {dayjs(selectedClient.registrationDate).format(
                      'DD.MM.YYYY'
                    )}
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Purchases */}
            {selectedClient.purchases.length > 0 && (
              <Card title="Xaridlar Tarixi" size="small">
                <Table
                  columns={purchaseColumns}
                  dataSource={selectedClient.purchases}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
