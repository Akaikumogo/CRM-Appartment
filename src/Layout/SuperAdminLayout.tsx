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
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTranslation } from '@/hooks/useTranslation';
import { ConfigProvider, Select } from 'antd';
import { clearSessionAuth, getSessionUser } from '@/lib/sessionUser';

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
    label: {
      uz: 'Inventar (org / filial)',
      en: 'Inventory',
      ru: 'Инвентарь',
    },
    icon: LayoutGrid,
  },
];

const SuperAdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t, lang, setLang } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const sessionUser = getSessionUser();

  const title = useMemo(() => {
    const item = superNav.find(
      (n) =>
        location.pathname === n.path ||
        location.pathname.startsWith(n.path + '/'),
    );
    return item?.label ?? superNav[0].label;
  }, [location.pathname]);

  if (sessionUser?.role !== 'superadmin') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-red-500">
        Ruxsat yo‘q
      </div>
    );
  }

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#6bd2bc' } }}>
      <div className="min-h-screen bg-slate-50 dark:bg-black">
        <div className="flex min-h-screen w-screen">
          <aside
            style={{ width: isCollapsed ? 100 : 300 }}
            className="border-r border-amber-500/40 bg-slate-50 dark:bg-[#0a0a0a] transition-all duration-300"
          >
            <div className="flex h-full flex-col">
              <div
                className="flex h-20 cursor-pointer items-center border-b border-amber-500/30 px-6"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <Shield className="h-9 w-9 text-amber-500" />
                {!isCollapsed && (
                  <div className="ml-3">
                    <h1 className="font-bold text-slate-900 dark:text-white">
                      Superadmin
                    </h1>
                    <p className="text-xs text-slate-500">SaaS boshqaruv</p>
                  </div>
                )}
              </div>
              <nav className="flex-1 space-y-1 p-4">
                {superNav.map((item) => {
                  const Icon = item.icon;
                  const active =
                    location.pathname === item.path ||
                    location.pathname.startsWith(item.path + '/');
                  return (
                    <NavLink key={item.path} to={item.path}>
                      <div
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-colors ${
                          active
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon size={20} />
                        {!isCollapsed && <span>{t(item.label)}</span>}
                      </div>
                    </NavLink>
                  );
                })}
              </nav>
              <div className="p-4">
                <button
                  type="button"
                  onClick={() => {
                    clearSessionAuth();
                    navigate('/login');
                  }}
                  className="flex w-full items-center gap-2 rounded-xl p-3 text-slate-600 dark:text-slate-300"
                >
                  <LogOut size={20} />
                  {!isCollapsed && <span>Logout</span>}
                </button>
              </div>
            </div>
          </aside>
          <div className="flex min-h-screen flex-1 flex-col">
            <header className="flex items-center justify-between border-b border-amber-500/30 bg-white/80 px-8 py-4 dark:bg-[#101010]">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t(title)}
              </h1>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Select
                  value={lang}
                  style={{ width: 130 }}
                  onChange={(v) => setLang(v)}
                  options={[
                    { value: 'en', label: 'EN' },
                    { value: 'ru', label: 'RU' },
                    { value: 'uz', label: 'UZ' },
                  ]}
                />
                <span className="hidden text-sm text-slate-500 sm:inline">
                  {sessionUser.email}
                </span>
              </div>
            </header>
            <main className="flex-1 overflow-auto bg-slate-50/80 p-4 dark:bg-[#0f0f0f]">
              <AnimatePresence mode="sync">
                <Outlet />
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default SuperAdminLayout;
