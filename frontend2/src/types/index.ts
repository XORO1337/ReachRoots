export * from './user';

export interface Product {
  id: string;
  name: string;
  price: number;
  weightUnit?: string;
  originalPrice?: number;
  image: string;
  category: string;
  seller: Seller;
  description: string;
  materials: string[];
  craftType: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  minOrder: number;
}

export interface Seller {
  id: string;
  name: string;
  city: string;
  state: string;
  avatar: string;
  story: string;
  specialties: string[];
  rating: number;
  totalProducts: number;
  yearsOfExperience: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  icon: string;
  productCount: number;
}

export interface FilterState {
  category: string;
  location: string;
  priceRange: [number, number];
  craftType: string;
  search: string;
}