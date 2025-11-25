import { useState, useEffect } from 'react';

export const useLanguageSelection = () => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  useEffect(() => {
    // Check if user has already selected a language
    const hasSelectedLanguage = localStorage.getItem('language-selected');
    
    if (!hasSelectedLanguage) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setShowLanguageModal(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const closeLanguageModal = () => {
    setShowLanguageModal(false);
  };

  return {
    showLanguageModal,
    closeLanguageModal
  };
};
