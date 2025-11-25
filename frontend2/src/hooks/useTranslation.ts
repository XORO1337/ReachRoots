import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = (namespace?: string) => {
  const { t, i18n } = useI18nTranslation(namespace);
  
  return {
    t,
    i18n,
    language: i18n.language,
    changeLanguage: (lng: string) => i18n.changeLanguage(lng),
    isRTL: i18n.dir() === 'rtl',
  };
};

export default useTranslation;
