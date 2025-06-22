
import { useApp } from '../Providers/Configuration';

export const useTranslation = () => {
  const { lang } = useApp();

  const t = (dict: Partial<Record<'uz' | 'ru' | 'en', string>>) => {
    return dict[lang] ?? dict['uz'] ?? '[No translation]';
  };

  return { t, lang };
};
