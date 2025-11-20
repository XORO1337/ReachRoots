# ReachRoots

ReachRoots is a full-stack marketplace tailored for Indian artisans, distributors, and conscious buyers. It combines a secure Node.js API, a modular React + Vite frontend, and operational tooling for onboarding, compliance, and analytics. The platform enables artisans to showcase handcrafted products, distributors to manage procurement pipelines, and customers to discover verified craft clusters under one roof.

## Contents
- [Why ReachRoots](#why-reachroots)
- [What Is Implemented](#what-is-implemented)
- [Work in Progress](#work-in-progress)
- [Architecture at a Glance](#architecture-at-a-glance)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [NPM Scripts](#npm-scripts)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Support](#support)

## Why ReachRoots
- **Inclusive commerce:** Role-aware experiences for artisans, distributors, admins, and customers with guardrails such as verification, OTP, and RBAC.
- **Supply-chain visibility:** Dashboards surface earnings, orders, inventory value, and pipeline insights for both artisans and distributors.
- **Localization-first:** Currency, content, and i18n resources default to Indian markets with support for multiple locales (en/hi/ta) out of the box.
- **Operations friendly:** Built-in audit logging, backups, and rate limiting ensure smoother scale-up without compromising compliance.

## What Is Implemented

### Platform highlights
- **Identity & trust:** Aadhaar/PAN uploads, manual review workflows, OTP verification (Twilio), and JWT-based session security.
- **Marketplace experience:** Searchable artisan/distributor profiles, wishlist-enabled catalog, detailed product modals, and checkout/cart flows.
- **Dashboards:** Role-specific React dashboards covering analytics, orders, inventory, communications, and performance metrics with INR currency formatting.
- **Ops tooling:** Automated Mongo backups, request logging, configurable CORS, and multi-environment configs for seamless deployments.

### Backend API (Backend/)
- **Authentication & Authorization:** Multi-provider login (phone/password, Google OAuth), refresh tokens, RBAC middleware, rate limiting, lockouts, and password policies (`controllers/Auth_controller.js`, `middleware/rbac.js`).
- **Identity verification:** Secure document uploads, admin review APIs, and verification gating before artisans/distributors can list items (`controllers/IdentityVerification_controller.js`).
- **Marketplace domain:** Comprehensive controllers for users, artisans, distributors, products, raw materials, orders, inventory, and wishlists backed by Mongoose schemas.
- **Comms & notifications:** Email (Nodemailer) + OTP (Twilio) services, image management via ImageKit, and cron-driven backup routines.
- **Deployment ready:** `pkg` bundling targets, environment-driven security toggles, and health checks for ops automation.

### Frontend (frontend2/)
- **React + Vite app shell:** Feature-based architecture with shared layout, routing, and context layers.
- **Marketplace UI:** Hero merchandising, product cards with pricing tiers, multi-language hero copy, cart + checkout modals, wishlist management, and distributor search flows.
- **Artisan dashboard:** Overview, My Items, Orders, Deliveries, Analytics, Settings, and supporting modals (add/edit/view item) tuned for INR pricing and growth insights.
- **Distributor dashboard:** Sales KPIs, order management, inventory tracking, communications hub, performance analytics by region and product.
- **Admin views:** Activity logs and top-level metrics for compliance and operational monitoring.
- **i18n & accessibility:** Locale resources under `public/locales`, responsive Tailwind theming, and reusable data visualizations.

## Work in Progress
| Track | Focus | Status |
| --- | --- | --- |
| Authentication | Email verification + MFA expansion | In design (auth roadmap) |
| Analytics | Advanced cross-role dashboards and forecasting | Prototyping (see `dashboard/` components) |
| Verification | Automated document checks and risk scoring | Researching service providers |
| Platform | Mobile-friendly API optimizations & microservice boundaries | Planning |
| Search | Elastic-powered advanced search & filtering | Backlog |
| Notifications | Real-time event streaming + in-app alerts | Backlog |

> Have an idea or need? Open an issue and tag the appropriate track above.

## Architecture at a Glance
- **Client:** React 18 + TypeScript + Tailwind, routed via React Router DOM, bundled by Vite, localized with i18next.
- **API:** Express 5 running on Node 18+, talking to MongoDB via Mongoose, guarded with Passport, JWT, and middleware (rate limiting, validation, CORS, logging).
- **Services:** Twilio (OTP), Google OAuth, ImageKit (media), Nodemailer (email), Razorpay primitives (payment readiness).
- **Tooling:** Jest + Supertest for API tests, ESLint + TypeScript + PostCSS/Tailwind for frontend quality, `pkg` for binary packaging, `build.sh` helper scripts.

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router DOM, i18next, Lucide icons.
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT/Passport, Twilio, Nodemailer, ImageKit, Razorpay SDK.
- **DevOps:** Nodemon, pkg, cron backups, ESLint, Jest/Supertest, Docker-friendly scripts.

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB 4.4+
- Optional: Twilio + Google OAuth credentials, ImageKit account, SMTP provider

### Clone the repo
```bash
git clone https://github.com/XORO1337/ReachRoots.git
cd ReachRoots
```

### Backend setup
```bash
cd Backend
npm install
cp env.template .env  # create and edit environment values
npm run dev           # starts http://localhost:3000 by default
```

Minimal `.env` excerpt:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/reachroots
JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me_too
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Frontend setup
```bash
cd frontend2
npm install
npm run dev     # launches Vite dev server on http://localhost:5173
```

Use two terminals (or the provided VS Code tasks) to run API + frontend simultaneously. The frontend is configured to call the backend via environment-driven API helpers; update proxy/base URLs in `frontend2/src/config` if needed.

## NPM Scripts

| Location | Script | Description |
| --- | --- | --- |
| `Backend/` | `npm run dev` | Start Express API with Nodemon |
|  | `npm start` | Production start (Node) |
|  | `npm run build` | Package backend (pkg) for multiple targets |
|  | `npm test` | Run Jest test suite |
|  | `npm run security:test` | Execute RBAC/security-focused Jest cases |
| `frontend2/` | `npm run dev` | Vite dev server |
|  | `npm run build` | Production build |
|  | `npm run lint` | ESLint + TypeScript checks |
|  | `npm run preview` | Preview built assets |

## Testing
- **Backend:** `cd Backend && npm test` to execute Jest + Supertest suites (`test-auth-system.js`, `test-rbac-security.js`). Add new specs near the feature modules you extend.
- **Frontend:** `cd frontend2 && npm run lint` for static analysis. Component tests can be added with your preferred runner (e.g., Vitest + Testing Library) under `frontend2/src/__tests__`.
- **Manual verification:** Use `GET /api/health` to confirm API status, then exercise dashboard flows via the Vite dev server.

## Project Structure
```
.
├── Backend/          # Express API, models, controllers, services
├── frontend2/        # React + Vite client
├── build.sh          # Helper build script
├── OAUTH_FIX_GUIDE.md
├── BINARY_README.md  # Notes for packaged binaries
└── README.md         # You are here
```

Refer to `frontend2/README.md` and `Backend/README.md` for deep-dive module-level details.

## Contributing
1. Fork the repository and create a feature branch (`git checkout -b feature/my-update`).
2. Make your changes with clear commits referencing the problem they solve.
3. Run linting/tests (`npm run lint`, `npm test`) where applicable.
4. Submit a pull request describing the change, validation steps, and screenshots of UI updates when relevant.

Please follow security best practices when handling auth, payment, or personal data modules. For larger proposals (new verification flows, analytics modules, etc.) open an issue first to align on scope.

## Support
- **Issues & Discussions:** Use GitHub Issues to report bugs or request enhancements.
- **Security:** For sensitive disclosures, avoid public issues—reach out privately to the maintainers listed in commit history.
- **Deployment questions:** See `OAUTH_FIX_GUIDE.md` and `BINARY_README.md` for advanced packaging and OAuth troubleshooting tips.

Built with ❤️ to amplify artisan voices.