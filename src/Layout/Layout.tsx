import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Users,
  Search,
  LogOut,
  Layers3,
  LayoutGrid,
  UserPlus,
  ClipboardList,
  RectangleGoggles,
  TrendingUp,
  FileText,
  GitBranch,
  Shield,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { OrganizationBlockedScreen } from '@/components/OrganizationBlockedScreen';
import { useTranslation } from '@/hooks/useTranslation';
import { ConfigProvider, Input, Select } from 'antd';
import { Sidebar } from './SideBar';
import { canAccessRoute, refreshAuthMe } from '@/lib/permissions';
import {
  clearSessionAuth,
  getSessionUser,
  isOrgBlockedInSession,
  type SessionUser,
} from '@/lib/sessionUser';

const baseNavItems = [
  {
    path: '/dashboard/home',
    label: { uz: 'Bosh sahifa', en: 'Overview', ru: 'Главная' },
    icon: Home
  },
  {
    path: '/dashboard/sales-indicators',
    label: {
      uz: "Sotuv ko'rsatkichlari",
      en: 'Sales Indicators',
      ru: 'Показатели продаж'
    },
    icon: TrendingUp
  },
  {
    path: '/dashboard/workers',
    label: { uz: 'Ishchilar', en: 'Workers', ru: 'Рабочие' },
    icon: Users
  },
  {
    path: '/dashboard/blocks',
    label: { uz: 'Bloklar', en: 'Blocks', ru: 'Блоки' },
    icon: Layers3
  },
  {
    path: '/dashboard/floors',
    label: { uz: 'Qavatlar', en: 'Floors', ru: 'Этажи' },
    icon: LayoutGrid
  },
  {
    path: '/dashboard/appartments',
    label: { uz: 'Kvartiralar', en: 'Appartments', ru: 'Квартиры' },
    icon: Home
  },
  {
    path: '/dashboard/clients',
    label: { uz: 'Mijozlar', en: 'Clients', ru: 'Клиенты' },
    icon: UserPlus
  },
  {
    path: '/dashboard/contracts',
    label: { uz: 'Shartnomalar', en: 'Contracts', ru: 'Контракты' },
    icon: ClipboardList
  },
  {
    path: '/dashboard/show-rooms',
    label: {
      uz: "Ko'rgazma xonalar",
      en: 'Show Rooms',
      ru: 'Показательные комнаты'
    },
    icon: RectangleGoggles
  }
];

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [orgBlocked, setOrgBlocked] = useState(() => isOrgBlockedInSession());
  const [me, setMe] = useState<SessionUser | null>(() => getSessionUser());
  const { t, lang, setLang } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    void refreshAuthMe().then(() => setMe(getSessionUser()));
  }, []);

  useEffect(() => {
    if (me?.role === 'superadmin') {
      navigate('/admin/organizations', { replace: true });
    }
  }, [me?.role, navigate]);

  useEffect(() => {
    if (!me) {
      return;
    }
    if (!canAccessRoute(location.pathname, me)) {
      navigate('/dashboard/home', { replace: true });
    }
  }, [location.pathname, me, navigate]);

  useEffect(() => {
    const sync = () => setOrgBlocked(isOrgBlockedInSession());
    window.addEventListener('org-blocked-changed', sync);
    return () => window.removeEventListener('org-blocked-changed', sync);
  }, []);

  const navItems = useMemo(() => {
    const role = me?.role;
    const items = [...baseNavItems];
    if (role === 'org_admin') {
      items.splice(1, 0, {
        path: '/dashboard/branches',
        label: {
          uz: 'Filiallar',
          en: 'Branches',
          ru: 'Филиалы',
        },
        icon: GitBranch,
      });
      const wi = items.findIndex((i) => i.path === '/dashboard/workers');
      items.splice(wi + 1, 0, {
        path: '/dashboard/permissions',
        label: {
          uz: 'Ruxsatlar',
          en: 'Permissions',
          ru: 'Права доступа',
        },
        icon: Shield,
      });
    }
    if (role === 'staff') {
      items.push({
        path: '/dashboard/my-permissions',
        label: {
          uz: 'Mening ruxsatlarim',
          en: 'My permissions',
          ru: 'Мои права',
        },
        icon: Shield,
      });
    }
    if (role === 'org_admin' || role === 'staff') {
      items.push({
        path: '/dashboard/legal',
        label: {
          uz: 'Rasmiy ma’lumot',
          en: 'Legal',
          ru: 'Официальная информация',
        },
        icon: FileText,
      });
    }
    return items.filter((item) => canAccessRoute(item.path, me));
  }, [me]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const getCurrentPageTitle = () => {
    const currentItem = navItems.find(
      (item) =>
        item.path === location.pathname ||
        location.pathname.startsWith(item.path + '/'),
    );
    return (
      currentItem?.label || { uz: 'Bosh sahifa', en: 'Home', ru: 'Главная' }
    );
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  if (orgBlocked) {
    return <OrganizationBlockedScreen />;
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2dd4bf',
          colorLink: '#2dd4bf',
        },
      }}
    >
      <div className="min-h-screen">
        <div className="min-h-screen bg-slate-50 dark:bg-[#000000] transition-colors duration-300">
          <div className="flex min-h-screen w-screen">
            {/* Sidebar */}
            <aside
              style={{ width: isCollapsed ? 100 : 340 }}
              className="row-span-2 w-full bg-slate-50 dark:bg-zinc-950 backdrop-blur-sm border-r border-teal-500/40 transition-all duration-300"
            >
              <div className="flex flex-col h-full w-full">
                {/* Logo */}
                <div className="h-20 w-full flex items-center justify-center px-6 border-b border-teal-500/40">
                  <AnimatePresence mode="popLayout">
                    <div className="w-full flex items-center justify-start">
                      <motion.div
                        key="expanded-logo"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={toggleSidebar}
                        layout
                      >
                        <motion.div
                          layoutId="c"
                          className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center"
                        >
                          <motion.span className="text-white dark:text-slate-900 font-bold text-lg">
                            C
                          </motion.span>
                        </motion.div>
                        {!isCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.6 }}
                            className="flex flex-col overflow-auto"
                          >
                            <h1 className="min-w-[200px] font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                              CRM Pro
                              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                                Beta
                              </span>
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Executive
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
                  </AnimatePresence>
                </div>

                {/* Navigation */}
                <Sidebar navItems={navItems} isCollapsed={isCollapsed} />

                {/* Logout */}
                <div className="p-4 min-h-[50px]">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#000000]/50">
                    <button
                      onClick={() => {
                        clearSessionAuth();
                        navigate('/login');
                      }}
                      style={{
                        justifyContent: isCollapsed ? 'center' : 'flex-start'
                      }}
                      className="flex items-center gap-2 text-sm font-semibold transition-colors duration-200 w-full"
                    >
                      <LogOut size={20} className="dark:text-slate-300" />
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="font-medium whitespace-nowrap overflow-hidden z-10 dark:text-slate-300 text-slate-600"
                        >
                          logout
                        </motion.span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            <div className="w-full">
              {/* Header */}
              <header
                className="bg-slate-50 dark:bg-zinc-950 backdrop-blur-sm border-b border-teal-500/40"
                style={{
                  transition: 'margin-left 0.3s ease-in-out'
                }}
              >
                <div className="flex items-center justify-between px-8 py-[11.5px]">
                  {/* Left Section */}
                  <div className="flex items-center gap-6">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {t(getCurrentPageTitle())}
                      </h1>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {getCurrentDate()}
                      </p>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative">
                      <Input
                        placeholder={t({
                          uz: 'Qidiruv',
                          en: 'Search',
                          ru: 'Поиск'
                        })}
                        size="large"
                        prefix={<Search />}
                      />
                    </div>
                    {/* Theme Toggle */}
                    <ThemeToggle />
                    {/* Lang Changer */}
                    <Select
                      defaultValue={lang}
                      style={{ width: 140 }}
                      size="large"
                      onChange={(value) => setLang(value)}
                      options={[
                        {
                          value: 'en',
                          label: 'English'
                        },
                        {
                          value: 'ru',
                          label: 'Русский'
                        },
                        {
                          value: 'uz',
                          label: "O'zbekcha"
                        }
                      ]}
                    />
                    {/* User Avatar */}
                    <div className="flex items-center gap-3 px-3 py-1 rounded-lg bg-slate-50 dark:bg-[#000000]">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {me?.fullName || me?.email || 'User'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {me?.role ?? '—'}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center">
                        <span className="text-white dark:text-slate-900 font-semibold text-sm">
                          {(me?.email ?? 'U')
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </header>
              {/* Main Content */}
              <main className="overflow-y-auto bg-slate-50/10 dark:bg-[#0f0f0f]">
                <div className="p-2 grid grid-cols-1 grid-row-1">
                  <div className="col-span-1 row-span-1 rounded-lg w-full h-[calc(100vh-100px)]">
                    <AnimatePresence mode="sync">
                      <Outlet />
                    </AnimatePresence>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Layout;
