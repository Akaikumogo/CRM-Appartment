/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Eye,
  Edit,
  Trash2
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
  Dropdown,
  Statistic,
  Progress
} from 'antd';
import type { MenuProps } from 'antd';

const { Title, Text } = Typography;
const { Search: AntSearch } = Input;
const { Option } = Select;

// Worker data type based on the entity structure
export type WorkerDto = {
  id: string;
  userName: string;
  phoneNumber: string;
  birthDate?: string;
  passportSeria: string;
  passportNumber: number;
  fullName: string;
  companyId: string;
  role: 'Admin' | 'Manager' | 'Seller' | 'CEO';
  image?: string;
  password: string;
  status: 'active' | 'inactive';
  joinDate: string;
  salary: number;
  performance: number;
  attendance: number;
};

// Generate mock workers
const generateMockWorkers = (): WorkerDto[] => [
  {
    id: '1',
    userName: 'sardor_umarov',
    phoneNumber: '+998901234567',
    birthDate: '1990-05-15',
    passportSeria: 'AD',
    passportNumber: 1234567,
    fullName: 'Sardor Umarov',
    companyId: 'comp1',
    role: 'Seller',
    image: '',
    password: 'hashed_password',
    status: 'active',
    joinDate: '2023-01-15',
    salary: 5000000,
    performance: 92,
    attendance: 95
  },
  {
    id: '2',
    userName: 'dilshod_rahimov',
    phoneNumber: '+998901234568',
    birthDate: '1988-08-22',
    passportSeria: 'AD',
    passportNumber: 2345678,
    fullName: 'Dilshod Rahimov',
    companyId: 'comp1',
    role: 'Manager',
    image: '',
    password: 'hashed_password',
    status: 'active',
    joinDate: '2022-06-10',
    salary: 8000000,
    performance: 88,
    attendance: 98
  },
  {
    id: '3',
    userName: 'aziza_karimova',
    phoneNumber: '+998901234569',
    birthDate: '1992-12-03',
    passportSeria: 'AD',
    passportNumber: 3456789,
    fullName: 'Aziza Karimova',
    companyId: 'comp1',
    role: 'Seller',
    image: '',
    password: 'hashed_password',
    status: 'active',
    joinDate: '2023-03-20',
    salary: 4500000,
    performance: 95,
    attendance: 92
  },
  {
    id: '4',
    userName: 'jasur_toshev',
    phoneNumber: '+998901234570',
    birthDate: '1985-04-18',
    passportSeria: 'AD',
    passportNumber: 4567890,
    fullName: 'Jasur Toshev',
    companyId: 'comp1',
    role: 'CEO',
    image: '',
    password: 'hashed_password',
    status: 'active',
    joinDate: '2021-01-01',
    salary: 15000000,
    performance: 90,
    attendance: 85
  },
  {
    id: '5',
    userName: 'nigora_alieva',
    phoneNumber: '+998901234571',
    birthDate: '1994-07-25',
    passportSeria: 'AD',
    passportNumber: 5678901,
    fullName: 'Nigora Alieva',
    companyId: 'comp1',
    role: 'Seller',
    image: '',
    password: 'hashed_password',
    status: 'inactive',
    joinDate: '2023-08-12',
    salary: 4000000,
    performance: 78,
    attendance: 88
  }
];

export default function WorkersPage() {
  const [workers, setWorkers] = useState<WorkerDto[]>(generateMockWorkers());
  const [filteredWorkers, setFilteredWorkers] = useState<WorkerDto[]>(
    generateMockWorkers()
  );
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<WorkerDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [form] = Form.useForm();

  // Filter workers
  useEffect(() => {
    let filtered = workers;

    if (searchTerm) {
      filtered = filtered.filter(
        (worker) =>
          worker.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          worker.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          worker.phoneNumber.includes(searchTerm)
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter((worker) => worker.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((worker) => worker.status === statusFilter);
    }

    setFilteredWorkers(filtered);
  }, [workers, searchTerm, roleFilter, statusFilter]);

  // Statistics
  const stats = {
    total: workers.length,
    active: workers.filter((w) => w.status === 'active').length,
    inactive: workers.filter((w) => w.status === 'inactive').length,
    avgPerformance: Math.round(
      workers.reduce((acc, w) => acc + w.performance, 0) / workers.length
    ),
    avgAttendance: Math.round(
      workers.reduce((acc, w) => acc + w.attendance, 0) / workers.length
    )
  };

  // Role colors
  const getRoleColor = (role: string) => {
    const colors = {
      CEO: '#ef4444',
      Manager: '#3b82f6',
      Seller: '#6bd2bc',
      Admin: '#8b5cf6'
    };
    return colors[role as keyof typeof colors] || '#6b7280';
  };

  // Table columns
  const columns = [
    {
      title: 'Ishchi',
      key: 'worker',
      render: (record: WorkerDto) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            style={{ backgroundColor: getRoleColor(record.role) }}
          >
            {record.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </Avatar>
          <div>
            <div className="font-medium text-slate-900 dark:text-white">
              {record.fullName}
            </div>
            <div className="text-sm text-slate-500">@{record.userName}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Lavozim',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag
          color={getRoleColor(role)}
          style={{ color: 'white', border: 'none' }}
        >
          {role}
        </Tag>
      ),
      filters: [
        { text: 'CEO', value: 'CEO' },
        { text: 'Manager', value: 'Manager' },
        { text: 'Seller', value: 'Seller' },
        { text: 'Admin', value: 'Admin' }
      ],
      onFilter: (value: any, record: WorkerDto) => record.role === value
    },
    {
      title: 'Telefon',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone: string) => (
        <div className="flex items-center gap-1">
          <Phone size={14} className="text-slate-400" />
          <Text className="text-slate-900 dark:text-white">{phone}</Text>
        </div>
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
      onFilter: (value: any, record: WorkerDto) => record.status === value
    },
    {
      title: 'Ish Samarasi',
      dataIndex: 'performance',
      key: 'performance',
      render: (performance: number) => (
        <div className="w-20">
          <Progress
            percent={performance}
            size="small"
            strokeColor={
              performance > 90
                ? '#10b981'
                : performance > 70
                ? '#f59e0b'
                : '#ef4444'
            }
            showInfo={false}
          />
          <Text className="text-xs text-slate-500">{performance}%</Text>
        </div>
      ),
      sorter: (a: WorkerDto, b: WorkerDto) => a.performance - b.performance
    },
    {
      title: 'Davomat',
      dataIndex: 'attendance',
      key: 'attendance',
      render: (attendance: number) => (
        <div className="w-20">
          <Progress
            percent={attendance}
            size="small"
            strokeColor={
              attendance > 95
                ? '#10b981'
                : attendance > 85
                ? '#f59e0b'
                : '#ef4444'
            }
            showInfo={false}
          />
          <Text className="text-xs text-slate-500">{attendance}%</Text>
        </div>
      ),
      sorter: (a: WorkerDto, b: WorkerDto) => a.attendance - b.attendance
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (record: WorkerDto) => {
        const items: MenuProps['items'] = [
          {
            key: 'view',
            label: "Ko'rish",
            icon: <Eye size={14} />,
            onClick: () => {
              setSelectedWorker(record);
              setIsViewModalVisible(true);
            }
          },
          {
            key: 'edit',
            label: 'Tahrirlash',
            icon: <Edit size={14} />
          },
          {
            key: 'delete',
            label: "O'chirish",
            icon: <Trash2 size={14} />,
            danger: true
          }
        ];

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<MoreVertical size={16} />} />
          </Dropdown>
        );
      }
    }
  ];

  const handleAddWorker = (values: any) => {
    const newWorker: WorkerDto = {
      id: Date.now().toString(),
      ...values,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      performance: 0,
      attendance: 0
    };
    setWorkers([...workers, newWorker]);
    setIsAddModalVisible(false);
    form.resetFields();
    message.success("Ishchi muvaffaqiyatli qo'shildi!");
  };

  return (
    <div className="p-2 space-y-6 min-h-full">
      {/* Statistics */}
      <div>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={6}>
            <Card className="bg-gradient-to-br from-[#6fe0c8] to-[#419380da] border-0 text-white">
              <Statistic
                className="text-slate-600 dark:text-slate-400"
                title={
                  <span className="text-slate-600 dark:text-slate-400">
                    Jami Ishchilar
                  </span>
                }
                value={stats.total}
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
            <Card className="bg-gradient-to-br from-green-400 to-green-600 border-0 text-white">
              <Statistic
                className="text-slate-600 dark:text-slate-400"
                title={
                  <span className="text-slate-600 dark:text-slate-400">
                    Faol
                  </span>
                }
                value={stats.active}
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
            <Card className="bg-gradient-to-br from-blue-400 to-blue-600 border-0 text-white">
              <Statistic
                className="text-slate-600 dark:text-slate-400"
                title={
                  <span className="text-slate-600 dark:text-slate-400">
                    O'rtacha Samara
                  </span>
                }
                value={stats.avgPerformance}
                suffix={
                  <span className="text-slate-600 dark:text-slate-400">%</span>
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
                    O'rtacha Davomat
                  </span>
                }
                value={stats.avgAttendance}
                suffix={
                  <span className="text-slate-600 dark:text-slate-400">%</span>
                }
                valueStyle={{
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
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
                placeholder="Ism, username yoki telefon bo'yicha qidirish..."
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<Search size={16} />}
              />
            </Col>
            <Col xs={24} sm={4}>
              <Select
                placeholder="Lavozim"
                value={roleFilter}
                onChange={setRoleFilter}
                style={{ width: '100%' }}
                suffixIcon={<Filter size={16} />}
              >
                <Option value="all">Barcha lavozimlar</Option>
                <Option value="CEO">CEO</Option>
                <Option value="Manager">Manager</Option>
                <Option value="Seller">Seller</Option>
                <Option value="Admin">Admin</Option>
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
                <Option value="active">Faol</Option>
                <Option value="inactive">Nofaol</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <div className="flex justify-end">
                <Text className="text-slate-600 dark:text-slate-400">
                  Jami: {filteredWorkers.length} ta ishchi
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
      <div>
        <Card
          className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800"
          title={
            <div className="flex items-center justify-between">
              <Title
                level={4}
                className="!text-slate-900 dark:!text-white !mb-0"
              >
                Ishchilar Ro'yxati
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
                Yangi Ishchi
              </Button>
            </div>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredWorkers}
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
      </div>

      {/* Add Worker Modal */}
      <Modal
        title="Yangi Ishchi Qo'shish"
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
        <Form form={form} layout="vertical" onFinish={handleAddWorker}>
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
                name="userName"
                label="Username"
                rules={[{ required: true, message: 'Username kiriting' }]}
              >
                <Input placeholder="Username kiriting" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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
            <Col span={8}>
              <Form.Item
                name="passportNumber"
                label="Passport raqam"
                rules={[
                  { required: true, message: 'Passport raqamini kiriting' }
                ]}
              >
                <Input type="number" placeholder="1234567" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="role"
                label="Lavozim"
                rules={[{ required: true, message: 'Lavozimni tanlang' }]}
              >
                <Select placeholder="Lavozimni tanlang">
                  <Option value="CEO">CEO</Option>
                  <Option value="Manager">Manager</Option>
                  <Option value="Seller">Seller</Option>
                  <Option value="Admin">Admin</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="salary"
                label="Maosh"
                rules={[{ required: true, message: 'Maoshni kiriting' }]}
              >
                <Input type="number" placeholder="5000000" suffix="so'm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="companyId" label="Kompaniya ID">
                <Input placeholder="comp1" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="password"
            label="Parol"
            rules={[{ required: true, message: 'Parolni kiriting' }]}
          >
            <Input.Password placeholder="Parolni kiriting" />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Worker Modal */}
      <Modal
        title="Ishchi Ma'lumotlari"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Yopish
          </Button>
        ]}
        width={600}
      >
        {selectedWorker && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Avatar
                size={64}
                style={{ backgroundColor: getRoleColor(selectedWorker.role) }}
              >
                {selectedWorker.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </Avatar>
              <div>
                <Title level={4} className="!mb-1">
                  {selectedWorker.fullName}
                </Title>
                <Tag
                  color={getRoleColor(selectedWorker.role)}
                  style={{ color: 'white', border: 'none' }}
                >
                  {selectedWorker.role}
                </Tag>
                <div className="mt-2">
                  <Badge
                    color={selectedWorker.status === 'active' ? 'green' : 'red'}
                    text={
                      selectedWorker.status === 'active' ? 'Faol' : 'Nofaol'
                    }
                  />
                </div>
              </div>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div>
                  <Text strong>Username:</Text>
                  <div>@{selectedWorker.userName}</div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong>Telefon:</Text>
                  <div>{selectedWorker.phoneNumber}</div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong>Tug'ilgan sana:</Text>
                  <div>{selectedWorker.birthDate || 'Kiritilmagan'}</div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong>Passport:</Text>
                  <div>
                    {selectedWorker.passportSeria}{' '}
                    {selectedWorker.passportNumber}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong>Ishga kirgan sana:</Text>
                  <div>{selectedWorker.joinDate}</div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong>Maosh:</Text>
                  <div>{selectedWorker.salary.toLocaleString()} so'm</div>
                </div>
              </Col>
            </Row>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Text strong>Ish Samarasi:</Text>
                <Progress
                  percent={selectedWorker.performance}
                  strokeColor={
                    selectedWorker.performance > 90
                      ? '#10b981'
                      : selectedWorker.performance > 70
                      ? '#f59e0b'
                      : '#ef4444'
                  }
                />
              </div>
              <div>
                <Text strong>Davomat:</Text>
                <Progress
                  percent={selectedWorker.attendance}
                  strokeColor={
                    selectedWorker.attendance > 95
                      ? '#10b981'
                      : selectedWorker.attendance > 85
                      ? '#f59e0b'
                      : '#ef4444'
                  }
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
