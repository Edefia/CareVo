# CareBis Prime Health — Frontend Client Application

> Modern, responsive React 19 single-page application (SPA) providing clinical, administrative, laboratory, and patient portals for **CareBis Prime Health (CareVo)**.

For the comprehensive, complete specification covering the entire platform architecture, clinical taxonomy, RBAC permissions, database schema, API routes, security compliance, and lifecycle phases, refer to the master documentation:
👉 **[Master Project Documentation (README.md)](../README.md)**

---

## Quick Start (Frontend)

### Prerequisites
- Node.js `>=20.19.0`
- npm `v10+`

### Setup & Development
```bash
# 1. Install dependencies
npm install

# 2. Configure local environment variables (.env.local)
cp .env.example .env.local # or edit .env.local

# 3. Start development server with Hot Module Replacement (HMR)
npm run dev
```

The application will be available at `http://localhost:5173`.

### Production Build
```bash
npm run build
npm run preview
```

---

## Frontend Architecture Overview

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/) with `@vitejs/plugin-react`
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom CSS design tokens (`src/index.css`)
- **Server State & Data Sync**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Client State**: [Zustand](https://github.com/pmndrs/zustand) (`authStore`, `resultsStore`)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **UI Primitives**: [Radix UI](https://www.radix-ui.com/) (Dialog, Dropdown Menu, Select, Popover)
- **Charts & Visualizations**: [Recharts v3](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Toast Notifications**: [React Hot Toast](https://react-hot-toast.com/)

---

## Layout Structure

1. **`MarketingLayout` (`src/layouts/MarketingLayout.tsx`)**: Public-facing pages (`/`, `/about`, `/services`, `/test-panels`, `/faq`, `/blog`, `/contact`).
2. **`AuthLayout` (`src/layouts/AuthLayout.tsx`)**: Split-screen authentication views (`/login`, `/register`, `/mfa-challenge`, `/forgot-password`, `/reset-password`).
3. **`DashboardLayout` (`src/layouts/DashboardLayout.tsx`)**: Unified dashboard framework with role-aware collapsible sidebar, smart breadcrumbs, and real-time Socket.io notifications.
4. **`LabLayout` (`src/layouts/LabLayout.tsx`)**: High-density LIMS workstation with vertical icon rail and specialized lab top bar for accessioning and biomarker data entry.
