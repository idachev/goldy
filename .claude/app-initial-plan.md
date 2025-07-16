# Goldy - Physical Asset Investment Tracker - Initial Plan

## Overview

Full-stack TypeScript monorepo application for tracking physical precious metal investments with real-time price scraping and comparison across multiple dealers.

## Technology Stack

- **Framework**: Nx monorepo with TypeScript
- **Backend**: NestJS with clean architecture
- **Frontend**: Next.js 14 with React 19
- **Database**: SQLite with TypeORM
- **Scraping**: Puppeteer + Cheerio
- **Scheduling**: @nestjs/schedule (no Redis/Bull for initial release)
- **UI**: Tailwind CSS with Recharts for visualization

## Project Structure

### Completed

```
goldy/
├── apps/
│   ├── backend/                 # NestJS application
│   └── frontend/                # Next.js application
├── libs/
│   └── shared/
│       ├── types/               # DTOs and enums
│       └── utils/               # Weight converters, price calculators
├── docs/tech/                   # Technical documentation
├── nx.json                      # Nx configuration
├── package.json                 # Dependencies
└── tsconfig.base.json           # TypeScript config with path aliases
```

### Backend Architecture (Pending)

```
apps/backend/src/
├── domain/                      # Business logic
│   ├── entities/                # Core entities
│   ├── enums/                   # Business enums
│   └── repositories/            # Repository interfaces
├── application/                 # Use cases
│   ├── use-cases/               # Business use cases
│   └── services/                # Application services
├── infrastructure/              # External integrations
│   ├── database/                # TypeORM configuration
│   ├── scrapers/                # Web scraping strategies
│   └── scheduling/              # Scheduled tasks
└── presentation/                # API layer
    └── controllers/             # REST controllers
```

## Data Model

### Core Entities

1. **Asset** - Physical precious metal with weight, purity, manufacturer
2. **Dealer** - Vendor/retailer with scraping configuration
3. **AssetListing** - Links assets with dealers (includes productLink)
4. **PriceRecord** - Price data for specific asset-dealer combinations

### Key Features

- Multiple dealers can sell the same asset
- Real-time price scraping per asset listing
- Premium calculations over spot prices
- Weight conversion utilities (grams, troy ounces, etc.)
- Currency formatting and percentage calculations

## Development Roadmap

### Phase 1: Core Backend (In Progress)

- [x] Monorepo setup with Nx
- [x] Shared types and utils libraries
- [x] Basic NestJS structure
- [x] Error handling system (BusinessRuleError, ErrorDto, ErrorUtils)
- [x] String utilities with comprehensive testing (StringUtils)
- [x] ID utilities with Base32 support (IDUtils using hi-base32)
- [x] TypeScript path aliases and ES modules configuration
- [x] Global Jest configuration for all backend tests
- [x] Comprehensive test coverage for error handling (ErrorDto, ErrorUtils tests)
- [x] Complete error code system with HTTP status mapping
- [x] Exception message extractors and error chain handling
- [ ] Domain entities with TypeORM inheritance
- [ ] Database configuration (SQLite)
- [ ] Repository pattern implementation
- [ ] Basic CRUD operations

### Phase 2: Scraping Infrastructure

- [ ] Scraper strategy pattern
- [ ] Puppeteer integration for dynamic content
- [ ] Cheerio for HTML parsing
- [ ] Scheduled scraping with @nestjs/schedule
- [ ] Error handling and retry logic

### Phase 3: API Layer

- [ ] RESTful endpoints
- [ ] Price history APIs
- [ ] Asset management endpoints
- [ ] Dealer configuration APIs

### Phase 4: Frontend Development

- [ ] Next.js setup with Tailwind CSS
- [ ] Dashboard with price comparison
- [ ] Asset management interface
- [ ] Charts and visualization
- [ ] Responsive design

### Phase 5: Production Features

- [ ] Docker configuration
- [ ] Environment configuration
- [x] Testing strategy (Jest with co-located tests established)
- [ ] Performance optimization

## Key Design Decisions

1. **No Redis/Bull Queue**: Using @nestjs/schedule for simplicity in initial release
2. **SQLite**: Lightweight database for initial development
3. **Asset-Dealer Separation**: Same asset can be sold by multiple dealers
4. **Clean Architecture**: Separating concerns for maintainability
5. **TypeScript Monorepo**: Shared types and utilities across frontend/backend
6. **Error Handling**: Comprehensive BusinessRuleError with error codes matching HTTP status
7. **Testing Strategy**: Co-located tests with global Jest configuration
8. **ES Modules**: Full ESM support with proper TypeScript configuration

## API Endpoints (Planned)

### Assets

- `GET /api/assets` - List all assets
- `POST /api/assets` - Create new asset
- `GET /api/assets/:id` - Get asset details
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Asset Listings

- `GET /api/asset-listings` - List all asset listings
- `POST /api/asset-listings` - Create new listing
- `GET /api/asset-listings/:id` - Get listing details

### Prices

- `GET /api/prices` - Get price history
- `GET /api/prices/latest` - Get latest prices
- `GET /api/prices/compare` - Compare prices across dealers

### Dealers

- `GET /api/dealers` - List all dealers
- `POST /api/dealers` - Create new dealer
- `PUT /api/dealers/:id` - Update dealer configuration

### Scraping

- `POST /api/scraping/trigger` - Manual scraping trigger
- `GET /api/scraping/status` - Scraping status

## Database Schema

### Assets Table

- id (uuid)
- name (string)
- manufacturerName (string)
- assetType (enum)
- metalType (enum)
- weightGrams (decimal)
- purity (string, optional)
- createdAt, updatedAt

### Dealers Table

- id (uuid)
- name (string)
- websiteUrl (string)
- scrapingConfig (json)
- isActive (boolean)
- createdAt

### AssetListings Table

- id (uuid)
- assetId (uuid, FK)
- dealerId (uuid, FK)
- productLink (string)
- isActive (boolean)
- lastScrapedAt (timestamp)
- createdAt, updatedAt

### PriceRecords Table

- id (uuid)
- assetListingId (uuid, FK)
- sellPrice, buyPrice, spotPrice (decimal)
- premiumPercent (decimal)
- currency (string)
- deliveryDays (integer)
- inStock (boolean)
- scrapedAt (timestamp)

## Completed Work

### Shared Libraries Implementation

- **@goldy/shared/types**:
  - Complete DTOs (Asset, Dealer, AssetListing, PriceRecord) with proper separation
  - Error handling classes: BusinessRuleError, ErrorDto, ErrorCode interface
  - GeneralErrorCode enum with complete HTTP status mapping (400-511)
  - ErrorUtils utility class with comprehensive error handling methods
  - ExceptionMessageExtractor pattern for custom error processing
  - Full test coverage with error.dto.spec.ts, error-utils.spec.ts
- **@goldy/shared/utils**:
  - Comprehensive StringUtils class with hideString, trimming, validation methods
  - IDUtils with UUID generation/validation, Base32 encoding using hi-base32 library
  - Weight converters and price calculators (base implementation)
  - Test coverage: 95.83% for StringUtils with 29 test cases

### Testing Infrastructure

- **Global Jest configuration**: Centralized jest.config.mjs for all backend tests
- **Test organization**: Co-located tests with source files (.spec.ts pattern)
- **ES Modules support**: Full ESM configuration with ts-jest
- **Test projects**: Separate test configurations for shared-types and shared-utils
- **Comprehensive test suites**:
  - ErrorDto tests: Builder pattern, serialization, error code mapping
  - ErrorUtils tests: Exception chain handling, validation methods, ID validation
  - StringUtils tests: All edge cases covered including null/undefined handling

### Development Environment

- **TypeScript configuration**: ES modules, path aliases (@goldy/shared/\*), proper build exclusions
- **Package management**: hi-base32, uuid dependencies integrated
- **Code quality**:
  - Eliminated redundant patterns (trimToEmpty usage)
  - Consistent error handling with formatted messages
  - Self-referencing exception protection
- **Development guidelines**: Documented in CLAUDE.md with architecture overview

## Next Steps

1. Continue with domain entities implementation
2. Set up TypeORM with SQLite
3. Implement repository pattern
4. Create use cases for asset management
5. Add scraping infrastructure
