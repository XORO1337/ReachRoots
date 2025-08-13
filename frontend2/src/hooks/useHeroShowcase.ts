import { useState, useEffect } from 'react';
import ProductService, { Product } from '../services/productService';

interface HeroShowcaseData {
  textiles: Product[];
  pottery: Product[];
  wooden: Product[];
  jewelry: Product[];
}

interface UseHeroShowcaseResult {
  products: HeroShowcaseData;
  loading: boolean;
  error: string | null;
}

export const useHeroShowcase = (): UseHeroShowcaseResult => {
  const [products, setProducts] = useState<HeroShowcaseData>({
    textiles: [],
    pottery: [],
    wooden: [],
    jewelry: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShowcaseProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const showcaseData = await ProductService.getHeroShowcaseProducts();
        setProducts(showcaseData);
      } catch (err) {
        console.error('Failed to fetch hero showcase products:', err);
        setError('Failed to load showcase products');
      } finally {
        setLoading(false);
      }
    };

    fetchShowcaseProducts();
  }, []);

  return { products, loading, error };
};
