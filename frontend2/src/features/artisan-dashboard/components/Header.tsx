import React from 'react';
<<<<<<< HEAD
=======
import { useTranslation } from 'react-i18next';
>>>>>>> fixed-repo/main
import { X } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
<<<<<<< HEAD
=======
  const { t } = useTranslation();
>>>>>>> fixed-repo/main
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
<<<<<<< HEAD
            <span>Artisan Hub</span>
=======
            <span>{t('artisanDashboard.artisanHub')}</span>
>>>>>>> fixed-repo/main
            <span>›</span>
            <span>{title}</span>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default Header;
