# Contracts Refactor Plan
**Status**: 📋 Planning  
**Goal**: Reorganize all contracts into aggregate-scoped classpath + replace Zod with Interface/Type (where not actively validated)

---

## Executive Summary

**Current state:**
- Contracts spread across modules: some use single `contracts.ts`, others use `contracts/` folder
- Zod usage: 95% for type-only, 5% actual `.parse()` validation (11 instances across codebase)
- Type duplication: Props/Data/Filter/Response types scattered, hard to navigate

**Target state:**
- All modules: `domain/contracts/{aggregate}/` structure (appointment pattern)
- Zod → Interface/Type conversion: Remove schema boilerplate, keep type-safety
- Centralized structure: predictable, modular, IDE-friendly

---

## Module Refactor Checklist

### Priority 1: Foundation (no aggregates, single contract file)
- [ ] **supply/inventory** (1 aggregate: Supplier)
- [ ] **platform/lookup** (?)
- [ ] **platform/mail** (?)

### Priority 2: Simple Aggregates (1-2 types each)
- [ ] **admin-request**
- [ ] **audit-log**
- [ ] **bank**
- [ ] **health-tourism**
- [ ] **notification**
- [ ] **party**
- [ ] **payment-gateway**
- [ ] **policy**
- [ ] **subscription**

### Priority 3: Multi-Input Aggregates (3+ types)
- [ ] **auth**
- [ ] **clinic**
- [ ] **clinic-governance**
- [ ] **e-document**
- [ ] **finance-ledger**
- [ ] **invoice**
- [ ] **lead**
- [ ] **medical-files**
- [ ] **meta-ads**
- [ ] **patient**
- [ ] **payment**
- [ ] **pos**
- [ ] **project**
- [ ] **provider**
- [ ] **purchase-invoice**
- [ ] **purchasing**
- [ ] **role**
- [ ] **treatment**
- [ ] **treatment-charge**
- [ ] **user**
- [ ] **work-order**

### Priority 4: Multi-Context Aggregates (complex, versioned)
- [ ] **appointment** (already done ✓)
- [ ] **activity**
- [ ] **attendance**
- [ ] **consent-form**
- [ ] **employee**
- [ ] **leave**
- [ ] **organization**
- [ ] **pipeline**
- [ ] **payroll**
- [ ] **pos** (rescan — already in priority 3)

### Priority 5: Cross-module Shared (lookup, ai-tools)
- [ ] **ai-tools**
- [ ] **shared** (if exists in finance/)

---

## Refactor Pattern

### Before (Single contracts.ts)
```
modules/supplier/domain/
  contracts/
    supplier.contracts.ts  (← fat file, Zod + Types)
```

```typescript
// supplier.contracts.ts
export const CreateSupplierSchema = z.object({
  name: z.string().min(1, '...'),
  email: z.email().nullable().optional(),
});
export type CreateSupplierProps = z.infer<typeof CreateSupplierSchema>;

export const UpdateSupplierSchema = z.object({...});
export type UpdateSupplierProps = z.infer<typeof UpdateSupplierSchema>;
```

### After (Aggregate-scoped contracts)
```
modules/supplier/domain/
  contracts/
    supplier/
      supplier-inputs.ts      (Create/Update props)
      supplier-queries.ts     (Read models, filters)
      index.ts
    index.ts
```

```typescript
// supplier-inputs.ts
export interface CreateSupplierProps {
  id?: string;
  name: string;
  email?: string | null;
  organizationId: string;
  clinicId: string;
}

export interface UpdateSupplierProps {
  name?: string;
  email?: string | null;
  // ... rest
}
```

```typescript
// supplier-queries.ts
export type FindSupplierFilter = {
  organizationId: string;
  clinicId?: string;
  search?: string;
};

export type SupplierResponse = {
  id: string;
  name: string;
  email: string | null;
  organizationId: string;
};
```

```typescript
// index.ts
export * from './supplier-inputs';
export * from './supplier-queries';
```

---

## Zod Migration Rules

### ✅ Convert to Interface/Type
- No `.parse()` used anywhere in module
- Type-only derivation (just need `z.infer<>`)
- Property descriptions can be inline comments

**Example:**
```typescript
// ❌ Before
export const CreateSupplierSchema = z.object({
  name: z.string().min(1, 'Tedarikçi adı zorunludur'),
  email: z.email('Geçersiz e-posta formatı').nullable().optional(),
});
export type CreateSupplierProps = z.infer<typeof CreateSupplierSchema>;

// ✓ After
export interface CreateSupplierProps {
  /** Tedarikçi adı. */
  name: string;
  /** Geçersiz e-posta formatı. */
  email?: string | null;
}
```

### ⚠️ Keep Zod (if active validation exists)
- Module uses `Schema.parse()` or `.safeParse()`
- Domain entity validates with Zod
- Custom `.refine()` / `.superRefine()` logic

**Modules to scan for active validation:**
```bash
grep -r "Schema.parse\|Schema.safeParse" /Users/alp/WebStorm\ Projects/core-crm/apps/api/src/modules --include="*.ts"
```

Current: Only **11 instances** across codebase → minimal impact.

---

## Execution Steps (Per Module)

1. **Identify aggregates** in module
   - Each entity = 1 aggregate
   - If module has shared contracts (cross-aggregate), list them

2. **Create contract folder structure**
   ```
   domain/contracts/
     {aggregate-name}/
       {aggregate-name}-inputs.ts
       {aggregate-name}-queries.ts
       {aggregate-name}-serialization.ts (if applicable)
       index.ts
     shared.contracts.ts (if cross-aggregate types exist)
     index.ts
   ```

3. **Migrate types** (Zod → Interface)
   - Extract `z.infer<>` types → standalone interfaces
   - Move validation rules to entity `.create()` / `Guard.monitor()`
   - Keep comments for constraints (`min/max`, etc.)

4. **Update imports** across module
   - Handlers: `import { CreateSupplierProps } from '../../domain/contracts'`
   - Tests: same
   - DTO layer: still uses DTO, but imports Type from contracts

5. **Run tsc, tests, e2e** to verify

---

## Import Pattern After Refactor

```typescript
// ✓ Handler imports type directly
import type { CreateSupplierProps } from '@modules/supply/inventory/domain/contracts';
import { Supplier } from '@modules/supply/inventory/domain/entities';

async execute(command: CreateSupplierCommand): Promise<string> {
  const props: CreateSupplierProps = { /* ... */ };
  const supplier = Supplier.create(props);
  return supplier.id;
}

// ✓ DTO still exists (NestJS @Body() validation)
import { CreateSupplierDto } from '@shared/modules/supply/dto/commands';

@Post()
create(@Body() dto: CreateSupplierDto) {
  // dto → CreateSupplierProps in handler
}

// ✓ Query repo returns plain model (Interface type)
export interface SupplierResponse {
  id: string;
  name: string;
  email: string | null;
}

const supplier: SupplierResponse = await this.supplierQueryRepo.findById(id);
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Breaking imports | Run tsc in each module as we go; fix incrementally |
| Tests fail | Co-located `.spec.ts` files validate immediately |
| Prisma model drift | Contracts are TS-only; Prisma unchanged |
| DTO ↔ Type sync | Contracts are single source of truth; DTOs extend/infer from @shared |

---

## Timeline Estimate

- **Per module (simple)**: 10-15 min (folder + 2 files)
- **Per module (complex, 5+ types)**: 30-45 min
- **Total (45 modules)**: ~30-40 hours (can parallelalize)

**Suggested approach**: Start with Priority 1 (supply/inventory, 1 module = 15 min), then batch Priority 2 (10 modules × 15 min = 2.5 hrs).

---

## Sign-Off Criteria

- [ ] All modules follow `contracts/{aggregate}/` pattern
- [ ] Zod schemas removed (except 11 active-validation instances)
- [ ] `tsc --noEmit` passes project-wide
- [ ] All tests green
- [ ] No breaking imports
