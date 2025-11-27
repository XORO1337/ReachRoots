import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-orange-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('notFound.pageNotFound')}</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          {t('notFound.description')}
        </p>
        <div className="space-x-4">
          <Link
            to="/"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            {t('notFound.goToMarketplace')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
