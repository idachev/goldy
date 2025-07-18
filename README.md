# Goldy

Physical precious metals investment tracker that scrapes real-time prices from multiple dealers and provides price comparison analytics.

## Overview

Goldy is a monorepo application built with Nx that helps precious metals investors track prices, compare deals across dealers, and monitor their investment portfolios. The system automatically scrapes price data from dealer websites and provides comprehensive analytics.

### Key Features

- **Multi-Dealer Price Tracking**: Automated scraping of gold/silver prices from various dealers
- **Price Comparison**: Compare premiums and find the best deals across dealers
- **Asset Management**: Track different precious metal products (coins, bars, rounds)
- **Historical Analysis**: Price trend analysis and historical data tracking
- **REST API**: Complete API for integration with external systems

### Architecture

- **Backend**: NestJS with clean architecture (domain/application/infrastructure/presentation layers)
- **Frontend**: Next.js 14 with React 19, Tailwind CSS, Recharts for visualization
- **Database**: SQLite with TypeORM
- **Scraping**: Puppeteer + Cheerio for automated price collection
- **Shared Libraries**: TypeScript libraries for types and utilities

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Development Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Build shared libraries:**

```bash
npx nx build types
npx nx build utils
```

3. **Start development servers:**

**Backend only:**

```bash
npx nx serve backend
```

**Frontend only:**

```bash
npx nx dev frontend
```

**Both simultaneously:**

```bash
# Option 1: Run in parallel
npx nx run-many --target=serve --projects=backend,frontend --parallel

# Option 2: Use separate terminals
# Terminal 1: npx nx serve backend
# Terminal 2: npx nx dev frontend
```

### Development Workflow

For active development with auto-rebuild of shared libraries:

```bash
# Terminal 1: Watch shared libraries
npx nx build types --watch & npx nx build utils --watch

# Terminal 2: Start backend
npx nx serve backend

# Terminal 3: Start frontend
npx nx dev frontend
```

### Available Commands

**Code Quality:**

```bash
npm run lint              # Run ESLint with SonarJS rules
npm run lint:fix          # Auto-fix linting issues
npm run format            # Format code with Prettier
npm run format:check      # Check formatting without changes
```

**Testing:**

```bash
npx nx test backend-e2e   # Backend integration tests
npx nx e2e frontend-e2e   # Frontend E2E tests (Playwright)
```

**Building:**

```bash
npx nx build backend      # Build backend for production
npx nx build frontend     # Build frontend for production
npx nx typecheck          # Run TypeScript checking
```

### API Endpoints

The backend provides REST API endpoints:

- **Assets**: `/api/assets/*` - CRUD operations for precious metal products
- **Dealers**: `/api/dealers/*` - Dealer management and configuration
- **Asset Listings**: `/api/asset-listings/*` - Product listings per dealer
- **Prices**: `/api/prices/*` - Price history and latest pricing data
- **Scraping**: `/api/scraping/*` - Manual scraping triggers and status

### Project Structure

```
apps/
├── backend/              # NestJS API with clean architecture
├── frontend/             # Next.js React application
├── backend-e2e/          # Backend integration tests
└── frontend-e2e/         # Frontend E2E tests

libs/shared/
├── types/                # DTOs, enums shared across apps
└── utils/                # Utilities (price calculators, converters)
```

## Nx Workspace

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

This project is built with [Nx](https://nx.dev), a powerful build system for monorepos.

### Nx Commands

**Explore the workspace:**

```bash
npx nx graph                    # Visualize project dependencies
npx nx show project backend     # Show backend project details
npx nx show project frontend    # Show frontend project details
npx nx list                     # List all available plugins and commands
```

**Run multiple projects:**

```bash
npx nx run-many --target=build --all                    # Build all projects
npx nx run-many --target=test --projects=backend,types  # Test specific projects
npx nx run-many --target=lint --parallel               # Lint all projects in parallel
```

**Workspace management:**

```bash
npx nx sync                     # Sync TypeScript project references
npx nx sync:check              # Verify TypeScript references (for CI)
```

### Development Tools

**Nx Console (Recommended):**

- VS Code extension for running Nx commands via GUI
- Provides project visualization and code generation
- [Install Nx Console](https://nx.dev/getting-started/editor-setup)

**TypeScript Integration:**
Nx automatically manages TypeScript project references. The sync happens during build/typecheck, but you can manually sync:

```bash
npx nx sync
```

### Nx Resources

**Learn more:**

- [Nx workspace setup documentation](https://nx.dev/nx-api/js)
- [Running tasks with Nx](https://nx.dev/features/run-tasks)
- [Nx plugins ecosystem](https://nx.dev/concepts/nx-plugins)

**Community:**

- [Discord](https://go.nx.dev/community)
- [Twitter/X](https://twitter.com/nxdevtools)
- [YouTube Channel](https://www.youtube.com/@nxdevtools)
