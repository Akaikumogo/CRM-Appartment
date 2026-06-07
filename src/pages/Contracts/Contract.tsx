/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
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
  Avatar,
  Spin
} from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import {
  BulkDeleteConfirmModal,
  type BulkDeleteChoice,
} from '@/components/BulkDeleteConfirmModal';
import type { ApartmentWithContext } from '@/api/salesInventory';
import {
  useClientsQuery,
  useContractMutations,
  useContractsQuery,
  useSalesInventoryQuery,
  useUsersQuery,
} from '@/hooks/api/crmHooks';
import { getSessionUser } from '@/lib/sessionUser';
import type { ContractRow } from '@/api/contracts';

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

type ApiContractRow = ContractRow;

function coerceContractStatus(s: string | undefined): ContractDto['status'] {
  if (
    s === 'active' ||
    s === 'completed' ||
    s === 'cancelled' ||
    s === 'pending'
  ) {
    return s;
  }
  return 'pending';
}

function coercePaymentStatus(s: string | undefined): ContractDto['paymentStatus'] {
  if (s === 'paid' || s === 'partial' || s === 'unpaid') {
    return s;
  }
  return 'unpaid';
}

function mapApiContract(c: ApiContractRow): ContractDto {
  const apt = c.apartment;
  const block = apt?.floor?.block;
  return {
    contractId: c.id,
    appartmentId: c.apartmentId,
    clientId: c.clientId,
    userId: c.sellerId ?? '',
    contractDate: c.contractDate,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    companyId: c.organizationId ?? '',
    clientName: c.client?.fullName ?? '',
    clientPhone: c.client?.phone ?? '',
    apartmentNumber: String(apt?.number ?? ''),
    blockName: block?.name ?? block?.code ?? '',
    floorNumber: apt?.floor?.level ?? 0,
    sellerName: c.seller?.fullName || c.seller?.email || '—',
    contractAmount: Number(c.amount),
    status: coerceContractStatus(c.status ?? undefined),
    paymentStatus: coercePaymentStatus(c.paymentStatus ?? undefined),
    progress: c.progressPercent ?? 0,
  };
}

function apartmentOptionLabel(a: ApartmentWithContext) {
  const b = a.floor?.block;
  const block = b
    ? `${b.name}${b.code ? ` (${b.code})` : ''}`
    : 'Blok';
  const fl = a.floor?.level ?? '?';
  return `${block} · ${fl}-qat · №${a.number} · ${a.status}`;
}

export default function ContractsPage() {
  const { data: contractsRaw = [], isLoading: loading } = useContractsQuery();
  const { create, bulkRemove } = useContractMutations();

  const contracts = useMemo(
    () => (contractsRaw as ApiContractRow[]).map(mapApiContract),
    [contractsRaw],
  );

  const [filteredContracts, setFilteredContracts] = useState<ContractDto[]>(
    [],
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractDto | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [form] = Form.useForm();
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const { data: inventory, isLoading: inventoryLoading } =
    useSalesInventoryQuery(isAddModalVisible);
  const { data: usersList = [], isLoading: usersLoading } =
    useUsersQuery(isAddModalVisible);
  const { data: clientsList = [], isLoading: clientsLoading } = useClientsQuery(
    undefined,
    isAddModalVisible,
  );

  const clientOptions = useMemo(
    () =>
      clientsList.map((c) => ({
        value: c.id,
        label: `${c.fullName} · ${c.phone}`,
      })),
    [clientsList],
  );

  const apartmentOptions = useMemo(() => {
    const apts = inventory?.apartments ?? [];
    return [...apts]
      .sort((x, y) => {
        const bx = x.floor?.block?.name ?? '';
        const by = y.floor?.block?.name ?? '';
        if (bx !== by) {
          return bx.localeCompare(by);
        }
        const lx = x.floor?.level ?? 0;
        const ly = y.floor?.level ?? 0;
        if (lx !== ly) {
          return lx - ly;
        }
        return String(x.number).localeCompare(String(y.number), undefined, {
          numeric: true,
        });
      })
      .map((a) => ({
        value: a.id,
        label: apartmentOptionLabel(a),
      }));
  }, [inventory?.apartments]);

  const sellerOptions = useMemo(
    () =>
      usersList.map((u) => ({
        value: u.id,
        label: `${u.fullName || u.email} (${u.email}) · ${u.role}`,
      })),
    [usersList],
  );

  useEffect(() => {
    if (!isAddModalVisible) {
      return;
    }
    const u = getSessionUser();
    form.setFieldsValue({
      sellerId: u?.id,
      contractDate: dayjs(),
    });
  }, [isAddModalVisible, form]);

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
                navigate(`/dashboard/contracts/${record.contractId}`);
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const handleAddContract = async (values: any) => {
    try {
      await create.mutateAsync({
        apartmentId: values.apartmentId,
        clientId: values.clientId,
        sellerId: values.sellerId || undefined,
        contractDate: dayjs(values.contractDate).format('YYYY-MM-DD'),
        amount: Number(values.contractAmount),
        status: values.status ?? 'pending',
        paymentStatus: values.paymentStatus ?? 'unpaid',
        progressPercent: values.progress ? Number(values.progress) : 0,
      });
      setIsAddModalVisible(false);
      form.resetFields();
      message.success("Shartnoma muvaffaqiyatli qo'shildi!");
    } catch {
      message.error('Saqlashda xatolik (tanlovlar va ruxsatlarni tekshiring)');
    }
  };

  const canBulkDelete = ['superadmin', 'org_admin'].includes(
    getSessionUser()?.role ?? '',
  );

  const runBulkDeleteContracts = async (choice: BulkDeleteChoice) => {
    try {
      if (choice === 'selected') {
        await bulkRemove.mutateAsync({ ids: selectedRowKeys });
      } else {
        await bulkRemove.mutateAsync({ deleteAllInScope: true });
      }
      message.success('O‘chirildi');
      setSelectedRowKeys([]);
    } catch {
      message.error('O‘chirishda xatolik');
    }
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
              <Space>
                {canBulkDelete && (
                  <Button danger onClick={() => setBulkDeleteOpen(true)}>
                    O‘chirish
                  </Button>
                )}
                <Button
                  type="primary"
                  size="large"
                  icon={<Plus size={18} />}
                  onClick={() => {
                    form.resetFields();
                    setIsAddModalVisible(true);
                  }}
                  style={{
                    background: '#6bd2bc',
                    border: 'none'
                  }}
                >
                  Yangi Shartnoma
                </Button>
              </Space>
            </div>
          }
        >
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={filteredContracts}
              rowKey="contractId"
              rowSelection={
                canBulkDelete
                  ? {
                      selectedRowKeys,
                      onChange: (keys) =>
                        setSelectedRowKeys(keys as string[]),
                    }
                  : undefined
              }
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
          </Spin>
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
          <Text type="secondary" className="mb-2 block text-sm">
            Kvartira va mijozni ro‘yxatdan tanlang. Sotuvchi sukut bo‘yicha siz
            (joriy akkaunt).
          </Text>
          <Form.Item
            name="apartmentId"
            label="Kvartira"
            rules={[{ required: true, message: 'Kvartira tanlang' }]}
          >
            <Select
              showSearch
              placeholder="Blok / qavat / raqam bo‘yicha qidiring"
              options={apartmentOptions}
              optionFilterProp="label"
              loading={inventoryLoading}
              allowClear
            />
          </Form.Item>
          <Form.Item
            name="clientId"
            label="Mijoz"
            rules={[{ required: true, message: 'Mijoz tanlang' }]}
          >
            <Select
              showSearch
              placeholder="Ism yoki telefon bo‘yicha qidiring"
              options={clientOptions}
              optionFilterProp="label"
              loading={clientsLoading}
              allowClear
            />
          </Form.Item>
          <Form.Item
            name="sellerId"
            label="Sotuvchi"
            tooltip="Sukut: tizimga kirgan foydalanuvchi"
          >
            <Select
              showSearch
              allowClear
              placeholder="Sotuvchi"
              options={sellerOptions}
              optionFilterProp="label"
              loading={usersLoading}
            />
          </Form.Item>
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
              <Form.Item
                name="contractAmount"
                label="Summa"
                rules={[{ required: true, message: 'Summani kiriting' }]}
              >
                <Input type="number" placeholder="95000" prefix="$" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="status" label="Holat" initialValue="pending">
                <Select>
                  <Option value="pending">Kutilmoqda</Option>
                  <Option value="active">Faol</Option>
                  <Option value="completed">Tugallangan</Option>
                  <Option value="cancelled">Bekor</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="paymentStatus"
                label="To‘lov"
                initialValue="unpaid"
              >
                <Select>
                  <Option value="unpaid">To‘lanmagan</Option>
                  <Option value="partial">Qisman</Option>
                  <Option value="paid">To‘langan</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="progress" label="Progress %" initialValue={0}>
                <Input type="number" min={0} max={100} />
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

      <BulkDeleteConfirmModal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        entityLabel="Shartnomalar"
        selectedCount={selectedRowKeys.length}
        scopeDescription="Ruxsat doirasidagi barcha shartnomalar (API ro‘yxati bilan bir xil filial/tashkilot chegarasi; joriy sahifa filtrlari emas)."
        onConfirm={runBulkDeleteContracts}
      />
    </div>
  );
}
