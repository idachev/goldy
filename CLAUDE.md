# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

- `npx nx serve backend` - Start backend development server (NestJS with hot reload)
- `npx nx dev frontend` - Start frontend development server (Next.js)
- `npx nx build backend` - Build backend for production
- `npx nx build frontend` - Build frontend for production
- `npx nx typecheck` - Run TypeScript type checking across workspace

### Code Quality

- `npm run lint` - Run ESLint to check code quality and style
- `npm run lint:fix` - Run ESLint with auto-fix for fixable issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without making changes

### Testing

- `npx nx test backend-e2e` - Run backend end-to-end tests (Jest)
- `npx nx e2e frontend-e2e` - Run frontend end-to-end tests (Playwright)

### Workspace Management

- `npx nx graph` - Visualize project dependencies
- `npx nx sync` - Sync TypeScript project references
- `npx nx sync:check` - Verify TypeScript references are correct (for CI)
- `npx nx release` - Version and release libraries (use `--dry-run` to preview)

### Library Development

- `npx nx build types` - Build shared types library
- `npx nx build utils` - Build shared utils library

### Scraping Operations (Planned)

- Manual scraping trigger via API: `POST /api/scraping/trigger`
- Check scraping status via API: `GET /api/scraping/status`

## Architecture

### Application Domain

Goldy is a physical precious metals investment tracker that scrapes real-time prices from multiple dealers and provides price comparison analytics. Core entities include Assets (gold/silver items), Dealers (vendors), AssetListings (dealer-specific product pages), and PriceRecords (scraped price data). The system tracks premiums over spot prices, supports weight conversions, and provides automated price monitoring.

### Technology Stack

- **Monorepo**: Nx with TypeScript
- **Backend**: NestJS with clean architecture (domain/application/infrastructure/presentation layers)
- **Frontend**: Next.js 14 with React 19, Tailwind CSS, Recharts for visualization
- **Database**: SQLite with TypeORM
- **Scraping**: Puppeteer + Cheerio for price data collection
- **Scheduling**: @nestjs/schedule for automated scraping tasks (no Redis/Bull for simplicity)

### Project Structure

```
apps/
├── backend/              # NestJS API with clean architecture
│   ├── domain/          # Business entities, enums, repository interfaces
│   ├── application/     # Use cases and application services
│   ├── infrastructure/  # Database, scrapers, scheduling
│   └── presentation/    # REST controllers
├── frontend/            # Next.js React application
├── backend-e2e/         # Backend integration tests
└── frontend-e2e/        # Frontend E2E tests (Playwright)

libs/shared/
├── types/               # DTOs, enums shared across apps
└── utils/               # Weight converters, price calculators
```

### Shared Libraries

- `@goldy/shared/types` - Data transfer objects, enums (AssetType, MetalType)
- `@goldy/shared/utils` - Price calculators, weight conversion utilities

### Backend Architecture

Follows clean architecture with domain-driven design:

- **Domain**: Core business entities (Asset, Dealer, AssetListing, PriceRecord)
- **Application**: Use cases and business logic services
- **Infrastructure**: TypeORM repositories, web scrapers, scheduling
- **Presentation**: REST API controllers

### Key Design Patterns

- Repository pattern for data access
- Strategy pattern for dealer-specific scraping implementations
- Clean architecture separation of concerns
- Asset-Dealer many-to-many relationship through AssetListings

### Database Schema

- **Assets**: Physical precious metal items with weight, purity, manufacturer (AssetType/MetalType enums)
- **Dealers**: Vendor configuration with scraping parameters and website URLs
- **AssetListings**: Links assets to specific dealer product pages (many-to-many relationship)
- **PriceRecords**: Time-series price data with sell/buy prices, premiums over spot, delivery times, stock status

### Key Business Logic

- Assets can be sold by multiple dealers through AssetListings
- Price scraping follows strategy pattern for dealer-specific implementations
- Premium calculations over spot prices for investment analysis
- Weight conversion utilities support grams, troy ounces, etc.
- Scheduled tasks automate price updates without manual intervention

### API Endpoints (Planned)

**Assets**: CRUD operations (`/api/assets/*`)
**Asset Listings**: Management of dealer-asset relationships (`/api/asset-listings/*`)
**Prices**: History, latest prices, price comparison (`/api/prices/*`)
**Dealers**: Configuration management (`/api/dealers/*`)
**Scraping**: Manual triggers and status monitoring (`/api/scraping/*`)

### Development Notes

- TypeScript paths configured for `@goldy/shared/*` imports
- Webpack used for backend builds with development/production configurations
- Clean architecture with domain/application/infrastructure/presentation separation
- Repository pattern for data access abstraction
- Current phase: Core backend development with domain entities and TypeORM setup

# Development Guidelines

## Validation and Error Handling

### Use Case Validation Pattern

When implementing validation in use cases, follow these patterns:

1. **Import Validation Functions**: Use destructured imports for cleaner code:

```typescript
import { ErrorUtils } from '@goldy/shared/types';
import { IDUtils } from '@goldy/shared/utils';

const { isValidArgument } = ErrorUtils;
const { isValidId } = IDUtils;
```

2. **Validation Style**: Use one-line validation calls that throw BusinessRuleError on failure:

```typescript
// For ID validation
isValidArgument(isValidId(id), 'Invalid dealer ID format');

// For required fields
isValidArgument(!!dealerData.name?.trim(), 'Dealer name is required');
isValidArgument(!!dealerData.websiteUrl?.trim(), 'Website URL is required');
```

3. **Method Formatting**: Add blank lines for better readability:

```typescript
async getDealerById(id: string): Promise<DealerDto | null> {
  isValidArgument(isValidId(id), 'Invalid dealer ID format');

  const dealer = await this.dealerRepository.findById(id);

  return dealer ? this.mapToDto(dealer) : null;
}
```

### Available Validation Methods

1. **isValidArgument** - For general validation (throws BAD_REQUEST_GENERAL):

   ```typescript
   isValidArgument(!!value, 'Value is required');
   isValidArgument(value > 0, 'Value must be positive');
   isValidArgument(isValidId(id), 'Invalid ID format');
   ```

2. **isFoundResource** - For resource existence checks (throws NOT_FOUND_GENERAL):

   ```typescript
   const asset = await assetRepository.findById(id);
   isFoundResource(!!asset, 'Asset not found with ID: %s', id);
   ```

3. **isAllowed** - For permission checks (throws FORBIDDEN_GENERAL)
4. **isConflict** - For conflict validation (throws CONFLICT_GENERAL)

### Key Points:

- Use `isValidArgument` with condition checks for automatic BusinessRuleError throwing
- Use `isFoundResource` when checking if a resource exists after database queries
- Prefer `isValidId` from IDUtils for ID validation
- Add blank lines after validation, after main logic, and before return statements
- Keep validation concise and readable with destructured imports
- Always run `npm run lint` after making changes to ensure code quality

## Test Source Organization

In NX monorepos with NestJS applications, the community has converged on several established patterns for organizing Jest test files. Here are the most widely adopted approaches:

### Primary Approach: Co-located Tests

The dominant pattern places test files adjacent to their source files with `.spec.ts` or `.test.ts` extensions:

```
apps/my-nestjs-app/
├── src/
│   ├── app/
│   │   ├── app.controller.ts
│   │   ├── app.controller.spec.ts
│   │   ├── app.service.ts
│   │   └── app.service.spec.ts
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.controller.spec.ts
│   │   ├── users.service.ts
│   │   ├── users.service.spec.ts
│   │   └── users.module.ts
│   └── main.ts
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
└── jest.config.js
```

### Library Organization

For shared libraries in the monorepo:

```
libs/shared-domain/
├── src/
│   ├── lib/
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   └── user.entity.spec.ts
│   │   ├── services/
│   │   │   ├── user.service.ts
│   │   │   └── user.service.spec.ts
│   │   └── index.ts
│   └── index.ts
└── jest.config.js
```

### Configuration Structure

The typical Jest configuration hierarchy:

```
workspace/
├── jest.config.js (root configuration)
├── jest.preset.js (NX preset)
├── apps/
│   └── my-app/
│       └── jest.config.js (app-specific config)
└── libs/
    └── my-lib/
        └── jest.config.js (library-specific config)
```

### Test Categories

The community typically separates test types:

- **Unit tests**: `.spec.ts` files co-located with source
- **Integration tests**: `test/` directory at app level
- **E2E tests**: `test/` directory with `.e2e-spec.ts` naming

### Key Benefits of This Approach

This structure aligns with clean architecture principles by maintaining clear boundaries between test types while keeping unit tests close to their implementation. It supports the single responsibility principle and makes refactoring more manageable.

The co-location pattern is particularly effective in NX monorepos because it leverages NX's affected computation capabilities, running only tests for changed code paths.

This approach has become the de facto standard in the NestJS community and is well-supported by NX tooling and IDE integrations.

## Project Specific Instructions

Important !!! DO NOT add additional code explanation summary unless requested by the user.
After working on files, just stop or state "ALL TASKS DONE" if all tasks are completed.
