import { motion } from 'motion/react';
import { Form, Input, Button, ConfigProvider, theme, message } from 'antd';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/Providers/Configuration';
import { api } from '@/lib/api';
import { setOrgBlockedMeta, setSessionAuth } from '@/lib/sessionUser';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = async (values: any) => {
    try {
      const { data } = await api.post<{
        access_token: string;
        user: {
          id: string;
          email: string;
          role: 'superadmin' | 'org_admin' | 'staff';
          organizationId: string | null;
          branchId: string | null;
          fullName: string | null;
          effectivePermissions?: string[];
        };
        organizationBlocked?: boolean;
        branchBlocked?: boolean;
        supportPhone?: string;
      }>('/auth/login', {
        email: values.email,
        password: values.password,
      });
      setSessionAuth(data.access_token, {
        ...data.user,
        effectivePermissions: data.user.effectivePermissions ?? [],
      });
      setOrgBlockedMeta(
        !!(data.organizationBlocked || data.branchBlocked),
        data.supportPhone,
      );
      navigate(
        data.user.role === 'superadmin'
          ? '/admin/organizations'
          : '/dashboard/home',
      );
    } catch {
      message.error({
        key: 'login-fail',
        content: t({
          en: 'Invalid email or password',
          uz: 'Email yoki parol noto‘g‘ri',
          ru: 'Неверный email или пароль',
        }),
      });
    }
  };

  const { theme: darkOrLight } = useApp();

  return (
    <ConfigProvider
      theme={{
        algorithm:
          darkOrLight === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#2dd4bf',
          colorLink: '#2dd4bf',
          colorBorder: '#2dd4bf',
        }
      }}
    >
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* BG Layer with animated gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#6bd2bc] to-[#5cccb1] dark:from-[#0a0d10] dark:to-[#111827] transition-colors duration-1000"
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.1, opacity: 0 }}
        />

        {/* Login Box */}
        <motion.div
          className="w-full max-w-sm relative z-10 bg-white/80 dark:bg-[#0d1016]/90 backdrop-blur-md rounded-2xl shadow-xl p-8"
          initial={{ scale: 0.95, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        >
          <motion.h1
            className="text-3xl font-semibold mb-6 text-[#5cccb1] dark:text-[#6bd2bc] text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {t({
              en: 'Welcome back',
              uz: 'Xush kelibsiz',
              ru: 'Добро пожаловать'
            })}
          </motion.h1>
          <p className="mb-6 text-center text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {t({
              en: 'Superadmin, organization admin, and branch admin all sign in here. Branch admin accounts are created when adding a branch (optional fields) or under Workers.',
              uz: 'Superadmin, tashkilot admini va filial admini shu yerda kiradi. Filial admini akkaunti filial yaratishda (Filial admini maydonlari) yoki «Ishchilar» bo‘limida qo‘shiladi.',
              ru: 'Суперадмин, админ организации и админ филиала входят здесь. Аккаунт админа филиала создаётся при создании филиала или в разделе «Сотрудники».',
            })}
          </p>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label={t({ en: 'Email', uz: 'Email', ru: 'Эл. почта' })}
              name="email"
              rules={[
                {
                  required: true,
                  message: t({
                    en: 'Please enter your email',
                    uz: 'Email kiriting',
                    ru: 'Введите эл. почту'
                  })
                },
                {
                  type: 'email',
                  message: t({
                    en: 'Invalid email',
                    uz: 'Noto‘g‘ri email',
                    ru: 'Неверная эл. почта'
                  })
                }
              ]}
            >
              <Input placeholder="example@mail.com" />
            </Form.Item>

            <Form.Item
              label={t({ en: 'Password', uz: 'Parol', ru: 'Пароль' })}
              name="password"
              rules={[
                {
                  required: true,
                  message: t({
                    en: 'Please enter your password',
                    uz: 'Parol kiriting',
                    ru: 'Введите пароль'
                  })
                }
              ]}
            >
              <Input.Password placeholder="********" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="font-medium"
              >
                {t({ en: 'Login', uz: 'Kirish', ru: 'Войти' })}
              </Button>
            </Form.Item>
          </Form>
        </motion.div>
      </motion.div>
    </ConfigProvider>
  );
};

export default LoginPage;
