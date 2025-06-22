import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Users,
  Settings,
  Bell,
  Search,
  BarChart3,
  Calendar,
  LogOut,
  Building2,
  Layers3,
  LayoutGrid,
  UserPlus,
  ClipboardList
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTranslation } from '@/hooks/useTranslation';

const navItems = [
  { path: '/dashboard/home', label: 'overview', icon: Home },
  { path: '/dashboard/analytics', label: 'analytics', icon: BarChart3 },
  { path: '/dashboard/companies', label: 'companies', icon: Building2 },
  { path: '/dashboard/users', label: 'users', icon: Users },
  { path: '/dashboard/blocks', label: 'blocks', icon: Layers3 },
  { path: '/dashboard/floors', label: 'floors', icon: LayoutGrid },
  { path: '/dashboard/appartments', label: 'appartments', icon: Home },
  { path: '/dashboard/clients', label: 'clients', icon: UserPlus },
  { path: '/dashboard/contracts', label: 'contracts', icon: ClipboardList },
  { path: '/dashboard/calendar', label: 'calendar', icon: Calendar },
  { path: '/dashboard/settings', label: 'settings', icon: Settings }
];
const navDictionary = {
  overview: {
    uz: "Umumiy ko'rinish",
    en: 'Overview',
    ru: 'Обзор'
  },
  analytics: {
    uz: 'Tahlillar',
    en: 'Analytics',
    ru: 'Аналитика'
  },
  companies: {
    uz: 'Kompaniyalar',
    en: 'Companies',
    ru: 'Компании'
  },
  users: {
    uz: 'Foydalanuvchilar',
    en: 'Users',
    ru: 'Пользователи'
  },
  blocks: {
    uz: 'Bloklar',
    en: 'Blocks',
    ru: 'Блоки'
  },
  floors: {
    uz: 'Qavatlar',
    en: 'Floors',
    ru: 'Этажи'
  },
  appartments: {
    uz: 'Kvartiralar',
    en: 'Appartments',
    ru: 'Квартиры'
  },
  clients: {
    uz: 'Mijozlar',
    en: 'Clients',
    ru: 'Клиенты'
  },
  contracts: {
    uz: 'Shartnomalar',
    en: 'Contracts',
    ru: 'Контракты'
  },
  calendar: {
    uz: 'Kalendar',
    en: 'Calendar',
    ru: 'Календарь'
  },
  settings: {
    uz: 'Sozlamalar',
    en: 'Settings',
    ru: 'Настройки'
  }
};

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const getCurrentPageTitle = () => {
    const currentItem = navItems.find(
      (item) => item.path === location.pathname
    );
    return currentItem?.label || 'Overview';
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
    <div className={`min-h-screen`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <motion.div
          className="flex min-h-screen w-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Sidebar */}
          <motion.aside
            className="row-span-2 w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-r border-[#6bd2bc]"
            animate={{ width: isCollapsed ? 100 : 340 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="flex flex-col h-full w-full">
              {/* Logo */}
              <div className="h-20 w-full flex items-center justify-center px-6 border-b border-[#6bd2bc]">
                <AnimatePresence mode="popLayout">
                  {!isCollapsed ? (
                    <div className="w-full flex items-center justify-start">
                      <motion.div
                        key="expanded-logo"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={toggleSidebar}
                      >
                        <motion.div
                          layoutId="c"
                          className="w-10 h-10 bg-[#6bd2bc] rounded-lg flex items-center justify-center"
                        >
                          <motion.span className="text-white dark:text-slate-900 font-bold text-lg">
                            C
                          </motion.span>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.6 }}
                        >
                          <h1 className="font-bold text-lg text-slate-900 dark:text-white">
                            CRM Pro
                          </h1>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Executive
                          </p>
                        </motion.div>
                      </motion.div>
                    </div>
                  ) : (
                    <motion.div
                      key="collapsed-logo"
                      transition={{ duration: 0.2 }}
                      className="w-10 h-10 cursor-pointer bg-[#6bd2bc] rounded-lg flex items-center justify-center"
                      layoutId="c"
                      onClick={toggleSidebar}
                    >
                      <motion.span className="text-white dark:text-slate-900 font-bold text-lg">
                        C
                      </motion.span>
                    </motion.div>
                  )}
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
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 + 0.1 }}
                        >
                          <NavLink to={item.path}>
                            <motion.div
                              className={`relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                                isActive
                                  ? ' text-white dark:text-slate-300'
                                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                              }`}
                              whileHover={{ x: isActive ? 0 : 4 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {isActive ? (
                                <motion.div
                                  layoutId="activeNavBackground"
                                  className="absolute inset-0 bg-gradient-to-br  from-[#59b3a0c1] to-[#5fd5b9da] rounded-lg  z-[5]"
                                  transition={{ type: 'spring', duration: 0.8 }}
                                />
                              ) : null}
                              <Icon
                                size={20}
                                className="flex-shrink-0 ml-2 z-10"
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
                                    {t(
                                      navDictionary[
                                        item.label as keyof typeof navDictionary
                                      ]
                                    )}
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
                className="p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-700/50">
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
                    <LogOut size={20} />
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium whitespace-nowrap overflow-hidden z-10"
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
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-[#6bd2bc]"
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
                      {getCurrentPageTitle()}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {getCurrentDate()}
                    </p>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                  {/* Search */}
                  <motion.div className="relative" whileHover={{ scale: 1.02 }}>
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-64 px-4 py-2 pl-10 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors duration-200"
                    />
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    />
                  </motion.div>

                  {/* Notifications */}
                  <motion.button
                    className="relative p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  </motion.button>

                  {/* Theme Toggle */}
                  <ThemeToggle />

                  {/* User Avatar */}
                  <motion.div
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700"
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
              className="overflow-y-auto bg-slate-100/10 dark:bg-slate-900"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{
                transition: 'margin-left 0.3s ease-in-out'
              }}
            >
              <div className="p-2 grid grid-cols-1 grid-row-1">
                <div className="col-span-1 row-span-1 border w-full h-[calc(100vh-100px)]">
                  <Outlet />
                </div>
              </div>
            </motion.main>{' '}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Layout;
