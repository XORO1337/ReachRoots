# RootsReach Frontend v2

## Project Structure

```
src/
├── components/           # Shared/common components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ...
├── features/            # Feature-based modules
│   ├── marketplace/     # Marketplace feature
│   │   └── components/
│   └── artisan-dashboard/  # Artisan Dashboard feature
│       ├── components/  # Dashboard-specific components
│       │   ├── Sidebar.tsx
│       │   └── Header.tsx
│       ├── pages/       # Dashboard pages
│       │   ├── DashboardOverview.tsx
│       │   ├── MyItems.tsx
│       │   ├── Orders.tsx
│       │   ├── Deliveries.tsx
│       │   ├── Analytics.tsx
│       │   └── Settings.tsx
│       ├── ArtisanDashboard.tsx
│       └── index.ts
├── pages/               # Main application pages
│   ├── Marketplace.tsx
│   └── NotFound.tsx
├── routes/              # Routing configuration
│   └── AppRouter.tsx
├── data/                # Mock data and API related files
├── types/               # TypeScript type definitions
└── App.tsx             # Main application component
```

## Features

### Marketplace (`/`)
- Product browsing and filtering
- Shopping cart functionality
- Product details and seller information
- Category navigation

### Artisan Dashboard (`/artisan`)
- **Dashboard Overview** (`/artisan`) - Statistics and summary
- **My Items** (`/artisan/items`) - Inventory management
- **Orders** (`/artisan/orders`) - Order tracking and management
- **Deliveries** (`/artisan/deliveries`) - Delivery tracking
- **Analytics** (`/artisan/analytics`) - Business insights and charts
- **Settings** (`/artisan/settings`) - Account and business settings

## Navigation

### From Marketplace to Dashboard
- Click the "🎨 Artisan Dashboard" button in the top-right corner

### From Dashboard to Marketplace
- Click the "Artisan Hub" logo in the sidebar
- Click "🛒 Back to Marketplace" link in the sidebar

## Technology Stack

- **React 18** with TypeScript
- **React Router DOM** for routing
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

## Getting Started

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:5173/`

## Development Notes

- All artisan dashboard components are self-contained within the `features/artisan-dashboard/` directory
- Routing is handled by React Router with nested routes for the dashboard
- The project follows a feature-based architecture for better organization
- Components are organized by their scope (shared vs feature-specific)
