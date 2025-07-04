import { motion } from 'motion/react';

import { useTranslation } from '@/hooks/useTranslation';

import ParticlesBackground from '@/components/ParticlesBackground';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-gray-800 dark:bg-[#1f2937] dark:text-white transition-colors duration-300 px-4 text-center"
    >
      <ParticlesBackground />
      <motion.h1
        className="text-6xl font-bold mb-2 text-[#5cccb1]"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        404
      </motion.h1>

      <motion.h2
        className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-5"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {t({
          uz: 'Sahifa topilmadi',
          ru: 'Страница не найдена',
          en: 'Page not found'
        })}
      </motion.h2>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 rounded-md text-sm font-medium bg-[#6bd2bc] text-white hover:bg-[#5cccb1] transition "
        >
          {t({
            uz: 'Bosh sahifaga qaytish',
            ru: 'Вернуться на главную',
            en: 'Go back home'
          })}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default NotFoundPage;
