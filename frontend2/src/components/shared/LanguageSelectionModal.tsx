import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' }
];

interface LanguageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };

  const handleContinue = () => {
    i18n.changeLanguage(selectedLanguage);
    localStorage.setItem('language-selected', 'true');
    localStorage.setItem('selected-language', selectedLanguage);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Globe className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('languageModal.title')}
          </h2>
          <p className="text-gray-600 text-sm">
            {t('languageModal.subtitle')}
          </p>
        </div>

        {/* Language Options */}
        <div className="space-y-3 mb-6">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedLanguage === language.code
                  ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{language.flag}</span>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">
                      {language.nativeName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {language.name}
                    </div>
                  </div>
                </div>
                {selectedLanguage === language.code && (
                  <Check className="h-5 w-5 text-orange-600" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="space-y-3">
          <button
            onClick={handleContinue}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-orange-700 transition-colors duration-200"
          >
            {t('languageModal.continue')}
          </button>
          <p className="text-center text-xs text-gray-500">
            {t('languageModal.description')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectionModal;
