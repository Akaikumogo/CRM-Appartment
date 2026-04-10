/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';

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
  Tooltip,
  Space,
  Spin,
} from 'antd';

import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import {
  BulkDeleteConfirmModal,
  type BulkDeleteChoice,
} from '@/components/BulkDeleteConfirmModal';
import type { ApiClientRow } from '@/api/clients';
import {
  useClientMutations,
  useClientsQuery,
  useOrganizationsQuery,
} from '@/hooks/api/crmHooks';
import { can } from '@/lib/permissions';
import { getSessionUser } from '@/lib/sessionUser';

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

function mapApiClient(c: ApiClientRow): ClientDto {
  return {
    id: c.id,
    fullName: c.fullName,
    phoneNumber: c.phone,
    passportSeria: '—',
    passportNumber: '—',
    registrationDate: c.createdAt.slice(0, 10),
    status: 'active',
    totalPurchases: 0,
    totalAmount: 0,
    purchases: [],
    lastPurchaseDate: undefined,
  };
}

export default function ClientsPage() {
  const user = getSessionUser();
  const perms = user?.effectivePermissions;
  const canBulkDelete =
    can(perms, user?.role, 'clients.delete') &&
    ['superadmin', 'org_admin'].includes(user?.role ?? '');
  const canWriteClient = can(perms, user?.role, 'clients.write');

  const [filteredClients, setFilteredClients] = useState<ClientDto[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [listOrgId, setListOrgId] = useState<string | undefined>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [form] = Form.useForm();

  const clientListOrgId =
    user?.role === 'superadmin' ? listOrgId : undefined;
  const { data: apiClientsRaw = [], isLoading: loadingClients } =
    useClientsQuery(clientListOrgId, true);
  const { data: orgs = [] } = useOrganizationsQuery(
    user?.role === 'superadmin',
  );
  const { create, bulkRemove } = useClientMutations();

  const clients = useMemo(
    () => apiClientsRaw.map(mapApiClient),
    [apiClientsRaw],
  );

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
    avgPurchases:
      clients.length > 0
        ? Math.round(
            clients.reduce((acc, c) => acc + c.totalPurchases, 0) /
              clients.length,
          )
        : 0,
  };

  const clientsBulkScopeText = useMemo(() => {
    if (user?.role === 'superadmin' && listOrgId) {
      return 'Tanlangan tashkilotdagi barcha mijozlar (API organizationId bilan bir xil doira).';
    }
    if (user?.role === 'superadmin') {
      return 'Barcha tashkilotlardagi mijozlar (superadmin global doira).';
    }
    return 'Tashkilotingizdagi barcha mijozlar (API ro‘yxati bilan bir xil).';
  }, [user?.role, listOrgId]);

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
          </div>
        );
      }
    }
  ];

  const handleAddClient = async (values: any) => {
    try {
      const orgId =
        user?.role === 'superadmin'
          ? values.organizationId
          : user?.organizationId;
      if (!orgId) {
        message.error('Tashkilot tanlang yoki sessiyada org yo‘q');
        return;
      }
      await create.mutateAsync({
        orgId,
        body: {
          fullName: values.fullName,
          phone: String(values.phoneNumber).replace(/\s/g, ''),
        },
      });
      setIsAddModalVisible(false);
      form.resetFields();
      message.success("Mijoz qo'shildi");
    } catch {
      message.error('Qo‘shib bo‘lmadi (telefon formati / ruxsat)');
    }
  };

  const runBulkDeleteClients = async (choice: BulkDeleteChoice) => {
    try {
      if (choice === 'selected') {
        await bulkRemove.mutateAsync({ ids: selectedRowKeys });
      } else {
        const body: { deleteAllInScope: true; organizationId?: string } = {
          deleteAllInScope: true,
        };
        if (user?.role === 'superadmin' && listOrgId) {
          body.organizationId = listOrgId;
        }
        await bulkRemove.mutateAsync(body);
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
      </div>

      {/* Filters */}
      <div>
        <Card className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={user?.role === 'superadmin' ? 6 : 8}>
              <AntSearch
                placeholder="Ism, telefon yoki email bo'yicha qidirish..."
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<Search size={16} />}
              />
            </Col>
            {user?.role === 'superadmin' ? (
              <Col xs={24} sm={6}>
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Tashkilot (ro‘yxat filtri)"
                  style={{ width: '100%' }}
                  value={listOrgId}
                  onChange={(v) => {
                    setListOrgId(v);
                    setSelectedRowKeys([]);
                  }}
                  options={orgs.map((o) => ({
                    value: o.id,
                    label: o.name,
                  }))}
                />
              </Col>
            ) : null}
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
            <Col xs={24} sm={user?.role === 'superadmin' ? 8 : 12}>
              <div className="flex justify-end">
                <Text className="text-slate-600 dark:text-slate-400">
                  Jami: {filteredClients.length} ta mijoz • O'rtacha:{' '}
                  {stats.avgPurchases} ta xarid
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Clients Table */}
      <div>
        <Card
          className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800"
          title={
            <div className="flex items-center justify-between">
              <Title level={4} className="!!text-white !mb-0">
                Mijozlar Ro'yxati
              </Title>
              <Space wrap>
                {canBulkDelete ? (
                  <Button danger onClick={() => setBulkDeleteOpen(true)}>
                    O‘chirish
                  </Button>
                ) : null}
                {canWriteClient ? (
                  <Button
                    type="primary"
                    size="large"
                    icon={<UserPlus size={18} />}
                    onClick={() => setIsAddModalVisible(true)}
                    style={{
                      background: '#6bd2bc',
                      border: 'none',
                    }}
                  >
                    Yangi Mijoz
                  </Button>
                ) : null}
              </Space>
            </div>
          }
        >
          <Spin spinning={loadingClients}>
            <Table
            columns={columns}
            dataSource={filteredClients}
            rowKey="id"
            rowSelection={
              canBulkDelete
                ? {
                    selectedRowKeys,
                    onChange: (keys) => setSelectedRowKeys(keys as string[]),
                  }
                : undefined
            }
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
          </Spin>
        </Card>
      </div>

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
          {user?.role === 'superadmin' ? (
            <Form.Item
              name="organizationId"
              label="Tashkilot"
              rules={[{ required: true, message: 'Tanlang' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Tashkilot"
                options={orgs.map((o) => ({ value: o.id, label: o.name }))}
              />
            </Form.Item>
          ) : null}
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
              <Form.Item name="passportSeria" label="Passport seriya (ixtiyoriy)">
                <Input placeholder="AD" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="passportNumber" label="Passport raqam (ixtiyoriy)">
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

      <BulkDeleteConfirmModal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        entityLabel="Mijozlar"
        selectedCount={selectedRowKeys.length}
        scopeDescription={clientsBulkScopeText}
        onConfirm={runBulkDeleteClients}
      />
    </div>
  );
}
