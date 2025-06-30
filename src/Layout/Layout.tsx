import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Users,
  // Settings,
  Search,
  // BarChart3,
  // Calendar,
  LogOut,
  // Building2,
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
  // {
  //   path: '/dashboard/analytics',
  //   label: { uz: 'Tahlillar', en: 'Analytics', ru: 'Аналитика' },
  //   icon: BarChart3
  // },
  // {
  //   path: '/dashboard/companies',
  //   label: { uz: 'Kompaniyalar', en: 'Companies', ru: 'Компании' },
  //   icon: Building2
  // },
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

  // {
  //   path: '/dashboard/calendar',
  //   label: { uz: 'Kalendar', en: 'Calendar', ru: 'Календарь' },
  //   icon: Calendar
  // },
  // {
  //   path: '/dashboard/settings',
  //   label: { uz: 'Sozlamalar', en: 'Settings', ru: 'Настройки' },
  //   icon: Settings
  // }
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
      <div className={`min-h-screen`}>
        <div className="min-h-screen bg-slate-50 dark:bg-[#000000] transition-colors duration-300">
          <motion.div
            className="flex min-h-screen w-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Sidebar */}
            <motion.aside
              className="row-span-2 w-full bg-slate-50 dark:bg-[#101010] backdrop-blur-sm border-r border-[#6bd2bc]"
              animate={{ width: isCollapsed ? 100 : 340 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
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
                            <h1 className=" min-w-[200px] font-bold text-lg text-slate-900 dark:text-white">
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
                <nav className="flex-1 px-4 py-6">
                  <div className="space-y-2">
                    <AnimatePresence presenceAffectsLayout mode="popLayout">
                      {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                          <motion.div
                            key={item.path}
                            initial={{ opacity: 0, x: 0 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 + 0.1 }}
                            className="min-h-[50px] "
                          >
                            <NavLink to={item.path}>
                              <motion.div
                                className={`relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                                  isActive
                                    ? ' text-white dark:text-slate-300'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                                }`}
                                whileHover={{ x: isActive ? 0 : 4 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                {isActive ? (
                                  <motion.div
                                    layoutId="activeNavBackground"
                                    className="absolute inset-0 bg-gradient-to-br min-h-[50px]  from-[#6fe0c8] to-[#419380da] rounded-lg  z-[5]"
                                    transition={{
                                      type: 'spring',
                                      duration: 0.8
                                    }}
                                  />
                                ) : null}
                                <Icon
                                  size={20}
                                  className="flex-shrink-0 ml-1 z-10"
                                />

                                <AnimatePresence>
                                  {!isCollapsed && (
                                    <motion.span
                                      initial={{ opacity: 0, width: 0 }}
                                      animate={{ opacity: 1, width: 'auto' }}
                                      exit={{ opacity: 0, width: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="font-medium whitespace-nowrap overflow-hidden z-10"
                                    >
                                      {t(item.label)}
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            </NavLink>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </nav>

                {/* Logout */}
                <motion.div
                  className="p-4 min-h-[50px]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
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
                </motion.div>
              </div>
            </motion.aside>

            <div className="w-full">
              {/* Header */}
              <motion.header
                className="bg-slate-50 dark:bg-[#101010] backdrop-blur-sm border-b border-[#6bd2bc] "
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
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
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Input
                        placeholder={t({
                          uz: 'Qidiruv',
                          en: 'Search',
                          ru: 'Поиск'
                        })}
                        size="large"
                        prefix={<Search />}
                      />
                    </motion.div>
                    {/* 
                    Notifications
                    <motion.button
                      className="relative p-2 rounded-lg bg-slate-50 dark:bg-[#000000] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Bell size={20} />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                    </motion.button> */}

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
                    <motion.div
                      className="flex items-center gap-3 px-3 py-1 rounded-lg bg-slate-50 dark:bg-[#000000]"
                      whileHover={{ scale: 1.02 }}
                    >
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
                    </motion.div>
                  </div>
                </div>
              </motion.header>
              {/* Main Content */}
              <motion.main
                className="overflow-y-auto bg-slate-50/10 dark:bg-[#0f0f0f]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="p-2 grid grid-cols-1 grid-row-1">
                  <div className="col-span-1 row-span-1 rounded-lg  w-full h-[calc(100vh-100px)]">
                    <Outlet />
                  </div>
                </div>
              </motion.main>{' '}
            </div>
          </motion.div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Layout;
