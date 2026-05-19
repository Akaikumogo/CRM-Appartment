/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Eye,
  Edit,
  Trash2,
  KeyRound,
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
  message,
  Dropdown,
  Statistic,
  Progress,
  Spin,
  Space,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  BulkDeleteConfirmModal,
  type BulkDeleteChoice,
} from '@/components/BulkDeleteConfirmModal';
import {
  useBranchesOrgQuery,
  useOrganizationsQuery,
  useUserMutations,
  useUsersQuery,
} from '@/hooks/api/crmHooks';
import { getSessionUser } from '@/lib/sessionUser';
import { adminChangeUserPassword } from '@/api/users';

const { Title, Text } = Typography;
const { Search: AntSearch } = Input;
const { Option } = Select;

export type WorkerDto = {
  id: string;
  userName: string;
  phoneNumber: string;
  birthDate?: string;
  passportSeria: string;
  passportNumber: number;
  fullName: string;
  companyId: string;
  role: string;
  image?: string;
  password: string;
  status: 'active' | 'inactive';
  joinDate: string;
  salary: number;
  performance: number;
};

type ApiUserRow = {
  id: string;
  email: string;
  fullName?: string | null;
  organizationId?: string | null;
  role: string;
};

function mapApiUser(u: ApiUserRow): WorkerDto {
  return {
    id: u.id,
    userName: u.email,
    phoneNumber: '—',
    passportSeria: '—',
    passportNumber: 0,
    fullName: u.fullName || u.email,
    companyId: u.organizationId ?? '—',
    role: u.role,
    password: '',
    status: 'active',
    joinDate: '',
    salary: 0,
    performance: 0,
  };
}

export default function WorkersPage() {
  const navigate = useNavigate();
  const me = getSessionUser();
  const { data: usersRaw = [], isLoading: loadingUsers } = useUsersQuery();
  const { create, remove, bulkRemove } = useUserMutations();

  const isSuperadmin = me?.role === 'superadmin';
  const { data: organizations = [] } = useOrganizationsQuery(isSuperadmin);
  const [selectedOrgId, setSelectedOrgId] = useState<string | undefined>(undefined);
  const targetOrgId = isSuperadmin ? selectedOrgId : (me?.organizationId ?? undefined);
  const { data: branches = [] } = useBranchesOrgQuery(targetOrgId, !!targetOrgId);

  const workers = useMemo(
    () => usersRaw.map(mapApiUser),
    [usersRaw],
  );

  const [filteredWorkers, setFilteredWorkers] = useState<WorkerDto[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<WorkerDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [form] = Form.useForm();
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [changePassTarget, setChangePassTarget] = useState<WorkerDto | null>(null);
  const [changePassForm] = Form.useForm();

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
    avgPerformance:
      workers.length === 0
        ? 0
        : Math.round(
            workers.reduce((acc, w) => acc + w.performance, 0) /
              workers.length,
          ),
  };

  // Role colors
  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      superadmin: '#ef4444',
      org_admin: '#8b5cf6',
      staff: '#6bd2bc',
      CEO: '#ef4444',
      Manager: '#3b82f6',
      Seller: '#6bd2bc',
      Admin: '#8b5cf6',
    };
    return colors[role] || '#6b7280';
  };

  const canBulk = ['superadmin', 'org_admin'].includes(me?.role ?? '');

  const openDeleteUser = (record: WorkerDto) => {
    if (record.id === me?.id) {
      message.warning('O‘z akkauntingizni o‘chirib bo‘lmaydi');
      return;
    }
    if (record.role === 'superadmin') {
      message.error('Superadminni o‘chirib bo‘lmaydi');
      return;
    }
    Modal.confirm({
      title: 'Foydalanuvchini o‘chirish?',
      content: `${record.fullName} (${record.userName})`,
      okText: 'O‘chirish',
      okType: 'danger',
      cancelText: 'Bekor',
      onOk: async () => {
        try {
          await remove.mutateAsync(record.id);
          message.success('O‘chirildi');
          setSelectedRowKeys((keys) => keys.filter((k) => k !== record.id));
        } catch {
          message.error('O‘chirishda xatolik');
        }
      },
    });
  };

  const handleAdminChangePassword = async (values: { newPassword: string }) => {
    if (!changePassTarget) return;
    try {
      await adminChangeUserPassword(changePassTarget.id, values.newPassword);
      message.success('Parol muvaffaqiyatli yangilandi');
      setChangePassTarget(null);
      changePassForm.resetFields();
    } catch {
      message.error('Parolni o\'zgartirishda xatolik');
    }
  };

  const onEditUser = (record: WorkerDto) => {
    if (record.role === 'staff' && me?.role === 'org_admin') {
      navigate('/dashboard/permissions');
      return;
    }
    message.info(
      'STAFF ruxsatlari «Ruxsatlar» sahifasidan; boshqa rollar uchun alohida tahrir endpointi yo‘q.',
    );
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
        { text: 'superadmin', value: 'superadmin' },
        { text: 'org_admin', value: 'org_admin' },
        { text: 'staff', value: 'staff' },
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
      title: 'Amallar',
      key: 'actions',
      render: (record: WorkerDto) => {
        const canChangePass =
          (me?.role === 'superadmin' || me?.role === 'org_admin') &&
          record.role !== 'superadmin' &&
          record.id !== me?.id;

        const items: MenuProps['items'] = [
          {
            key: 'view',
            label: "Ko'rish",
            icon: <Eye size={14} />,
            onClick: () => {
              setSelectedWorker(record);
              setIsViewModalVisible(true);
            },
          },
          ...(me?.role === 'org_admin' && record.role === 'staff'
            ? [
                {
                  key: 'edit',
                  label: 'Ruxsatlar',
                  icon: <Edit size={14} />,
                  onClick: () => onEditUser(record),
                } as const,
              ]
            : []),
          ...(canChangePass
            ? [
                {
                  key: 'change-password',
                  label: 'Parol o\'zgartirish',
                  icon: <KeyRound size={14} />,
                  onClick: () => {
                    setChangePassTarget(record);
                    changePassForm.resetFields();
                  },
                } as const,
              ]
            : []),
          ...(canBulk &&
          record.id !== me?.id &&
          record.role !== 'superadmin'
            ? [
                {
                  key: 'delete',
                  label: "O'chirish",
                  icon: <Trash2 size={14} />,
                  danger: true,
                  onClick: () => openDeleteUser(record),
                } as const,
              ]
            : []),
        ];

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<MoreVertical size={16} />} />
          </Dropdown>
        );
      }
    }
  ];

  const handleAddWorker = async (values: any) => {
    try {
      if (values.role === ‘staff’ && !values.branchId) {
        message.error(‘Staff uchun filial tanlang’);
        return;
      }
      await create.mutateAsync({
        email: values.email,
        password: values.password,
        role: values.role,
        fullName: values.fullName,
        organizationId: isSuperadmin ? values.organizationId : undefined,
        branchId: values.role === ‘staff’ ? values.branchId : undefined,
      });
      setIsAddModalVisible(false);
      form.resetFields();
      setSelectedOrgId(undefined);
      message.success("Ishchi muvaffaqiyatli qo’shildi!");
    } catch {
      message.error("Qo’shib bo’lmadi. Maydonlarni tekshiring.");
    }
  };

  const runBulkDeleteUsers = async (choice: BulkDeleteChoice) => {
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
                    Nofaol
                  </span>
                }
                value={stats.inactive}
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
              <Space>
                {canBulk && (
                  <Button danger onClick={() => setBulkDeleteOpen(true)}>
                    O‘chirish
                  </Button>
                )}
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
              </Space>
            </div>
          }
        >
          <Spin spinning={loadingUsers}>
            <Table
              columns={columns}
              dataSource={filteredWorkers}
              rowKey="id"
              rowSelection={
                canBulk
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
              scroll={{ x: 1000 }}
              size="middle"
            />
          </Spin>
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
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input placeholder="user@company.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Parol"
            rules={[{ required: true, min: 8, message: 'min 8 belgi' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="fullName" label="To‘liq ism">
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true }]}
            initialValue="staff"
          >
            <Select>
              <Option value="staff">staff</Option>
              <Option value="org_admin">org_admin</Option>
            </Select>
          </Form.Item>
          {isSuperadmin && (
            <Form.Item
              name="organizationId"
              label="Tashkilot"
              rules={[{ required: true, message: 'Tashkilotni tanlang' }]}
            >
              <Select
                showSearch
                placeholder="Tashkilotni tanlang"
                optionFilterProp="label"
                onChange={(val) => {
                  setSelectedOrgId(val as string);
                  form.setFieldValue('branchId', undefined);
                }}
                options={organizations.map((o: any) => ({
                  value: o.id,
                  label: o.name ?? o.id,
                }))}
              />
            </Form.Item>
          )}
          {(isSuperadmin || me?.role === 'org_admin') && (
            <Form.Item
              noStyle
              shouldUpdate={(prev, cur) => prev.role !== cur.role}
            >
              {({ getFieldValue }) =>
                getFieldValue('role') === 'staff' ? (
                  <Form.Item
                    name="branchId"
                    label="Filial"
                    rules={[{ required: true, message: 'Filialni tanlang' }]}
                  >
                    <Select
                      showSearch
                      placeholder={
                        isSuperadmin && !targetOrgId
                          ? 'Avval tashkilot tanlang'
                          : 'Filialni tanlang'
                      }
                      disabled={isSuperadmin && !targetOrgId}
                      optionFilterProp="label"
                      options={branches.map((b: any) => ({
                        value: b.id,
                        label: b.name ?? b.id,
                      }))}
                    />
                  </Form.Item>
                ) : null
              }
            </Form.Item>
          )}
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

            <div className="mt-4">
              <Text strong>Ish samarasi (CRM):</Text>
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
          </div>
        )}
      </Modal>

      {/* Admin: Parol o'zgartirish modal */}
      <Modal
        title={`Parol o'zgartirish — ${changePassTarget?.fullName ?? ''}`}
        open={!!changePassTarget}
        onCancel={() => { setChangePassTarget(null); changePassForm.resetFields(); }}
        onOk={() => changePassForm.submit()}
        okText="Saqlash"
        cancelText="Bekor qilish"
        okButtonProps={{ style: { backgroundColor: '#6bd2bc', border: 'none' } }}
      >
        <Form form={changePassForm} layout="vertical" onFinish={handleAdminChangePassword}>
          <Form.Item
            name="newPassword"
            label="Yangi parol"
            rules={[{ required: true, min: 8, message: 'Kamida 8 belgi kiriting' }]}
          >
            <Input.Password placeholder="Yangi parol (kamida 8 belgi)" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Parolni tasdiqlang"
            dependencies={['newPassword']}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Parollar mos kelmadi'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Parolni qayta kiriting" />
          </Form.Item>
        </Form>
      </Modal>

      <BulkDeleteConfirmModal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        entityLabel="Xodimlar"
        selectedCount={selectedRowKeys.length}
        scopeDescription="Ruxsat doirasidagi barcha xodimlar (joriy sahifa va jadval filtrlari emas — backend ro‘yxati bilan bir xil chegaralar)."
        onConfirm={runBulkDeleteUsers}
      />
    </div>
  );
}
