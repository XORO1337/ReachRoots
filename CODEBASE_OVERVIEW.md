# ReachRoots Codebase Deep-Dive

This document explains every folder and file in the ReachRoots monorepo, why it exists, how it works, and which packages power it. Use it as a map when onboarding, planning a change, or reviewing architecture decisions.

---

## 1. Platform At A Glance
- **Mission:** Connect Indian artisans, distributors, and conscious buyers through a trust-first marketplace.
- **Shape:** Node/Express + MongoDB API (`Backend/`) and a React 18 + Vite client (`frontend2/`).
- **Security:** JWT, Passport (Google OAuth), OTP, RBAC, rate limiting, Helmet, Aadhaar verification.
- **Operations:** Automated Mongo backups, binary packaging via `pkg`, centralized logging, DevOps guides.

### Core Technology Stack

| Layer | Key Packages | Purpose |
| --- | --- | --- |
| Backend Runtime | `express`, `mongoose`, `helmet`, `cors`, `dotenv` | HTTP server, database access, security headers, env loading |
| Auth & Security | `passport`, `passport-google-oauth20`, `passport-jwt`, `jsonwebtoken`, `bcryptjs`, `express-rate-limit`, `multer` | OAuth, JWT issuance, password hashes, rate limiting, uploads |
| Communication | `nodemailer`, `twilio`, `imagekit`, `axios` | Email, OTP SMS, media delivery, external HTTP |
| Ops & Tooling | `node-cron`, `pkg`, `jest`, `supertest` | Backups, binary builds, testing |
| Frontend Runtime | `react`, `react-dom`, `react-router-dom`, `axios` | SPA shell, routing, API calls |
| Frontend Tooling | `vite`, `typescript`, `tailwindcss`, `i18next`, `lucide-react`, `react-hot-toast` | Build pipeline, styling, localization, icons, notifications |

---

## 2. Repository Root Map

| Path | What it does | How it works | Key packages/files |
| --- | --- | --- | --- |
| `Backend/` | Express API serving auth, marketplace, dashboards | Bootstrapped via `app.js`, loads controllers/routes/middleware, connects to Mongo | See Section 3 |
| `frontend2/` | React + Vite client | Feature-based folders, Vite build, Tailwind styling | See Section 4 |
| `README.md` | Repo-level onboarding | Summarizes feature set, scripts, structure, testing | Markdown |
| `Backend/README.md` | Backend-specific manual | Deep dive into auth, endpoints, schemas | Markdown |
| `frontend2/README.md` | Frontend tour | Explains page structure, artisan dashboard flows | Markdown |
| `build.sh` | One-button build pipeline | Builds React app, runs `npm run build` (pkg) to emit binaries, seeds `.env.example` | Bash, depends on `npm`, `pkg` |
| `BINARY_README.md` | Binary usage doc | Teaches how to run packaged backend+frontend binaries | Markdown |
| `OAUTH_FIX_GUIDE.md` | Google OAuth troubleshooting | Lists env fixes, Render deployment tips | Markdown |
| `dist/` (generated) | Binary outputs | `pkg` artifacts, `.env.example` | Built via script |

---

## 3. Backend (`Backend/`)

### 3.1 Entry Points & Config

| File | Purpose | How it works | Packages |
| --- | --- | --- | --- |
| `app.js` | Main Express server | Loads env, Helmet+CORS, sessions, Passport, rate limiting, RBAC scanner, routers, SPA fallback, error handling, health checks, starts Mongo + backup service | `express`, `helmet`, `cookie-parser`, `cors`, `express-session`, `passport`, `mongoose`, `node-cron` |
| `package.json` | Scripts & dependencies | `npm run dev`, `npm run build` (pkg for Win/Linux/macOS), Jest suites | `pkg`, `nodemon`, `jest`, `supertest` |
| `config/environment.js` | Smart env resolver | Autodetects client/backend URLs (Render, Codespaces), provides JWT secrets fallback | `dotenv`, `fs`, `path` |
| `config/passport.js` | Google OAuth + JWT strategy | Configures GoogleStrategy callback + JWT extraction for Passport | `passport`, `passport-google-oauth20`, `passport-jwt` |
| `config/security.js` | Security toggles | Central place for CSP, cookie, or rate limit flags | Local helpers |

### 3.2 Database Layer (`db/`, `models/`)

| File | Purpose | Implementation | Packages |
| --- | --- | --- | --- |
| `db/connect.js` | Dual-connection manager | Attempts local Mongo first, falls back to Atlas, keeps secondary connection, exposes health + graceful shutdown | `mongoose`, `dotenv` |
| `models/User.js` | Users + auth state | Mongoose schema with addresses, OTP tracking, Aadhaar data, password hashing hooks | `mongoose`, `bcryptjs` |
| `models/Artisan.js` | Artisan profile | Stores skills, regions, bank details, metrics | `mongoose` |
| `models/Distributor.js` | Distributor profile | License info, procurement areas | `mongoose` |
| `models/Product.js` | Products | Pricing, inventory status, artisan ref | `mongoose`, `mongoose-paginate-v2` |
| `models/Inventory.js` | Inventory aggregates | Tracks stock snapshots per artisan | `mongoose` |
| `models/Materials.js` | Raw material catalog | Category + stock data | `mongoose` |
| `models/RawMaterial.js` | Procurement orders | Distributor ↔ artisan raw material flow | `mongoose` |
| `models/Orders.js` | Marketplace orders | Buyer/ artisan refs, items, status transitions | `mongoose` |
| `models/Wishlist.js` | Wishlisted products | Many-to-many between users and products | `mongoose` |

### 3.3 Controllers (`controllers/`)
Responsible for HTTP orchestration; each file imports its Mongoose model, optional services, and uses `http-status-codes` plus validation helpers.

| Controller | Responsibilities | How it works | Packages |
| --- | --- | --- | --- |
| `Auth_controller.js` | Registration/login flows (password, Google OAuth, OTP), refresh tokens, profile | Issues JWT via `middleware/auth`, stores refresh tokens, triggers OTP/email services, handles role switching + redirects | `jsonwebtoken`, `passport`, `otpService`, `express-validator` |
| `User_controller.js` | CRUD for users + addresses | Uses `User` model, ensures address validation, enforces RBAC | `mongoose`, `http-status-codes` |
| `Address_controller.js` | Address book endpoints | Normalizes addresses, ensures pin validation via schema | `express-validator` |
| `IdentityVerification_controller.js` | Document/Aadhaar verification | Calls `aadhaarVerificationService`, handles uploads, admin review | `multer`, `axios`, `crypto` |
| `Artisan_controller.js` | Artisan profile search & detail | Supports pagination, skill filtering | `mongoose-paginate-v2` |
| `ArtisanDashboard_controller.js` | Analytics for artisans | Aggregates orders/inventory to charts | `mongoose` aggregation |
| `Distributor_controller.js` | Distributor onboarding search | Similar to artisan but tailored to procurement data | `mongoose` |
| `DistributorDashboard_controller.js` | Distributor KPIs | Combines inventory + order stats | `mongoose` |
| `Product_controller.js` | Product CRUD, category queries | Handles `multer` image uploads, attaches ImageKit links | `multer`, `imagekit`, `mongoose-paginate-v2` |
| `Inventory_controller.js` | Stock adjustments | Validates artisan ownership before edits | `mongoose` |
| `Material_controller.js` | Raw material catalog mgmt | Category filters, stock alerts | `mongoose` |
| `RawMaterial_controller.js` | Raw material orders | Connects distributors ordering from artisans | `mongoose`, `http-status-codes` |
| `Order_controller.js` | Marketplace orders workflow | Status updates, payment hooks placeholder | `mongoose` |
| `Wishlist_controller.js` | Wishlist actions | Idempotent toggles, fetch lists with product refs | `mongoose`, `http-status-codes` |
| `BackupController.js` | Trigger/report Mongo backups | Wraps `mongoBackupService` for manual triggers/status endpoints | `node-cron`, `child_process` |

### 3.4 Routes (`routes/`)
Each route file wires Express routers to relevant controllers + middleware. All routes are mounted under `/api/*` in `app.js`.

| Route File | Base Path | Notes |
| --- | --- | --- |
| `Auth_route.js` | `/api/auth` | Login/register, OTP, Google OAuth redirects, debug endpoints (see OAuth guide) |
| `User_route.js` | `/api/users` | User CRUD, profile updates, address management |
| `Address_route.js` *(merged into User)* | Exposed via user controller |
| `Artisan_route.js` | `/api/artisans` | Public artisan listing, search filters |
| `ArtisanDashboard_route.js` | `/api/artisan-dashboard` | Protected dashboard metrics |
| `Distributor_route.js` | `/api/distributors` | Public distributor data |
| `DistributorDashboard_route.js` | `/api/distributor-dashboard` | KPI widgets for distributors |
| `Products_route.js` | `/api/products` | Search, categories, artisan-specific fetch |
| `Inventory_route.js` | `/api/inventory` | Inventory CRUD |
| `Material_route.js` | `/api/materials` | Materials catalog |
| `RawMaterial_route.js` | `/api/raw-material-orders` | Procurement orders |
| `Order_route.js` | `/api/orders` | Marketplace order ops |
| `Wishlist_route.js` | `/api/wishlist` | Wishlist APIs |
| `Backup_route.js` | `/api/backups` | Manual backup triggers/status |
| `Admin_route.js` | `/api/admin` | RBAC-protected admin utilities |
| `DevLogs_route.js` | `/api/dev` | Developer logs, diagnostics |

### 3.5 Middleware (`middleware/`)

| File | Purpose | Packages |
| --- | --- | --- |
| `auth.js` | JWT issue/verify, role guards, identity/address checks, exports RBAC helpers | `jsonwebtoken`, `mongoose` |
| `rbac.js` | Fine-grained permission checks, malicious pattern detector, audit logger | Local heuristics, request logging |
| `rateLimiting.js` | General/auth/OTP/password reset limiters | `express-rate-limit` |
| `cors.js` / `corsHeaders.js` | Extra CORS headers when needed | `cors` |
| `validation.js` | Express-validator presets for common inputs | `express-validator` |
| `imageUpload.js` | `multer` config + file filters | `multer`, `path` |
| `phoneValidation.js` | Ensures valid Indian phone numbers | `libphonenumber-js` (via regex) |
| `requestLogger.js` | Streams structured request logs to disk for audits | `fs`, `path` |

### 3.6 Services (`services/`)

| Service | Responsibilities | Packages |
| --- | --- | --- |
| `otpService.js` | Generates, emails, tracks OTPs with resend limits + lockouts | `crypto`, `nodemailer` (through `emailService`), `mongoose` |
| `emailService.js` | Nodemailer transporter + templated messages | `nodemailer` |
| `otpService.js.backup` | Fallback implementation | Same as above |
| `aadhaarVerificationService.js` | Aadhaar OTP flow & checksum validation | `axios`, `crypto` |
| `imageKitService.js` | Wraps ImageKit client for signed uploads | `imagekit` |
| `mongoBackupService.js` | Schedules/executes Mongo dumps + optional restore | `node-cron`, `child_process`, `fs`, `path` |
| `Artisan_serv.js`, `Distributor_serv.js`, `Inventory_serv.js`, `Material_serv.js`, `Order_serv.js`, `Product_serv.js`, `RawMaterial_serv.js`, `User_serv.js`, `Wishlist_serv.js` | Thin data-access helpers shared across controllers | `mongoose` models |

### 3.7 Other Backend Assets

| Path | Role |
| --- | --- |
| `backups/` | Default folder for Mongo dump archives (created by service) |
| `logs/` | Contains `dev-requests.log`, `otp-service-error.log`, plus `archive/` for rotated logs |
| `tests/` (root) | `test-auth-system.js`, `test-rbac-security.js` (Jest + Supertest) |
| `security-demo.js` | Script to showcase RBAC and rate limits |

---

## 4. Frontend (`frontend2/`)

### 4.1 Tooling & Config Files

| File | Purpose | Packages |
| --- | --- | --- |
| `package.json` | Scripts (`dev`, `build`, `lint`, `preview`), dependencies | `vite`, `@vitejs/plugin-react`, `tailwindcss`, `eslint` |
| `vite.config.ts` | Vite config with React plugin, aliasing | `vite`, `@vitejs/plugin-react` |
| `tsconfig*.json` | Compiler options for app/node bundles | TypeScript |
| `tailwind.config.js`, `postcss.config.js` | Tailwind+PostCSS pipeline | `tailwindcss`, `autoprefixer` |
| `eslint.config.js` | Flat ESLint config (React, hooks, TypeScript) | `eslint`, `@eslint/js`, `typescript-eslint` |
| `build.sh` (root) | Calls `npm run build` here before packaging | Bash |

### 4.2 Public Assets

| Path | Description |
| --- | --- |
| `public/locales/en|hi|ta/*.json` | i18next namespaces for hero copy, dashboards, marketplace strings |
| `public/` root | Static assets served directly, also host translation files used by `i18next-http-backend` |

### 4.3 Source Root (`src/`)

| File | Purpose | Packages |
| --- | --- | --- |
| `main.tsx` | React entrypoint, mounts `App` inside providers | `react`, `react-dom`, `react-router-dom` |
| `App.tsx` | Top-level layout, renders router, contexts | `react-router-dom`, context providers |
| `index.css` | Tailwind directives + base styles | `tailwindcss` |
| `vite-env.d.ts` | Vite type helpers |

### 4.4 Configuration & Initialization

| File | Purpose | Packages |
| --- | --- | --- |
| `config/api.ts` | Determines backend base URL (env, localhost, Codespaces, Render), enumerates endpoints, builds OAuth URLs with hash-routing awareness | Browser APIs |
| `config/i18n.ts` | (Placeholder) reserved for custom i18n overrides |
| `i18n/index.ts` | Initializes i18next with HTTP backend + language detector, sets caching + fallback | `i18next`, `react-i18next`, `i18next-browser-languagedetector`, `i18next-http-backend` |

### 4.5 Context Providers (`contexts/`)

| File | Role | Packages |
| --- | --- | --- |
| `AuthContext.tsx` | Manages login state, tokens, axios interceptors, profile refresh | `axios`, `react` |
| `AdminAuthContext.tsx` | Admin-only auth state guard | `react` |
| `CartContext.tsx` | In-memory cart, totals, checkout helpers | `react` |
| `WishlistContext.tsx` | Tracks wishlist items synced to backend | `react`, `axios` |
| `LanguageContext.tsx` | Wraps i18n preference logic | `react`, `i18next` |
| `index.ts` | Barrel exports |

### 4.6 Routing (`routes/AppRouter.tsx`)
Configures React Router v7 with nested layouts:
- Marketplace routes (`/`, `/wishlist`, `/search`, `/top-artisans`, `/profile`).
- Auth routes (`/login`, `/signup`, `/auth/callback`).
- Protected artisan/distributor/admin dashboards via `ProtectedRoute` and context gates.

### 4.7 Components (`components/`)
Organized by scope. Every component uses Tailwind classes, Lucide icons, and context hooks.

#### `components/layout/`
| File | Purpose | Packages |
| --- | --- | --- |
| `Header.tsx` | Global top nav with links, CTA buttons, language switcher | `react-router-dom`, `lucide-react` |
| `Footer.tsx` | Footer with CTA + links | `react` |
| `index.ts` | Barrel |

#### `components/marketplace/`
| File | Description |
| --- | --- |
| `ProductCard.tsx` | Displays product info, wishlist/cart buttons |
| `ProductGrid.tsx` | Responsive grid of cards |
| `ProductModal.tsx` | Detailed view with artisan info |
| `Cart.tsx` | Slide-out cart using `CartContext` |
| `Categories.tsx` | Pill navigation built from API categories |
| `CheckoutModal.tsx` | Checkout form, uses `react-hot-toast` for feedback |
| `OrderConfirmationModal.tsx` | Success state |
| `index.ts` | Barrel |

#### `components/shared/`
| File | Description |
| --- | --- |
| `Hero.tsx` | Landing hero with translation strings and `useHeroShowcase` hook |
| `LanguageSwitcher.tsx` & `LanguageSelectionModal.tsx` | Localized language picker |
| `SellerModal.tsx` | CTA for artisans/distributors |
| `DevNotificationModal.tsx` | Broadcasts dev-mode notifications |

#### `components/auth/`
| File | Description |
| --- | --- |
| `ProtectedRoute.tsx` | Wraps routes, checks `AuthContext` |
| `OTPVerification.tsx` | Email OTP UI hooking into `/api/auth/verify-otp` |
| `AuthDebugPanel.tsx` | Shows auth state for QA |

#### `components/artisan/`
| File | Description |
| --- | --- |
| `Sidebar.tsx`, `Header.tsx`, `ProfileSection.tsx` | Shared layout for artisan dashboard, uses Lucide icons, displays verification status |

#### `components/admin/`, `components/distributor/`, `components/ui/`
Re-export layout shells (`AdminLayout`, `AdminProtectedRoute`, distributor-specific shells) for dashboards and future shared UI primitives.

### 4.8 Feature Modules (`features/`)
Provide isolated dashboard implementations with their own components + pages.

#### `features/artisan-dashboard/`
| File | Description |
| --- | --- |
| `ArtisanDashboard.tsx` | Feature entry that mounts sidebar/header and nested routes |
| `pages/*.tsx` | `DashboardOverview`, `MyItems`, `Orders`, `Deliveries`, `Analytics`, `Settings` with mocked data + API hooks |
| `components/AddItemModal`, `EditItemModal`, `ViewItemModal`, `ImageUpload` | CRUD flows leveraging `react-hook-form`-style state |

#### `features/distributor-dashboard/`
Similar structure with pages: `DashboardOverview`, `OrderManagement`, `InventoryTracking`, `ProductManagement`, `Communications`, `PerformanceAnalytics`, supported by `components/Header` and `Sidebar`.

### 4.9 Standalone Dashboards (`src/dashboard/`)
Legacy/pre-migrated artisan dashboard components used by `pages/artisan` and `pages/dashboard`. Mirrors feature module while providing quick entry points.

### 4.10 Hooks (`hooks/`)

| Hook | Description | Dependencies |
| --- | --- | --- |
| `useArtisanDashboard`, `useArtisanItems`, `useArtisanOrders`, `useArtisanDeliveries` | Provide memoized mock/real data for dashboard widgets | `react`, local data modules |
| `useCategories` | Fetches categories via `ProductService` | `useEffect`, `ProductService` |
| `useHeroShowcase` | Prefetches hero carousel products | `ProductService` |
| `useLanguageSelection`, `useTranslation` | Wraps i18next to expose helper API | `i18next` |

### 4.11 Pages (`pages/`)

| Folder/File | Description | Packages |
| --- | --- | --- |
| `Marketplace.tsx` | Landing marketplace experience composed of hero, categories, featured products, cart/wishlist modals | `react`, `react-router-dom`, contexts |
| `WishlistPage.tsx` | Wishlist grid with API integration | `axios` |
| `SearchResults.tsx` | Search results hooking into backend search endpoints | `axios`, query params |
| `TopArtisans.tsx` | Highlights curated artisans with stats cards | Hooks + contexts |
| `NotFound.tsx` | 404 page |
| `admin/*.tsx` | Admin dashboard pages: `AdminDashboard`, `ActivityLogs`, `UserManagement`, `Analytics`, `Notifications`, `Settings`, `AdminSignIn` | Admin contexts |
| `artisan/*.tsx` | Legacy artisan dashboard pages mirroring feature module |
| `auth/Login.tsx`, `Signup.tsx`, `OAuthCallback.tsx` | Auth flows, integrates `buildGoogleOAuthUrl`, handles OTP fallback | `axios`, `react-hook-form`, `react-hot-toast` |
| `dashboard/DistributorDashboard.tsx` | Legacy distributor shell |
| `profile/Profile.tsx` | User profile editing |
| `pages/index.ts` | Barrel exports |

### 4.12 Services (`services/`)

| File | Purpose | Packages |
| --- | --- | --- |
| `productService.ts` | Fetch categories, featured products, hero showcase, counts | `fetch`, `API_CONFIG` |
| `artisanService.ts` | Fetch artisan profiles, top artisans, skill filter search | `axios`/`fetch` |
| `distributorService.ts` | Distributor data utilities |
| `orderService.ts` | Order placement, status fetch | `axios` |
| `imageUploadService.ts` | Bridges to backend/ImageKit signatures |
| `profile.ts` | Profile API helpers |
| `searchService.ts` | Aggregated search for marketplace |

### 4.13 Data, Types, Utils

| Path | Description |
| --- | --- |
| `data/mockData.ts`, `dashboardData.ts` | Seed data for dashboards when API is unavailable |
| `types/*.ts` | Shared TS types for dashboard widgets, users, products |
| `utils/api.ts` | Axios/fetch helpers, error normalizers |
| `utils/formatters.ts` | Currency/date/percentage formatting helpers |

---

## 5. Documentation & Ops Guides

| File | Summary |
| --- | --- |
| `README.md` | Org-wide why/what/how, tech stack, scripts, testing, architecture |
| `Backend/README.md` | Detailed API doc: features, endpoints, schemas, security, roadmap |
| `frontend2/README.md` | Explains React structure, navigation, artisan dashboard |
| `BINARY_README.md` | Steps to build & run pkg binaries, env vars, troubleshooting |
| `OAUTH_FIX_GUIDE.md` | Render + Google OAuth debugging steps, env hints |
| `OAUTH_FIX_GUIDE` references `Auth_route` debug endpoints to validate redirect chain |

---

## 6. How Backend & Frontend Interact
1. **Config resolution:** `frontend2/src/config/api.ts` picks the correct backend base URL. Google OAuth URLs include role & hash routing flags.
2. **Auth flow:**
   - `Login.tsx` posts to `/api/auth/login` (Express + `Auth_controller`).
   - OTP required: `OTPVerification.tsx` talks to `/api/auth/verify-otp` using `otpService`.
   - Tokens stored by `AuthContext`, axios interceptors inject `Authorization` headers for future requests.
3. **Marketplace data:**
   - Components call `productService` / `artisanService`, which hit `/api/products` or `/api/artisans` handled by controllers + Mongoose models.
4. **Dashboards:**
   - `ProtectedRoute` checks `AuthContext` before rendering `features/*Dashboard`. Those components call order/inventory endpoints powering analytics.
5. **File uploads:**
   - Frontend uses `imageUploadService` to request signed URLs; backend `imageUpload.js` + ImageKit service handle storage.
6. **Backups:**
   - Admin triggers `/api/backups/manual` (via `Backup_controller`) → `mongoBackupService` runs `mongodump`, optionally restores to local.

---

## 7. Key NPM Scripts & What They Do

| Location | Script | Description |
| --- | --- | --- |
| Backend | `npm run dev` | Nodemon server with live reload |
| Backend | `npm start` | Production server |
| Backend | `npm run build` | Uses `pkg` to create Windows/Linux/macOS binaries that bundle backend + built frontend |
| Backend | `npm test`, `npm run test:auth`, `npm run security:test` | Jest suites (Supertest) |
| Frontend | `npm run dev` | Vite dev server with HMR |
| Frontend | `npm run build` | Production build (`frontend2/dist`) consumed by backend static server |
| Frontend | `npm run lint` | ESLint/TypeScript checks |
| Root | `./build.sh` | Automates frontend build + backend pkg build + `.env` template |

---

## 8. Maintenance Tips
- **When adding APIs:** create/update controller (`controllers/`), declare route (`routes/`), register in `app.js`, document in README.
- **When adding models:** define schema (`models/`), add indexes, reference via services/controllers.
- **When adding frontend features:** prefer feature folders under `src/features`, export shared components via barrels in `src/components`.
- **Environment parity:** Keep `CLIENT_URL`, `BACKEND_URL`, and Google OAuth redirect URIs aligned with deployment hostnames (see `OAUTH_FIX_GUIDE.md`).
- **Backups:** Set `BACKUP_ENABLED=true` and `BACKUP_INTERVAL_HOURS` env values to let `mongoBackupService` schedule dumps.

---

## 9. Glossary of External Services

| Service | Usage | Touchpoints |
| --- | --- | --- |
| Google OAuth 2.0 | Social login for all roles | `config/passport.js`, `Auth_controller.js`, `buildGoogleOAuthUrl` |
| Twilio Verify | OTP SMS (extendable) | `services/otpService.js`, `.env` creds |
| ImageKit | Media storage/CDN | `services/imageKitService.js`, frontend upload service |
| Aadhaar API | Identity verification | `services/aadhaarVerificationService.js`, `IdentityVerification_controller.js` |
| Razorpay (planned) | Payments | `package.json`, placeholder controller hooks |
| Nodemailer + SMTP | Email OTP + notifications | `emailService.js`, `otpService.js` |

---

**Need to dive deeper?**
- Backend logic: inspect `controllers/*.js` alongside their co-located `services`. They are named 1:1 with Mongo models.
- Frontend UI: start at `src/routes/AppRouter.tsx`, follow lazy-loaded pages into `components/` or `features/`.
- Deployment: run `./build.sh` for local binaries, or boot `Backend` + `frontend2` via `npm run dev` each.

Happy shipping! 🎯
