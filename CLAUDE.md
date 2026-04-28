# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Core CRM is a monorepo containing a NestJS-based API backend and a Next.js frontend for managing CRM operations in healthcare sectors (dental, hair transplant, aesthetics). The project uses pnpm workspaces, Turbo for build orchestration, Prisma for database management, and follows Clean Architecture principles.

## Monorepo Structure

```
apps/
  api/        # NestJS backend API
  web/        # Next.js frontend
packages/
  shared/     # Shared types, schemas, and Zod validations
```

## Common Commands

### Development
```bash
# Run all apps in dev mode
pnpm dev

# Run specific app
cd apps/api && pnpm start:dev
cd apps/web && pnpm dev
```

### Database
```bash
# Navigate to API directory first
cd apps/api

# Generate Prisma client and Zod schemas
pnpm prisma:generate

# Create and apply migrations
pnpm migrate:dev

# Seed database
pnpm prisma db seed
```

### Build & Test
```bash
# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Format code
pnpm format

# Run tests (from apps/api)
cd apps/api
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:cov          # With coverage
pnpm test:e2e          # E2E tests
```

## Architecture (apps/api)

### Clean Architecture Layers

The API follows a modular Clean Architecture pattern with strict separation of concerns:

**Module Structure** (e.g., `src/modules/clinic/`):
```
domain/                    # Business entities and domain events
  events/                  # Domain events (e.g., ClinicSoftDeletedEvent)
application/               # Use cases and business logic
  dto/                     # Data transfer objects
  policies/                # Authorization policies
  use-cases/               # Business use cases
    commands/              # Write operations (create, update, delete)
    queries/               # Read operations
    module/                # Use case module definition
infrastructure/            # External concerns
  persistence/prisma/      # Database repositories
  listeners/               # Event listeners
  publisher/               # Event publishers
  processors/              # Queue processors
presentation/              # API layer
  controllers/             # HTTP controllers
```

### Key Architectural Patterns

**1. Use Cases**: All business logic is encapsulated in use case classes
- Commands: `CreateClinicUseCase`, `UpdateClinicUseCase`, `SoftDeleteClinicUseCase`
- Queries: `FindManyByOrganizationIdUseCase`
- Use cases are injected into controllers
- Each module exports use cases via a use case module (e.g., `ClinicUseCaseModule`)

**2. Repository Pattern**: Database access is abstracted through repositories
- Located in `infrastructure/persistence/prisma/repositories/`
- Injected into use cases, not controllers
- Example: `ClinicRepository`, `UserRepository`

**3. Policy-Based Authorization**:
- Uses `PolicyFactory` to create policies based on `ActorContext`
- Policies provide filtering and access control
- Example: `policy.getOrganizationFilter(organizationId)`

**4. Event-Driven Architecture**:
- Domain events in `domain/events/` (e.g., `ClinicSoftDeletedEvent`)
- Event publishers in `infrastructure/publisher/`
- Event listeners in `infrastructure/listeners/` handle side effects
- Uses `@nestjs/event-emitter` with `@OnEvent()` decorator

**5. ActorContext Pattern**:
- Extracted via `@Actor()` decorator in controllers
- Contains `userId`, `organizationId`, `source`, `capabilities`, `roleId`
- Passed to use cases for authorization and audit

### Prisma Configuration

Prisma schema and migrations are in a non-standard location:
- Schema: `apps/api/src/infrastructure/persistence/prisma/schema.prisma`
- Migrations: `apps/api/src/infrastructure/persistence/prisma/migrations/`
- Seed: `apps/api/src/infrastructure/persistence/prisma/seed.ts`
- Prisma config: `apps/api/prisma.config.ts`

**Seed Data**:
- Located in `apps/api/src/infrastructure/persistence/prisma/data/`
- Includes organizations, clinics, roles, capabilities, master treatments, sectors, languages
- Use helper utilities in `data/utils/` for seeding

### Shared Package

The `@core-crm/shared` package contains:
- **Generated Zod schemas**: Auto-generated from Prisma schema via `zod-prisma-types`
- **Module-specific schemas**: Hand-written validation schemas (e.g., `packages/shared/modules/clinic/schemas/`)
- **DTOs and interfaces**: Shared between frontend and backend
- **Common utilities**: Pagination types, etc.

### Common Patterns

**Controllers**:
- Use `@UseGuards(AuthGuard)` for protected routes
- Extract actor with `@Actor() actor: ActorContext`
- Inject use cases, not repositories
- Keep thin - delegate to use cases

**Creating New Modules**:
1. Follow the Clean Architecture structure above
2. Create use case module that exports all use cases
3. Register use case module in main module imports
4. Create repository in `infrastructure/persistence/prisma/repositories/`
5. Define domain events in `domain/events/`
6. Create event listeners in `infrastructure/listeners/`
7. Register listeners in module providers array

**Path Aliases**:
- `@src/*` → `apps/api/src/*`
- `@common/*` → `apps/api/src/common/*`
- `@modules/*` → `apps/api/src/modules/*`
- `@shared` → `packages/shared`

### Infrastructure Services

**Configuration** (`InfrastructureModule`):
- PostgreSQL (Prisma)
- MongoDB (Mongoose)
- Redis (ioredis)
- BullMQ (job queues)
- Firebase Admin
- Winston logging (Betterstack/Logtail)
- Environment validation with Joi

**Global Middleware & Guards**:
- Helmet (security headers)
- CORS (configurable via `ALLOWED_ORIGINS`)
- Throttler guard (rate limiting)
- Zod validation pipe
- All exceptions filter
- Logging interceptor

**API Versioning**:
- URI-based versioning: `/api/v1/`
- Default version: `1`

## Important Notes

### Database Migrations
- Always run migrations from `apps/api` directory
- After schema changes, run `pnpm prisma:generate` to regenerate client and Zod schemas
- Zod schemas are generated to `packages/shared/generated-zod/`

### Multi-Tenancy
- Most entities are scoped to an `Organization`
- Use `PolicyFactory` to enforce organization-level access control
- Actor context provides organization filtering

### Event Sourcing
- Events are published after successful database operations
- Listeners handle side effects (audit logging, notifications, cascading deletes)
- Use `EventEmitter2` via `@nestjs/event-emitter`

### Required Environment Variables
Check `apps/api/src/infrastructure/infrastructure.module.ts` for required env vars:
- `DATABASE_URL` (PostgreSQL)
- `MONGODB_URI`
- `REDIS_URL`
- `ADMIN_EMAIL`
- `BETTERSTACK_TOKEN`
- `PORT` (defaults to 8080)
- `ALLOWED_ORIGINS` (comma-separated, defaults to `http://localhost:3000`)

### Working with Sectors
The application supports multiple sectors: `ALL`, `DENTAL`, `HAIR_TRANSPLANT`, `AESTHETICS`. Entities like Clinic, Provider, and treatments are sector-specific.

### Firebase Integration
Firebase Admin SDK is used for authentication. Configuration file should be at `firebase-sdk.json` (excluded from git).
