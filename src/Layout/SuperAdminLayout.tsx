import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import {
  Building2,
  Wallet,
  Ban,
  Bell,
  LogOut,
  Shield,
  Database,
  LayoutGrid,
  KeyRound,
  ChevronRight,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTranslation } from '@/hooks/useTranslation';
import { ConfigProvider, Dropdown, Form, Input, Modal, Select, message } from 'antd';
import type { MenuProps } from 'antd';
import { clearSessionAuth, getSessionUser } from '@/lib/sessionUser';
import { changeMyPassword } from '@/api/users';

const superNav = [
  {
    path: '/admin/organizations',
    label: { uz: 'Tashkilotlar', en: 'Organizations', ru: 'Организации' },
    icon: Building2,
  },
  {
    path: '/admin/kassa',
    label: { uz: 'Kassa', en: 'Cash desk', ru: 'Касса' },
    icon: Wallet,
  },
  {
    path: '/admin/blocked',
    label: { uz: 'Bloklanganlar', en: 'Blocked', ru: 'Заблокированные' },
    icon: Ban,
  },
  {
    path: '/admin/notifications',
    label: { uz: 'Bildirishnomalar', en: 'Notifications', ru: 'Уведомления' },
    icon: Bell,
  },
  {
    path: '/admin/permissions',
    label: { uz: 'Ruxsat kalitlari', en: 'Permission keys', ru: 'Ключи прав' },
    icon: Shield,
  },
  {
    path: '/admin/backups',
    label: { uz: 'Backup', en: 'Backups', ru: 'Бэкапы' },
    icon: Database,
  },
  {
    path: '/admin/inventory',
    label: { uz: 'Inventar (org / filial)', en: 'Inventory', ru: 'Инвентарь' },
    icon: LayoutGrid,
  },
];

const SuperAdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [changePassOpen, setChangePassOpen] = useState(false);
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [changePassForm] = Form.useForm();
  const { t, lang, setLang } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const sessionUser = getSessionUser();

  const title = useMemo(() => {
    const item = superNav.find(
      (n) => location.pathname === n.path || location.pathname.startsWith(n.path + '/'),
    );
    return item?.label ?? superNav[0].label;
  }, [location.pathname]);

  const handleChangePassword = async (values: {
    oldPassword: string;
    newPassword: string;
  }) => {
    setChangePassLoading(true);
    try {
      await changeMyPassword(values.oldPassword, values.newPassword);
      void message.success('Parol muvaffaqiyatli o\'zgartirildi');
      setChangePassOpen(false);
      changePassForm.resetFields();
    } catch {
      void message.error('Xatolik: joriy parol noto\'g\'ri yoki server xatosi');
    } finally {
      setChangePassLoading(false);
    }
  };

  const avatarMenuItems: MenuProps['items'] = [
    {
      key: 'email',
      label: (
        <span className="text-xs text-slate-400">{sessionUser?.email}</span>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'change-pass',
      icon: <KeyRound size={14} />,
      label: 'Parolimni o\'zgartirish',
      onClick: () => setChangePassOpen(true),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogOut size={14} />,
      label: 'Chiqish',
      danger: true,
      onClick: () => { clearSessionAuth(); navigate('/login'); },
    },
  ];

  if (sessionUser?.role !== 'superadmin') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-red-500">
        Ruxsat yo'q
      </div>
    );
  }

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#f59e0b' } }}>
      <div className="min-h-screen bg-slate-50 dark:bg-black">
        <div className="flex min-h-screen w-screen">
          {/* Sidebar */}
          <aside
            style={{ width: isCollapsed ? 72 : 260 }}
            className="relative flex flex-col border-r border-amber-500/30 bg-white shadow-sm dark:bg-[#0a0a0a] transition-all duration-300"
          >
            {/* Logo */}
            <button
              type="button"
              className="flex h-16 w-full cursor-pointer items-center gap-3 border-b border-amber-500/20 px-5 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500 shadow">
                <Shield className="h-5 w-5 text-white" />
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                    Superadmin
                  </p>
                  <p className="truncate text-[10px] uppercase tracking-widest text-amber-600">
                    SaaS boshqaruv
                  </p>
                </div>
              )}
              {!isCollapsed && (
                <ChevronRight size={14} className="ml-auto text-slate-400" />
              )}
            </button>

            {/* Nav */}
            <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
              {superNav.map((item) => {
                const Icon = item.icon;
                const active =
                  location.pathname === item.path ||
                  location.pathname.startsWith(item.path + '/');
                return (
                  <NavLink key={item.path} to={item.path}>
                    <div
                      title={isCollapsed ? t(item.label) : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      {!isCollapsed && <span className="truncate">{t(item.label)}</span>}
                      {active && !isCollapsed && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-500" />
                      )}
                    </div>
                  </NavLink>
                );
              })}
            </nav>

            {/* User avatar at bottom */}
            <div className="border-t border-slate-100 p-3 dark:border-slate-800">
              <Dropdown menu={{ items: avatarMenuItems }} trigger={['click']} placement="topRight">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                      {(sessionUser.email ?? 'S').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  {!isCollapsed && (
                    <div className="min-w-0 text-left">
                      <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                        {sessionUser.fullName || 'Superadmin'}
                      </p>
                      <p className="truncate text-[10px] text-slate-400">
                        {sessionUser.email}
                      </p>
                    </div>
                  )}
                </button>
              </Dropdown>
            </div>
          </aside>

          {/* Main */}
          <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
            <header className="flex items-center justify-between border-b border-amber-500/20 bg-white/80 px-8 py-4 shadow-sm backdrop-blur dark:bg-[#101010]">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t(title)}
                </h1>
                <p className="text-xs text-slate-400">Superadmin panel</p>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Select
                  value={lang}
                  style={{ width: 100 }}
                  size="small"
                  onChange={(v) => setLang(v)}
                  options={[
                    { value: 'en', label: 'EN' },
                    { value: 'ru', label: 'RU' },
                    { value: 'uz', label: 'UZ' },
                  ]}
                />
              </div>
            </header>
            <main className="flex-1 overflow-auto bg-slate-50/80 p-5 dark:bg-[#0f0f0f]">
              <AnimatePresence mode="sync">
                <Outlet />
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-amber-500" />
            <span>Superadmin parolini o'zgartirish</span>
          </div>
        }
        open={changePassOpen}
        onCancel={() => { setChangePassOpen(false); changePassForm.resetFields(); }}
        onOk={() => changePassForm.submit()}
        okText="Saqlash"
        cancelText="Bekor qilish"
        confirmLoading={changePassLoading}
        okButtonProps={{ style: { backgroundColor: '#f59e0b', border: 'none' } }}
        destroyOnClose
      >
        <Form form={changePassForm} layout="vertical" onFinish={handleChangePassword} className="mt-2">
          <Form.Item
            name="oldPassword"
            label="Joriy parol"
            rules={[{ required: true, message: 'Joriy parolni kiriting' }]}
          >
            <Input.Password placeholder="Joriy parolingiz" autoComplete="current-password" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Yangi parol"
            rules={[{ required: true, min: 8, message: 'Kamida 8 belgi bo\'lishi kerak' }]}
          >
            <Input.Password placeholder="Yangi parol (kamida 8 belgi)" autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Yangi parolni tasdiqlang"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Parolni tasdiqlang' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('Parollar mos kelmadi'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Yangi parolni qayta kiriting" autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
    </ConfigProvider>
  );
};

export default SuperAdminLayout;
