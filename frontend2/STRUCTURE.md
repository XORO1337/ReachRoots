# Frontend2 Project Structure

This document outlines the organized and professional structure of the React frontend application.

## 📁 Project Architecture

```
frontend2/
├── public/                     # Static assets
│   └── locales/               # Internationalization files
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── admin/            # Admin-specific components
│   │   ├── artisan/          # Artisan-specific components  
│   │   ├── auth/             # Authentication components
│   │   ├── distributor/      # Distributor-specific components
│   │   ├── layout/           # Layout components (Header, Footer, Navigation)
│   │   ├── marketplace/      # E-commerce components (Products, Cart, Checkout)
│   │   ├── shared/           # Shared/common components
│   │   ├── ui/               # Basic UI elements (Button, Input, Modal, etc.)
│   │   └── index.ts          # Central component exports
│   ├── pages/                # Route components/pages
│   │   ├── admin/            # Admin pages
│   │   ├── artisan/          # Artisan pages
│   │   ├── auth/             # Authentication pages
│   │   ├── dashboard/        # Dashboard pages
│   │   ├── profile/          # Profile pages
│   │   └── index.ts          # Central page exports
│   ├── config/               # Configuration files
│   ├── contexts/             # React Context providers
│   ├── data/                 # Static data and constants
│   ├── features/             # Feature-based modules
│   ├── hooks/                # Custom React hooks
│   ├── i18n/                 # Internationalization configuration
│   ├── routes/               # Routing configuration
│   ├── services/             # API services and external integrations
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── package.json              # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

## 🔧 Import Strategy

With the new structure, components can be imported cleanly:

```typescript
// Before (scattered imports)
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

// After (organized imports)
import { Header, ProductCard, LoadingSpinner } from '@/components';
// or
import { Header } from '@/components/layout';
import { ProductCard } from '@/components/marketplace';
import { LoadingSpinner } from '@/components/ui';
```

## 📋 Component Categories

### Layout Components (`/components/layout/`)
- **Header.tsx** - Main navigation header
- **Footer.tsx** - Site footer
- **Navigation.tsx** - Navigation menu component

### Authentication Components (`/components/auth/`)
- **OTPVerification.tsx** - OTP input and verification
- **ProtectedRoute.tsx** - Route protection wrapper
- **PublicRoute.tsx** - Public route wrapper
- **AuthDebugPanel.tsx** - Development auth debugging
- **SessionManager.tsx** - Session management

### Marketplace Components (`/components/marketplace/`)
- **ProductCard.tsx** - Individual product display
- **ProductGrid.tsx** - Product grid layout
- **ProductModal.tsx** - Product detail modal
- **Categories.tsx** - Product categories
- **Cart.tsx** - Shopping cart
- **CheckoutModal.tsx** - Checkout process
- **OrderConfirmationModal.tsx** - Order confirmation

### Admin Components (`/components/admin/`)
- **AdminLayout.tsx** - Admin panel layout
- **AdminProtectedRoute.tsx** - Admin route protection

### Artisan Components (`/components/artisan/`)
- **Header.tsx** - Artisan dashboard header
- **ProfileSection.tsx** - Artisan profile section
- **Sidebar.tsx** - Artisan dashboard sidebar

### Shared Components (`/components/shared/`)
- **Hero.tsx** - Landing page hero section
- **LanguageSelectionModal.tsx** - Language selection
- **LanguageSwitcher.tsx** - Language switching
- **SellerModal.tsx** - Seller information modal

### UI Components (`/components/ui/`)
- **LoadingSpinner.tsx** - Loading indicator
- *Future: Button, Input, Modal, Card, etc.*

## 🚀 Benefits of This Structure

1. **Scalability** - Easy to add new components in appropriate categories
2. **Maintainability** - Clear separation of concerns
3. **Reusability** - Components are logically grouped for easy reuse
4. **Developer Experience** - Intuitive file organization and clean imports
5. **Team Collaboration** - Clear conventions for where to add new code
6. **Performance** - Tree-shaking friendly with barrel exports

## 📝 Development Guidelines

1. **Component Placement**: Place components in the most specific category first
2. **Shared Components**: If a component is used across multiple domains, move it to `/shared/`
3. **UI Components**: Basic, unstyled components go in `/ui/`
4. **Index Files**: Always update index.ts files when adding new components
5. **Naming**: Use PascalCase for component files and descriptive names

## 🔍 File Naming Conventions

- **Components**: PascalCase (e.g., `ProductCard.tsx`)
- **Pages**: PascalCase (e.g., `AdminDashboard.tsx`)
- **Utilities**: camelCase (e.g., `formatPrice.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
- **Types**: PascalCase (e.g., `UserTypes.ts`)

This structure provides a solid foundation for scaling the application while maintaining code quality and developer productivity.
