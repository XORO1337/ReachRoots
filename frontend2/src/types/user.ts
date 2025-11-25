export interface User {
  id: string;
  name: string;
  email: string;
  role: 'artisan' | 'customer' | 'distributor' | 'admin';
  photoURL?: string;
  phone?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}
