import { useState, useEffect } from 'react';
import ProductService, { CategoryData } from '../services/productService';

interface UseCategoriesResult {
  categories: CategoryData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCategories = (): UseCategoriesResult => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoriesData = await ProductService.getCategoriesWithDetails();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};
