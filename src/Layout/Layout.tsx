import { useState } from 'react';
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
  TrendingUp
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTranslation } from '@/hooks/useTranslation';
import { ConfigProvider, Input, Select } from 'antd';
import { Sidebar } from './SideBar';

const navItems = [
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
  const { t, lang, setLang } = useTranslation();
  const location = useLocation();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const getCurrentPageTitle = () => {
    const currentItem = navItems.find(
      (item) => item.path === location.pathname
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
  const navigate = useNavigate();

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6bd2bc'
        }
      }}
    >
      <div className="min-h-screen">
        <div className="min-h-screen bg-slate-50 dark:bg-[#000000] transition-colors duration-300">
          <div className="flex min-h-screen w-screen">
            {/* Sidebar */}
            <aside
              style={{ width: isCollapsed ? 100 : 340 }}
              className="row-span-2 w-full bg-slate-50 dark:bg-[#101010] backdrop-blur-sm border-r border-[#6bd2bc]"
            >
              <div className="flex flex-col h-full w-full">
                {/* Logo */}
                <div className="h-20 w-full flex items-center justify-center px-6 border-b border-[#6bd2bc]">
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
                          className="w-10 h-10 bg-[#6bd2bc] rounded-lg flex items-center justify-center"
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
                            <h1 className="min-w-[200px] font-bold text-lg text-slate-900 dark:text-white">
                              CRM Pro
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
                        localStorage.removeItem('token');
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
                className="bg-slate-50 dark:bg-[#101010] backdrop-blur-sm border-b border-[#6bd2bc]"
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
                          Biznes Egasi
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Executive
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center">
                        <span className="text-white dark:text-slate-900 font-semibold text-sm">
                          BE
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
