import i18n from '../i18n';

// Helper function to format weight units
export const formatWeightUnit = (unit: string = 'g'): string => {
  const unitMap: { [key: string]: string } = {
    'g': i18n.t('units.gram', 'g'),
    'kg': i18n.t('units.kg', 'kg'),
    'piece': i18n.t('units.piece', 'pc'),
    'liter': i18n.t('units.liter', 'L'),
    'ml': 'ml',
    'dozen': 'dz'
  };
  return unitMap[unit] || unit;
};

// Helper function to get full weight unit name
export const getWeightUnitName = (unit: string = 'g'): string => {
  const nameMap: { [key: string]: string } = {
    'g': i18n.t('units.gram', 'Gram (g)'),
    'kg': i18n.t('units.kg', 'Kilogram (kg)'),
    'piece': i18n.t('units.piece', 'Piece'),
    'liter': i18n.t('units.liter', 'Liter (L)'),
    'ml': 'Milliliter (ml)',
    'dozen': 'Dozen'
  };
  return nameMap[unit] || unit;
};
