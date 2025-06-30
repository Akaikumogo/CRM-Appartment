/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Download,
  Calendar,
  DollarSign,
  User,
  Home
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
  DatePicker,
  message,
  Statistic,
  Progress,
  Space,
  Tooltip,
  Avatar
} from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Search: AntSearch } = Input;
const { Option } = Select;

// Contract data type based on the entity structure
export type ContractDto = {
  contractId: string;
  appartmentId: string;
  clientId: string;
  userId: string;
  contractDate: string;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  // Additional fields for better UX
  clientName: string;
  clientPhone: string;
  apartmentNumber: string;
  blockName: string;
  floorNumber: number;
  sellerName: string;
  contractAmount: number;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  progress: number;
};

// Generate mock contracts
const generateMockContracts = (): ContractDto[] => [
  {
    contractId: 'CNT-2024-001',
    appartmentId: 'apt-001',
    clientId: 'client-001',
    userId: 'user-001',
    contractDate: '2024-01-15',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
    companyId: 'comp-001',
    clientName: 'Alisher Karimov',
    clientPhone: '+998901234567',
    apartmentNumber: 'A-1-12',
    blockName: 'A Blok',
    floorNumber: 1,
    sellerName: 'Sardor Umarov',
    contractAmount: 95000,
    status: 'active',
    paymentStatus: 'partial',
    progress: 65
  },
  {
    contractId: 'CNT-2024-002',
    appartmentId: 'apt-002',
    clientId: 'client-002',
    userId: 'user-002',
    contractDate: '2024-01-20',
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-25T16:20:00Z',
    companyId: 'comp-001',
    clientName: 'Malika Tosheva',
    clientPhone: '+998901234568',
    apartmentNumber: 'B-3-25',
    blockName: 'B Blok',
    floorNumber: 3,
    sellerName: 'Dilshod Rahimov',
    contractAmount: 120000,
    status: 'completed',
    paymentStatus: 'paid',
    progress: 100
  },
  {
    contractId: 'CNT-2024-003',
    appartmentId: 'apt-003',
    clientId: 'client-003',
    userId: 'user-003',
    contractDate: '2024-02-01',
    createdAt: '2024-02-01T11:00:00Z',
    updatedAt: '2024-02-05T13:30:00Z',
    companyId: 'comp-001',
    clientName: 'Bobur Nazarov',
    clientPhone: '+998901234569',
    apartmentNumber: 'C-2-18',
    blockName: 'C Blok',
    floorNumber: 2,
    sellerName: 'Aziza Karimova',
    contractAmount: 85000,
    status: 'pending',
    paymentStatus: 'unpaid',
    progress: 25
  },
  {
    contractId: 'CNT-2024-004',
    appartmentId: 'apt-004',
    clientId: 'client-004',
    userId: 'user-004',
    contractDate: '2024-02-10',
    createdAt: '2024-02-10T14:20:00Z',
    updatedAt: '2024-02-15T10:15:00Z',
    companyId: 'comp-001',
    clientName: 'Dilorom Ahmadova',
    clientPhone: '+998901234570',
    apartmentNumber: 'D-1-05',
    blockName: 'D Blok',
    floorNumber: 1,
    sellerName: 'Jasur Toshev',
    contractAmount: 110000,
    status: 'active',
    paymentStatus: 'partial',
    progress: 80
  },
  {
    contractId: 'CNT-2024-005',
    appartmentId: 'apt-005',
    clientId: 'client-005',
    userId: 'user-005',
    contractDate: '2024-02-20',
    createdAt: '2024-02-20T16:45:00Z',
    updatedAt: '2024-02-25T12:00:00Z',
    companyId: 'comp-001',
    clientName: 'Rustam Yusupov',
    clientPhone: '+998901234571',
    apartmentNumber: 'A-4-08',
    blockName: 'A Blok',
    floorNumber: 4,
    sellerName: 'Nigora Alieva',
    contractAmount: 75000,
    status: 'cancelled',
    paymentStatus: 'unpaid',
    progress: 10
  }
];

export default function ContractsPage() {
  const [contracts, setContracts] = useState<ContractDto[]>(
    generateMockContracts()
  );
  const [filteredContracts, setFilteredContracts] = useState<ContractDto[]>(
    generateMockContracts()
  );
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractDto | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [form] = Form.useForm();

  const navigate = useNavigate();
  // Filter contracts
  useEffect(() => {
    let filtered = contracts;

    if (searchTerm) {
      filtered = filtered.filter(
        (contract) =>
          contract.contractId
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          contract.clientName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          contract.apartmentNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          contract.sellerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (contract) => contract.status === statusFilter
      );
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(
        (contract) => contract.paymentStatus === paymentFilter
      );
    }

    setFilteredContracts(filtered);
  }, [contracts, searchTerm, statusFilter, paymentFilter]);

  // Statistics
  const stats = {
    total: contracts.length,
    active: contracts.filter((c) => c.status === 'active').length,
    completed: contracts.filter((c) => c.status === 'completed').length,
    pending: contracts.filter((c) => c.status === 'pending').length,
    totalAmount: contracts.reduce((acc, c) => acc + c.contractAmount, 0),
    paidAmount: contracts
      .filter((c) => c.paymentStatus === 'paid')
      .reduce((acc, c) => acc + c.contractAmount, 0)
  };

  // Status colors
  const getStatusColor = (status: string) => {
    const colors = {
      active: '#10b981',
      completed: '#6bd2bc',
      pending: '#f59e0b',
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

  // Table columns
  const columns = [
    {
      title: 'Shartnoma ID',
      dataIndex: 'contractId',
      key: 'contractId',
      render: (id: string) => (
        <div className="font-mono text-sm font-medium text-slate-900 dark:text-white">
          {id}
        </div>
      )
    },
    {
      title: 'Mijoz',
      key: 'client',
      render: (record: ContractDto) => (
        <div className="flex items-center gap-3">
          <Avatar style={{ backgroundColor: '#6bd2bc' }}>
            {record.clientName
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </Avatar>
          <div>
            <div className="font-medium text-slate-900 dark:text-white">
              {record.clientName}
            </div>
            <div className="text-sm text-slate-500">{record.clientPhone}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Kvartira',
      key: 'apartment',
      render: (record: ContractDto) => (
        <div className="flex items-center gap-2">
          <Home size={16} className="text-slate-400" />
          <div>
            <div className="font-medium text-slate-900 dark:text-white">
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
      title: 'Sotuvchi',
      dataIndex: 'sellerName',
      key: 'sellerName',
      render: (name: string) => (
        <div className="flex items-center gap-2">
          <User size={16} className="text-slate-400" />
          <Text className="text-slate-900 dark:text-white">{name}</Text>
        </div>
      )
    },
    {
      title: 'Summa',
      dataIndex: 'contractAmount',
      key: 'contractAmount',
      render: (amount: number) => (
        <div className="flex items-center gap-1">
          <DollarSign size={16} className="text-green-500" />
          <Text className="font-semibold text-green-600">
            ${amount.toLocaleString()}
          </Text>
        </div>
      ),
      sorter: (a: ContractDto, b: ContractDto) =>
        a.contractAmount - b.contractAmount
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusText = {
          active: 'Faol',
          completed: 'Tugallangan',
          pending: 'Kutilmoqda',
          cancelled: 'Bekor qilingan'
        };
        return (
          <Tag
            color={getStatusColor(status)}
            style={{ color: 'white', border: 'none' }}
          >
            {statusText[status as keyof typeof statusText]}
          </Tag>
        );
      },
      filters: [
        { text: 'Faol', value: 'active' },
        { text: 'Tugallangan', value: 'completed' },
        { text: 'Kutilmoqda', value: 'pending' },
        { text: 'Bekor qilingan', value: 'cancelled' }
      ],
      onFilter: (value: any, record: ContractDto) => record.status === value
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
      },
      filters: [
        { text: "To'langan", value: 'paid' },
        { text: 'Qisman', value: 'partial' },
        { text: "To'lanmagan", value: 'unpaid' }
      ],
      onFilter: (value: any, record: ContractDto) =>
        record.paymentStatus === value
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
      ),
      sorter: (a: ContractDto, b: ContractDto) => a.progress - b.progress
    },
    {
      title: 'Sana',
      dataIndex: 'contractDate',
      key: 'contractDate',
      render: (date: string) => (
        <div className="flex items-center gap-1">
          <Calendar size={14} className="text-slate-400" />
          <Text className="text-slate-900 dark:text-white">
            {dayjs(date).format('DD.MM.YYYY')}
          </Text>
        </div>
      ),
      sorter: (a: ContractDto, b: ContractDto) =>
        dayjs(a.contractDate).unix() - dayjs(b.contractDate).unix()
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (record: ContractDto) => (
        <Space>
          <Tooltip title="Ko'rish">
            <Button
              type="text"
              icon={<Eye size={16} />}
              onClick={() => {
                setSelectedContract(record);
                setIsViewModalVisible(true);
                navigate(`${record.contractId}`);
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

  const handleAddContract = (values: any) => {
    const newContract: ContractDto = {
      contractId: `CNT-2024-${String(contracts.length + 1).padStart(3, '0')}`,
      ...values,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending',
      paymentStatus: 'unpaid',
      progress: 0
    };
    setContracts([...contracts, newContract]);
    setIsAddModalVisible(false);
    form.resetFields();
    message.success("Shartnoma muvaffaqiyatli qo'shildi!");
  };

  return (
    <div className="p-2 space-y-6 min-h-full">
      {/* Statistics */}
      <div>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={6}>
            <Card className="bg-gradient-to-br from-[#6fe0c8] to-[#419380da] border-0 text-slate-600 dark:text-slate-400">
              <Statistic
                className="text-slate-600 dark:text-slate-400"
                title={
                  <span className="text-slate-600 dark:text-slate-400">
                    Jami Shartnomalar
                  </span>
                }
                value={stats.total}
                prefix={
                  <FileText className="text-slate-600 dark:text-slate-400" />
                }
                valueStyle={{
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="bg-gradient-to-br from-green-400 to-green-600 border-0 text-slate-600 dark:text-slate-400">
              <Statistic
                className="text-slate-600 dark:text-slate-400"
                title={
                  <span className="text-slate-600 dark:text-slate-400">
                    Faol
                  </span>
                }
                value={stats.active}
                prefix={
                  <FileText className="text-slate-600 dark:text-slate-400" />
                }
                valueStyle={{
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="bg-gradient-to-br from-blue-400 to-blue-600 border-0 text-slate-600 dark:text-slate-400">
              <Statistic
                className="text-slate-600 dark:text-slate-400"
                title={
                  <span className="text-slate-600 dark:text-slate-400">
                    Tugallangan
                  </span>
                }
                value={stats.completed}
                prefix={
                  <FileText className="text-slate-600 dark:text-slate-400" />
                }
                valueStyle={{
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="bg-gradient-to-br from-purple-400 to-purple-600 border-0 text-slate-600 dark:text-slate-400">
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
      </div>

      {/* Filters */}
      <div>
        <Card className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <AntSearch
                placeholder="Shartnoma ID, mijoz yoki kvartira bo'yicha qidirish..."
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
                <Option value="completed">Tugallangan</Option>
                <Option value="pending">Kutilmoqda</Option>
                <Option value="cancelled">Bekor qilingan</Option>
              </Select>
            </Col>
            <Col xs={24} sm={4}>
              <Select
                placeholder="To'lov"
                value={paymentFilter}
                onChange={setPaymentFilter}
                style={{ width: '100%' }}
              >
                <Option value="all">Barcha to'lovlar</Option>
                <Option value="paid">To'langan</Option>
                <Option value="partial">Qisman</Option>
                <Option value="unpaid">To'lanmagan</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <div className="flex justify-end">
                <Text className="text-slate-600 dark:text-slate-400">
                  Jami: {filteredContracts.length} ta shartnoma
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Contracts Table */}
      <div>
        <Card
          className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800"
          title={
            <div className="flex items-center justify-between">
              <Title
                level={4}
                className="!text-slate-900 dark:!text-white !mb-0"
              >
                Shartnomalar Ro'yxati
              </Title>{' '}
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
                Yangi Shartnoma
              </Button>
            </div>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredContracts}
            rowKey="contractId"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} / ${total} ta`
            }}
            scroll={{ x: 1200 }}
            size="middle"
          />
        </Card>
      </div>

      {/* Add Contract Modal */}
      <Modal
        title="Yangi Shartnoma Yaratish"
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
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleAddContract}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="clientName"
                label="Mijoz ismi"
                rules={[{ required: true, message: 'Mijoz ismini kiriting' }]}
              >
                <Input placeholder="Mijoz ismini kiriting" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="clientPhone"
                label="Mijoz telefoni"
                rules={[
                  { required: true, message: 'Telefon raqamini kiriting' }
                ]}
              >
                <Input placeholder="+998901234567" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="apartmentNumber"
                label="Kvartira raqami"
                rules={[
                  { required: true, message: 'Kvartira raqamini kiriting' }
                ]}
              >
                <Input placeholder="A-1-12" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="blockName"
                label="Blok nomi"
                rules={[{ required: true, message: 'Blok nomini kiriting' }]}
              >
                <Select placeholder="Blokni tanlang">
                  <Option value="A Blok">A Blok</Option>
                  <Option value="B Blok">B Blok</Option>
                  <Option value="C Blok">C Blok</Option>
                  <Option value="D Blok">D Blok</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="floorNumber"
                label="Qavat raqami"
                rules={[{ required: true, message: 'Qavat raqamini kiriting' }]}
              >
                <Input type="number" placeholder="1" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sellerName"
                label="Sotuvchi"
                rules={[{ required: true, message: 'Sotuvchini tanlang' }]}
              >
                <Select placeholder="Sotuvchini tanlang">
                  <Option value="Sardor Umarov">Sardor Umarov</Option>
                  <Option value="Dilshod Rahimov">Dilshod Rahimov</Option>
                  <Option value="Aziza Karimova">Aziza Karimova</Option>
                  <Option value="Jasur Toshev">Jasur Toshev</Option>
                  <Option value="Nigora Alieva">Nigora Alieva</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contractAmount"
                label="Shartnoma summasi"
                rules={[{ required: true, message: 'Summani kiriting' }]}
              >
                <Input type="number" placeholder="95000" prefix="$" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contractDate"
                label="Shartnoma sanasi"
                rules={[{ required: true, message: 'Sanani tanlang' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="companyId" label="Kompaniya ID">
                <Input placeholder="comp-001" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* View Contract Modal */}
      <Modal
        title="Shartnoma Tafsilotlari"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="download" icon={<Download size={16} />}>
            Yuklab olish
          </Button>,
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Yopish
          </Button>
        ]}
        width={700}
      >
        {selectedContract && (
          <div className="space-y-6">
            {/* Contract Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#6bd2bc]/10 to-blue-500/10 rounded-lg">
              <div>
                <Title level={4} className="!mb-1">
                  {selectedContract.contractId}
                </Title>
                <Text className="text-slate-600">
                  {dayjs(selectedContract.contractDate).format('DD MMMM YYYY')}
                </Text>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${selectedContract.contractAmount.toLocaleString()}
                </div>
                <Tag
                  color={getStatusColor(selectedContract.status)}
                  style={{ color: 'white', border: 'none' }}
                >
                  {selectedContract.status === 'active'
                    ? 'Faol'
                    : selectedContract.status === 'completed'
                    ? 'Tugallangan'
                    : selectedContract.status === 'pending'
                    ? 'Kutilmoqda'
                    : 'Bekor qilingan'}
                </Tag>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Text strong>Shartnoma jarayoni:</Text>
                <Text>{selectedContract.progress}%</Text>
              </div>
              <Progress
                percent={selectedContract.progress}
                strokeColor={
                  selectedContract.progress === 100
                    ? '#10b981'
                    : selectedContract.progress > 50
                    ? '#6bd2bc'
                    : '#f59e0b'
                }
              />
            </div>

            {/* Details */}
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <div className="space-y-3">
                  <div>
                    <Text strong className="text-slate-600">
                      Mijoz:
                    </Text>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar style={{ backgroundColor: '#6bd2bc' }}>
                        {selectedContract.clientName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {selectedContract.clientName}
                        </div>
                        <div className="text-sm text-slate-500">
                          {selectedContract.clientPhone}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Text strong className="text-slate-600">
                      Kvartira:
                    </Text>
                    <div className="flex items-center gap-2 mt-1">
                      <Home size={16} className="text-slate-400" />
                      <div>
                        <div className="font-medium">
                          {selectedContract.apartmentNumber}
                        </div>
                        <div className="text-sm text-slate-500">
                          {selectedContract.blockName},{' '}
                          {selectedContract.floorNumber}-qavat
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>

              <Col span={12}>
                <div className="space-y-3">
                  <div>
                    <Text strong className="text-slate-600">
                      Sotuvchi:
                    </Text>
                    <div className="flex items-center gap-2 mt-1">
                      <User size={16} className="text-slate-400" />
                      <div className="font-medium">
                        {selectedContract.sellerName}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Text strong className="text-slate-600">
                      To'lov holati:
                    </Text>
                    <div className="mt-1">
                      <Badge
                        color={getPaymentColor(selectedContract.paymentStatus)}
                        text={
                          selectedContract.paymentStatus === 'paid'
                            ? "To'langan"
                            : selectedContract.paymentStatus === 'partial'
                            ? "Qisman to'langan"
                            : "To'lanmagan"
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Text strong className="text-slate-600">
                      Yaratilgan sana:
                    </Text>
                    <div className="mt-1">
                      {dayjs(selectedContract.createdAt).format(
                        'DD.MM.YYYY HH:mm'
                      )}
                    </div>
                  </div>

                  <div>
                    <Text strong className="text-slate-600">
                      Oxirgi yangilanish:
                    </Text>
                    <div className="mt-1">
                      {dayjs(selectedContract.updatedAt).format(
                        'DD.MM.YYYY HH:mm'
                      )}
                    </div>
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
