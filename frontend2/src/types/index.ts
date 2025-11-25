export * from './user';
export * from './payment';

export interface ProductReview {
  _id?: string;
  userName?: string;
  userId?: string;
  user?: {
    _id: string;
    name?: string;
    profileImage?: {
      url?: string;
      thumbnailUrl?: string;
    };
  };
  rating: number;
  comment?: string;
  createdAt?: string;
  lastEditedAt?: string;
  verifiedPurchase?: boolean;
}

export interface Product {
  id: string;
  backendId?: string;
  name: string;
  price: number;
  weightUnit?: string;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  seller: Seller;
  description: string;
  materials: string[];
  craftType: string;
  rating: number;
  reviews: number;
  averageRating?: number;
  reviewCount?: number;
  reviewsList?: ProductReview[];
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