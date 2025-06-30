import { motion } from 'motion/react';
import { Form, Input, Button, ConfigProvider, theme } from 'antd';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/Providers/Configuration';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = (values: any) => {
    console.log('Login values:', values);
    localStorage.setItem('isLoggedIn', 'true');
    navigate('/dashboard');
    window.location.reload();
  };

  const { theme: darkOrLight } = useApp();

  return (
    <ConfigProvider
      theme={{
        algorithm:
          darkOrLight === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#6bd2bc',
          colorLink: '#6bd2bc',
          colorBorder: '#6bd2bc'
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
