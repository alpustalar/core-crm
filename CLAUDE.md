# CLAUDE.md

**Kod yazarken bu kurallara sadık kal**

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Core CRM is a monorepo containing a NestJS-based API backend and a Next.js frontend for managing CRM operations in
healthcare sectors (dental, hair transplant, aesthetics). The project uses pnpm workspaces, Turbo for build
orchestration, Prisma for database management, and follows Clean Architecture principles.

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

The API follows a modular CQRS + Clean Architecture pattern with strict separation of concerns:

**Module Groups** (`src/modules/`):

```
clinical/    → appointment, medical-files, provider, treatment, treatment-package
crm/         → lead, meta-ads, patient
finance/     → finance-ledger, invoice, payment, pos, subscription
identity/    → auth, role, user
inventory/   → (tekil modül)
organization/ → clinic, organization
platform/    → admin-request, audit-log, lookup, mail, policy
```

**Module Structure** (e.g., `src/modules/organization/clinic/`):

```
domain/                    # Business entities and domain events
  events/                  # Domain events (e.g., ClinicSoftDeletedEvent)
  repositories/
  entities/
  events/
  services/
application/               # Commands, queries, and business logic
  policies/                # Authorization policies
  commands/                # Command handlers (write operations)
    create-clinic/
      create-clinic.command.ts     # Command class (input payload)
      create-clinic.handler.ts     # Handler (business logic, @CommandHandler)
      create-clinic.response.ts    # Output contract (return type)
      create-clinic.spec.ts        # Unit tests
    update-clinic/
      update-clinic.command.ts
      update-clinic.handler.ts
      update-clinic.response.ts
      update-clinic.spec.ts
    command.module.ts              # Registers all command handlers
  queries/                 # Query handlers (read operations)
    get-clinic/
      get-clinic.query.ts          # Query class (input payload)
      get-clinic.handler.ts        # Handler (@QueryHandler)
      get-clinic.response.ts       # Output contract
      get-clinic.spec.ts
    query.module.ts                # Registers all query handlers
infrastructure/            # External concerns
  persistence/prisma/      # Database repositories
  events/               # events
    listener/           #listeners
    clinic-event-publisher.service.ts               # Event publisher servisi
    clinic-event.module.ts
  qeueue/
    processors/
    producer/           # Queue processors
presentation/              # API layer
  controllers/             # HTTP controllers
  clinic-presentation.module
```

**CQRS Folder Structure Rules**:

Each command/query is self-contained in its own folder with:

- `*.command.ts` / `*.query.ts` — Plain class holding the input payload; no logic
- `*.handler.ts` — The handler decorated with `@CommandHandler` / `@QueryHandler`; all business logic lives here
- `*.response.ts` — Output contract (type alias for the return value)
- `*.spec.ts` — Unit tests for the handler
- No cross-folder imports between command/query folders; share via repositories or the bus
- All handlers are registered in `command.module.ts` / `query.module.ts` and wired with `CqrsModule`

**Response Type Kuralı — KURAL**:

| İşlem tipi | Dönüş tipi | Notlar |
|---|---|---|
| **Query** | `QueryResponse<T>` | `@shared/common/response/response.interface.ts`'den import edilir |
| **Command — create** | `string` | Oluşturulan kaydın `id`'si doğrudan döner |
| **Command — update / delete (basit)** | `void` | Sadece aşağıdaki istisnalar yoksa |
| **Command — optimistic locking** | `{ version: number }` veya `{ updatedAt: Date }` | Frontend bir sonraki istekte doğru version'ı gönderebilmeli |
| **Command — 3rd party entegrasyon** | `{ referenceId, status, ... }` | Dış servis (Nilvera, İyzico, Stripe) anlık metadata üretiyorsa |
| **Command — Saga / workflow adımı** | İlgili state / output | Sonraki adım bu çıktıya bağlıysa |

**Altın Kural**: Command'ler asla zengin domain modeli veya entity listesi döndürmez. Sadece o command'in yaşam döngüsünü tamamlamak için gereken **minimum metadata** döner (ID, version, status, entegrasyon ref no). Veri listelemek veya detay göstermek için her zaman Query kullanılır.

**Query response** (`*.response.ts`):
```typescript
import { QueryResponse } from '@shared/common/response/response.interface';
import { Lead } from '@modules/crm/lead/domain/entities/lead.entity';

export type GetLeadByIdResponse = QueryResponse<Lead | null>;
```

**Query sınıfında `__responseType`** (TSQueryBus için tip çıkarımı sağlar):
```typescript
export class GetLeadByIdQuery implements IQuery {
  readonly __responseType!: GetLeadByIdResponse;
  constructor(
    public readonly leadId: string,
    public readonly ctx: IGetContext,
  ) {}
}
```

**Command — create** (`*.response.ts` gerekmez, doğrudan `string`):
```typescript
// create-lead.handler.ts
async execute(command: CreateLeadCommand): Promise<string> {
  const lead = await this.leadCommandRepo.create(props);
  return lead.id;
}
```

**Command — basit update / delete** (`void`, response dosyası olmaz):
```typescript
async execute(command: UpdateLeadStatusCommand): Promise<void> {
  // optimistic locking, 3rd party entegrasyon veya saga yoksa void yeterli
}
```

**Command — optimistic locking** (versiyonlu güncelleme, response dosyası olur):
```typescript
// update-appointment.response.ts
export interface UpdateAppointmentResponse {
  version: number; // veya updatedAt: Date
}

// update-appointment.handler.ts
async execute(command: UpdateAppointmentCommand): Promise<UpdateAppointmentResponse> {
  // entity.version DB'de artırıldı, frontend bir sonraki istekte bunu gönderecek
  return { version: saved.version };
}
```

**Command — 3rd party entegrasyon** (response dosyası olur):
```typescript
// create-invoice.response.ts
export interface CreateInvoiceResponse {
  referenceId: string; // GİB / Nilvera'nın ürettiği belge no
  status: string;
}
```

**TSCommandBus / TSQueryBus — KURAL**:

Controller'larda ham `CommandBus` / `QueryBus` yerine tip-güvenli sarmalayıcılar kullanılır.
- Konum: `src/common/cqrs/`
- `TSCommandBus`: `TCommand.__responseType` üzerinden dönüş tipini çıkarır
- `TSQueryBus`: `TQuery.__responseType` üzerinden dönüş tipini çıkarır

```typescript
// ❌ Yanlış
constructor(private readonly queryBus: QueryBus) {}
const result = await this.queryBus.execute(new GetLeadByIdQuery(...)); // tip: any

// ✓ Doğru
constructor(private readonly queryBus: TSQueryBus) {}
const result = await this.queryBus.execute(new GetLeadByIdQuery(...)); // tip: GetLeadByIdResponse
```

### Key Architectural Patterns

**1. CQRS (Commands & Queries)**: All business logic is encapsulated in command/query handlers

- Commands (write): `CreateClinicCommand` + `CreateClinicHandler`, `UpdateClinicCommand` + `UpdateClinicHandler`
- Queries (read): `GetClinicQuery` + `GetClinicHandler`, `FindManyClinicsQuery` + `FindManyClinicsHandler`
- Controllers dispatch via `TSCommandBus.execute()` / `TSQueryBus.execute()` — no direct handler injection
- Each module registers its handlers in `command.module.ts` and `query.module.ts`, both imported by the main module

**2. Repository Pattern**: Database access is abstracted through repositories

- Located in `infrastructure/persistence/prisma/repositories/`
- Injected into command and query handlers, not controllers
- Example: `ClinicRepository`, `UserRepository`
- **All repositories extend `BaseRepository`** (`src/infrastructure/persistence/prisma/base.repository.ts`)

**BaseRepository**:

```typescript
// src/infrastructure/persistence/prisma/base.repository.ts
export abstract class BaseRepository {
  protected constructor(protected readonly prisma: PrismaService) {}

  protected get db() {
    return txStorage.getStore()?.tx ?? this.prisma;
  }
}
```

- `this.db` yerine `this.prisma` kullanılmaz — her zaman `this.db` kullanılır
- `this.db`, Async Local Storage (ALS) üzerinden aktif bir transaction varsa onu, yoksa ana `PrismaService`'i döner
- Bu sayede `txStorage` ile koordine edilen transaction'lar otomatik olarak yakalanır

**Repository Mimarisi — KURAL: Command / Query Ayrımı + Interface + Token**:

Her repository **iki ayrı implementasyon dosyasına** bölünür. Interface'ler ve injection token'ları **domain katmanında** tutulur (Dependency Inversion Principle: domain kendi ihtiyacını tanımlar, infrastructure implement eder). Başka katmanlarda inject ederken sınıf adı değil, **token** kullanılır.

**Klasör yapısı**:

```
domain/
  repositories/
    foo.repository.ts            # IFooCommandRepository + IFooQueryRepository + token'lar

infrastructure/persistence/prisma/repositories/
  foo/
    foo.command.repository.ts    # Write operasyonları (create, update, delete)
    foo.query.repository.ts      # Read operasyonları (find, list)
    foo.repository.module.ts     # İkisini birleştiren NestJS modülü
```

**Interface dosyası** (`domain/repositories/foo.repository.ts`):

```typescript
export const FOO_COMMAND_REPOSITORY = Symbol('IFooCommandRepository');
export const FOO_QUERY_REPOSITORY = Symbol('IFooQueryRepository');

export interface IFooCommandRepository {
  create(data: CreateFooInput): Promise<Foo>;
  update(id: string, data: UpdateFooInput): Promise<Foo>;
  softDelete(id: string): Promise<void>;
}

export interface IFooQueryRepository {
  findById(id: string): Promise<Foo | null>;
  findMany(
    spec: Specification<Prisma.FooWhereInput>,
    pagination: Pagination
  ): Promise<PaginatedResult<Foo>>;
}
```

**Command repository** (`foo.command.repository.ts`):

```typescript
@Injectable()
export class FooCommandRepository
  extends BaseRepository
  implements IFooCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  create(data: CreateFooInput) {
    return this.db.foo.create({ data });
  }

  softDelete(id: string) {
    return this.db.foo.update({ where: { id }, data: { isDeleted: true } });
  }
}
```

**Query repository** (`foo.query.repository.ts`):

```typescript
@Injectable()
export class FooQueryRepository
  extends BaseRepository
  implements IFooQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string) {
    return this.db.foo.findUnique({ where: { id } });
  }

  findMany(spec: Specification<Prisma.FooWhereInput>, pagination: Pagination) {
    return paginate({
      delegate: this.db.foo,
      pagination,
      where: spec.toQuery(),
    });
  }
}
```

**Repository modülü** (`infrastructure/persistence/prisma/repositories/foo/foo.repository.module.ts`):

```typescript
import {
  FOO_COMMAND_REPOSITORY,
  FOO_QUERY_REPOSITORY,
} from '@modules/foo/domain/repositories/foo.repository';

@Module({
  providers: [
    { provide: FOO_COMMAND_REPOSITORY, useClass: FooCommandRepository },
    { provide: FOO_QUERY_REPOSITORY, useClass: FooQueryRepository },
  ],
  exports: [FOO_COMMAND_REPOSITORY, FOO_QUERY_REPOSITORY],
})
export class FooRepositoryModule {}
```

**Handler'da inject etme**:

```typescript
// ❌ Yanlış — sınıfı direkt inject etmek
constructor(private readonly fooRepository: FooCommandRepository) {}

// ✓ Doğru — domain'deki token + interface üzerinden inject etmek
import {
  FOO_COMMAND_REPOSITORY,
  FOO_QUERY_REPOSITORY,
  IFooCommandRepository,
  IFooQueryRepository,
} from '@modules/foo/domain/repositories/foo.repository';

constructor(
  @Inject(FOO_COMMAND_REPOSITORY)
  private readonly fooCommandRepo: IFooCommandRepository,

  @Inject(FOO_QUERY_REPOSITORY)
  private readonly fooQueryRepo: IFooQueryRepository,
) {}
```

**7. Domain Types — KURAL**:

Her modülün `domain/types/` klasörü, o modüle ait tüm domain-seviye tip tanımlarını barındırır. Repository interface'leri ve repository implementasyonları tiplerini buradan alır. **Application katmanından (command/handler) import etmez**.

**Klasör yapısı**:

```
identity/user/domain/types/
  create-user.props.ts                  # Repo'nun create() metoduna geçilen props
  update-user.props.ts                  # Repo'nun update() metoduna geçilen props
  create-user-internal-relations.type.ts # Sadece internal cascade'lerde kullanılan ek veri
  user-with-role-priority.type.ts       # Domain query sonucu için bileşik tip
  paginated-users.type.ts
  auth-user-response.type.ts
```

**Kurallar**:

- `*.props.ts` → Repository metodlarının input tipi. Repo interface ve implementasyonu buradan alır.
- `*.type.ts` → Sorgu sonuçları, bileşik tipler, internal cascade'e özgü tipler.
- `shared` paketindeki DTO'lara (`CreateUser`, `UpdateUser`) **asla** DB'ye özgü alan (ör. `firebaseUid`, `id`) eklenmez; o alanlar `*.props.ts` veya `*-internal-relations.type.ts`'e gider.

```typescript
// ❌ Yanlış — command dosyasından import ediyor
import { CreateUserInternalRelations } from '@modules/identity/user/application/commands/create-user/create-user.command';

// ✓ Doğru — domain/types'tan import ediyor
import { CreateUserInternalRelations } from '@modules/identity/user/domain/types/create-user-internal-relations.type';
```

---

**Handler / Repository sorumluluk ayrımı — KURAL**:

| Katman                 | Sorumluluğu                                                                                                         | Değil                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **Handler**            | İş mantığı, validasyon, karar verme, entity çözümleme (ör. patientId → isim/telefon), endTime hesabı, field mapping | Ham DB sorgusu, event üretme kararı            |
| **Repository**         | Kendi modeline ait ham DB operasyonu (create, update, find, delete)                                                 | İş kararı, koşul, birleştirme, event tetikleme |
| **TransactionManager** | `outboxRun()` ile transaction sonunda ALS'deki event'leri Outbox tablosuna atomik olarak mühürler                   | İş kararı, event içeriği belirleme             |

Örnek: Bir randevu oluşturulurken `patientId`'den hasta adının çekilmesi, `endTime` hesabı ve `doctorId → providerId`
mapping'i **handler**'ın sorumluluğundadır. Repository yalnızca hazır veriyi alıp yazar.

**Domain Entity — KURAL**:

Domain entity'ler `domain/entities/` klasöründe bulunur. Her entity şu yapıya uyar:

- Prisma model interface'ini `implements` eder (`IAppointment` gibi)
- Tüm field'lar `private _field` olarak tanımlanır; dışarıya yalnızca getter açılır
- Domain iş metodları (durum geçişleri, validasyon) entity içinde yaşar
- `toPersistence()` metodu entity'yi ham Prisma kaydına dönüştürür; repository'nin `save()` metodunu besler
- Static factory metodlar (ör. `calculateEndTime`) hesaplamaları entity'ye katar

**Örnek: `appointment.entity.ts`**

```typescript
import {
  Appointment as IAppointment,
  AppointmentStatus,
  ExaminationType,
  ExternalSystem,
  VisitType,
} from '@prisma/client';
import { DateTimeManager } from '@common/utils';

export class Appointment implements IAppointment {
  constructor(data: IAppointment) {
    this._id = data.id;
    this._patientName = data.patientName;
    // ... diğer field atamalar
    this._status = data.status;
    this._startTime = data.startTime;
    this._endTime = data.endTime;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _status: AppointmentStatus;
  get status(): AppointmentStatus {
    return this._status;
  }

  private _startTime: Date;
  get startTime(): Date {
    return this._startTime;
  }

  private _endTime: Date;
  get endTime(): Date {
    return this._endTime;
  }

  // ... diğer private field'lar + getter'lar

  // Static factory
  public static calculateEndTime(
    start: Date,
    endTime?: Date,
    duration?: number
  ): Date {
    if (endTime) return new Date(endTime);
    if (duration) return DateTimeManager.addMinutes(start, duration);
    throw new Error('Randevu süresi veya bitiş zamanı belirlenemedi.');
  }

  // Durum geçiş metodları
  public confirm(): void {
    if (this._status !== AppointmentStatus.PENDING) {
      throw new Error('Yalnızca bekleyen randevular onaylanabilir.');
    }
    this._status = AppointmentStatus.CONFIRMED;
  }

  public cancel(canceledBy: string, reason?: string): void {
    if (!this.canBeCancelled()) {
      throw new Error(
        'Tamamlanan, iptal edilmiş veya gelmedi randevular iptal edilemez.'
      );
    }
    this._status = AppointmentStatus.CANCELLED;
    this._canceledAt = new Date();
    this._canceledBy = canceledBy;
    if (reason) this._cancelReason = reason;
  }

  public complete(): void {
    if (!this.isPending() && !this.iConfirmed()) {
      throw new Error(
        'Yalnızca onaylanan veya bekleyen randevular tamamlanabilir.'
      );
    }
    this._status = AppointmentStatus.COMPLETED;
  }

  public reschedule(
    startTime: Date,
    endTime: Date,
    providerId: string,
    notes?: string,
    treatmentId?: string | null
  ): void {
    if (!this.canBeRescheduled()) {
      throw new Error(
        'İptal/tamamlanmış/gelmedi randevular yeniden zamanlanamaz.'
      );
    }
    this._startTime = startTime;
    this._endTime = endTime;
    this._providerId = providerId;
    if (notes !== undefined) this._notes = notes;
    if (treatmentId !== undefined) this._treatmentId = treatmentId;
  }

  // Durum sorgulama metodları
  public isPending(): boolean {
    return this._status === AppointmentStatus.PENDING;
  }
  public iConfirmed(): boolean {
    return this._status === AppointmentStatus.CONFIRMED;
  }
  public isCancelled(): boolean {
    return this._status === AppointmentStatus.CANCELLED;
  }
  public isCompleted(): boolean {
    return this._status === AppointmentStatus.COMPLETED;
  }
  public isNoShow(): boolean {
    return this._status === AppointmentStatus.NOSHOW;
  }
  public isInThePast(): boolean {
    return this._endTime < new Date();
  }
  public canBeRescheduled(): boolean {
    return ![
      AppointmentStatus.CANCELLED,
      AppointmentStatus.COMPLETED,
      AppointmentStatus.NOSHOW,
    ].includes(this._status);
  }

  // Repository'nin save() metodunu besleyen dönüşüm
  public toPersistence(): IAppointment {
    return {
      id: this._id,
      patientName: this._patientName,
      status: this._status,
      startTime: this._startTime,
      endTime: this._endTime,
      updatedAt: new Date(),
      // ... diğer field'lar
    };
  }

  private canBeCancelled(): boolean {
    return ![
      AppointmentStatus.CANCELLED,
      AppointmentStatus.COMPLETED,
      AppointmentStatus.NOSHOW,
    ].includes(this._status);
  }
}
```

---

**Domain Entity Persistence — KURAL: Tekli vs. Toplu İşlem**:

| Senaryo                 | Yaklaşım                                                 |
| ----------------------- | -------------------------------------------------------- |
| Tekli state değişikliği | `entity.domainMethod()` → `repo.save(entity)`            |
| Toplu işlem (bulk)      | `repo.updateMany(...)` veya `repo.softDeleteAllByX(...)` |

**Tekli işlemler** her zaman entity üzerinden yapılır. Domain metodu hem invariant'ı korur hem ilgili event'i raise eder. `save()` entity'nin o anki tüm halini yazar — hangi alan değiştiğinden bağımsız tek bir metod yeterlidir.

**Toplu işlemlerde** entity pattern N+1 soruna yol açar. "Her entity için ayrı domain event/validation gerekiyor mu?" sorusu sorulur; genellikle cevap hayırdır — bu durumda doğrudan `updateMany` / `deleteMany` kullanılır ve domain bypass açıkça kabul edilir.

```typescript
// ✓ Tekli — entity pattern
const provider = await this.providerQueryRepo.findById(id);
provider.activate();
await this.providerCommandRepo.save(provider);

// ✓ Toplu — doğrudan DB (N+1 önlenir, domain bypass kabul edilir)
await this.providerCommandRepo.softDeleteAllByClinicId(clinicId);
```

---

**Command Repository API — KURAL: `save` / `saveMany` önceliği**:

`*CommandRepository` interface'i mümkün olduğunca yalnızca `save` ve `saveMany` metodlarını açar. Her ikisi de `upsert` tabanlıdır; böylece ayrı `create` / `update` dalları gerekmez.

```typescript
// ✓ İdeal command repository interface
export interface IFooCommandRepository {
  save(entity: Foo): Promise<Foo>;
  saveMany(entities: Foo[]): Promise<void>;
}
```

**`save` implementasyonu** — upsert + flushEvents:
```typescript
async save(entity: FooEntity): Promise<FooEntity> {
  const data = entity.toPersistence();
  const raw = await this.db.foo.upsert({
    where: { id: data.id },
    create: data,
    update: data,
  });
  entity.flushEvents();
  return new FooEntity(raw);
}
```

**`saveMany` implementasyonu** — ALS tx farkındalığı:
```typescript
async saveMany(entities: FooEntity[]): Promise<void> {
  const queries = entities.map((e) => {
    const data = e.toPersistence();
    return this.db.foo.upsert({ where: { id: data.id }, create: data, update: data });
  });
  // ALS transaction varsa Promise.all (iç içe tx açılmaz), yoksa $transaction ile atomik
  if (txStorage.getStore()?.tx) {
    await Promise.all(queries);
  } else {
    await this.prisma.$transaction(queries);
  }
  entities.forEach((e) => e.flushEvents());
}
```

**İzin verilen istisnalar** — yalnızca şu üç durumda ekstra metod eklenebilir:

| İstisna | Örnek | Neden |
|---|---|---|
| İlk kayıt oluştururken M2M / nested create gerekiyor | `create(props)` — `role.connect`, `managedClinics.connect`, `providerProfile.create` | `toPersistence()` scalar dönüştürür; ilişki bağlantıları `upsert` ile kurulamaz |
| Bulk işlem | `softDeleteAllByOrganizationId(orgId)` | Entity pattern N+1 yaratır; domain bypass kabul edilir |
| Hot-path scalar güncelleme | `updateLastLogin(userId)` | Entity yükleme (ekstra sorgu) kabul edilemez overhead oluşturuyor |

```typescript
// ❌ Yanlış — save varken ayrı update metodu eklemek
update(id: string, data: Partial<Foo>): Promise<Foo>; // state değişikliği için fazlalık

// ✓ Doğru — state değişikliği entity üzerinden, ardından save
const foo = await this.fooQueryRepo.findById(id);
foo.activate(); // domain method
await this.fooCommandRepo.save(foo);
```

**AggregateRoot — KURAL**:

Tüm domain entity'ler `src/common/domain/aggregate-root.ts` içindeki `AggregateRoot` abstract class'ını extend eder. Bu class şu API'yi sağlar:

- `protected addDomainEvent(event: BaseEvent)` — entity domain metodundan çağrılır
- `flushEvents()` — repository `save()` sonrası çağrılır; birikmiş event'leri ALS store'a push eder ve temizler

```typescript
// Entity domain metodu — event raise eder
public activate(): void {
  this._isActive = true;
  this.addDomainEvent(new ProviderActivatedEvent({ providerId: this._id, ... }));
}

// Command repository save() — persist + flush
async save(entity: Provider): Promise<Provider> {
  const raw = await this.db.provider.update({ where: { id: entity.id }, data: entity.toPersistence() });
  entity.flushEvents();
  return new Provider(raw);
}

// Handler — sadece orchestrate eder, event bilmez
const provider = await this.providerQueryRepo.findById(id);
provider.activate();
await this.providerCommandRepo.save(provider); // flush otomatik
```

Handler asla `addDomainEvent()` veya `contextService.addEvent()` çağırmaz. Event raise etme sorumluluğu entity domain metoduna aittir.

---

**3. Specification Pattern — KURAL**:

Repository'lerde `findMany` / `findOne` çağrılarında filtre koşulları **Specification** nesneleri ile ifade edilir; ham Prisma `where` objeleri handler'a sızmaz.

**Klasör yapısı**:

```
src/
├── domain/
│   └── shared/
│       └── specification.interface.ts        # Saf domain interface'i
│
└── infrastructure/
    └── persistence/
        └── prisma/
            └── specifications/
                ├── user/
                │   ├── user-by-email.spec.ts
                │   └── user-by-clinic.spec.ts
                └── shared/
                    ├── and.spec.ts
                    └── or.spec.ts
```

**`specification.interface.ts`** (domain — Prisma'ya bağımlı değil):

```typescript
export interface Specification<TQuery> {
  toQuery(): TQuery;
}
```

**Somut spec'ler** (`infrastructure/persistence/prisma/specifications/`):

```typescript
// user-by-email.spec.ts
import { Prisma } from '@prisma/client';
import { Specification } from '@src/domain/shared/specification.interface';

export class UserByEmailSpec implements Specification<Prisma.UserWhereInput> {
  constructor(private readonly email: string) {}
  toQuery(): Prisma.UserWhereInput {
    return { email: this.email };
  }
}

// user-by-clinic.spec.ts
export class UserByClinicSpec implements Specification<Prisma.UserWhereInput> {
  constructor(private readonly clinicId: string) {}
  toQuery(): Prisma.UserWhereInput {
    return { clinicId: this.clinicId };
  }
}
```

**Combinator'lar** (`specifications/shared/`):

```typescript
// and.spec.ts
export class AndSpec<TQuery extends object> implements Specification<TQuery> {
  constructor(private readonly specs: Specification<TQuery>[]) {}
  toQuery(): TQuery {
    return { AND: this.specs.map((s) => s.toQuery()) } as TQuery;
  }
}

// or.spec.ts
export class OrSpec<TQuery extends object> implements Specification<TQuery> {
  constructor(private readonly specs: Specification<TQuery>[]) {}
  toQuery(): TQuery {
    return { OR: this.specs.map((s) => s.toQuery()) } as TQuery;
  }
}
```

**Handler'da kullanım**:

```typescript
const spec = new AndSpec([
  new UserByClinicSpec(clinicId),
  new OrSpec([new UserByEmailSpec(email), new UserByRoleSpec(roleId)]),
]);

const users = await this.userRepo.findMany(spec);
```

**Repository'de kullanım**:

```typescript
findMany(spec: Specification<Prisma.UserWhereInput>) {
  return this.db.user.findMany({ where: spec.toQuery() });
}
```

**4. Policy-Based Authorization**:

- Uses `PolicyFactory` to create policies based on `ActorContext`
- Policies provide filtering and access control
- Example: `policy.getOrganizationFilter(organizationId)`

**4. Event-Driven Architecture — Hibrit Model**:

Sistem iki kanallı çalışır. Kanal seçimi **handler**'da `TransactionManager` metodu seçilerek yapılır:

| Kanal               | Metot                            | Ne zaman                                                                 |
| ------------------- | -------------------------------- | ------------------------------------------------------------------------ |
| **In-memory**       | `TransactionManager.run()`       | Audit log, bildirim gibi kritik olmayan event'ler                        |
| **Outbox (atomik)** | `TransactionManager.outboxRun()` | Finansal kayıt, hard delete gibi veri bütünlüğü gereken kritik event'ler |

**Akış:**

1. Handler → `contextService.addEvent(new XEvent(payload))` ile event'i ALS context'ine ekler
2. `run()` bitiminde: event'ler `EventBus.publish()` ile in-memory yayınlanır
3. `outboxRun()` bitiminde: event'ler **aynı Prisma transaction içinde** `Outbox` tablosuna `createMany` ile yazılır

**Metadata otomasyonu**: `correlationId`, `eventId`, `occurredAt` hiçbir zaman manuel set edilmez. `ContextService.addEvent()` ve `AggregateRoot.addDomainEvent()` bu alanları ALS (`txStorage`) üzerinden otomatik doldurur; `BaseEvent` constructor'ından gelen `metadata` mevcutsa o önceliklidir.

- Domain events in `domain/events/` (e.g., `ClinicSoftDeletedEvent`)
- Event publishers in `infrastructure/events/` (e.g., `clinic-event-publisher.service.ts`)
- Event listeners in `infrastructure/events/listeners/` handle side effects
- Uses `@nestjs/event-emitter` with `@OnEvent()` decorator
- Outbox schema: `src/infrastructure/persistence/prisma/schema/outbox.prisma`

**Audit Loglama — KURAL**: Loglar handler içinde yazılmaz. Her zaman aşağıdaki 3 adımlı akış izlenir:

**Adım 1 — Event sınıfı:** `modulename/domain/events/` altında oluşturulur.

```typescript
// clinic/domain/events/clinic-created.event.ts

import { CLINIC_EVENTS } from '@common/constants/events';

export interface ClinicCreatedEventPayload extends IAuditLog {
  readonly clinicId: string;
  readonly organizationId?: string;
}

export class ClinicCreatedEvent extends BaseEvent {
  static readonly NAME = CLINIC_EVENTS.CREATED;

  public readonly clinicId: string;
  public readonly organizationId?: string;

  constructor(payload: ClinicCreatedEventPayload) {
    super({
      source: payload.source,
      action: payload.action,
      details: payload.details,
      actorId: payload.actorId,
      type: payload.type,
    });
    this.clinicId = payload.clinicId;
    this.organizationId = payload.organizationId;
  }
}
```

**Adım 2 — Publisher methodu:** `modulename/infrastructure/events/` altında `contextService.addEvent()` ile publish edilir.

```typescript
// clinic/infrastructure/events/clinic-event-publisher.service
clinicCreated(payload: ClinicCreatedEventPayload) {
  this.contextService.addEvent(new ClinicCreatedEvent(payload));
}
```

**Adım 3 — Listener:** `modulename/infrastructure/events/listeners/` altında `@OnEvent()` ile dinlenir ve `AuditLogService` ile loglanır.

```typescript
// user/infrastructure/events/listeners/create.user.listener.ts
@Injectable()
export class CreateClinicListener {
  private readonly logger = new Logger(CreateClinicListener.name);
  constructor(private readonly auditLogService: AuditLogService) {}

  @OnEvent(CreateUserEvent.NAME, { async: true })
  async handle(event: CreateUserEvent) {
     const {
      actorEmail,
      log,
      metadata: { eventId, correlationId },
    } = event;

     try {
      if (log) {
        const { action, details, source, actorId, type } = log;

        const auditLogInput = {
          action,
          source,
          details,
          metadata: { eventId, correlationId },
          actorId,
        };

        if (type === LogType.SECURITY) {
          await this.auditLogService.security(auditLogInput);
          return;
        }
        } // şeklinde
  }
}
```

**Outbox Pattern — KURAL**:

**KURAL 1 — Repository izolasyonu**: `*CommandRepository` ve `*QueryRepository` sınıfları asla `Outbox` tablosuna erişemez, event fırlatamaz. Sadece kendi modelleriyle ilgili ham DB operasyonu yapar.

**KURAL 2 — Her command handler `TransactionManager` kullanır**: Tüm command handler'lar DB yazma işlemlerini ve event publishing'i `TransactionManager.run()` veya `TransactionManager.outboxRun()` içinde yapar. `TransactionManager` olmadan çağrılan `contextService.addEvent()` / `eventPublisher.*()` çağrıları event'leri ALS'e ekler ama hiç yayınlanmaz — bu sessiz bir bug'dır.

- Kritik olmayan event'ler (audit log, bildirim): `TransactionManager.run()`
- Atomik garanti gereken event'ler (finansal kayıt, hard delete): `TransactionManager.outboxRun()`

`TransactionManager`, `PrismaModule` tarafından `@Global()` olarak sağlanır — ek modül importu gerekmez, handler constructor'ına direkt inject edilir.

```typescript
// ❌ Yanlış — TransactionManager yok, event yayınlanmaz
async execute(command: CreateLeadCommand): Promise<string> {
  const lead = await this.leadCommandRepo.create(props);
  this.eventPublisher.leadCreated({ ... }); // event kaybolur
  return lead.id;
}

// ✓ Doğru
async execute(command: CreateLeadCommand): Promise<string> {
  return this.txManager.run(async () => {
    const lead = await this.leadCommandRepo.create(props);
    this.eventPublisher.leadCreated({ ... });
    return lead.id;
  });
}
```

**KURAL 2b — Kritik event'ler için `outboxRun()`**: Atomik garantisi gereken event'lerde (finansal kayıt, hard delete, vb.) handler'da `TransactionManager.outboxRun()` kullanılır. Kritik olmayan event'lerde `TransactionManager.run()` yeterlidir.

```typescript
// ❌ Yanlış — kritik bir işlemde run() kullanmak
async execute(command: ForceDeleteCommand) {
  await this.txManager.run(async () => { ... });
}

// ✓ Doğru — kritik işlemde outboxRun() kullanmak
async execute(command: ForceDeleteCommand) {
  await this.txManager.outboxRun(async () => { ... });
}
```

**KURAL 3 — Metadata otomasyonu**: `correlationId`, `eventId`, `occurredAt`, `version` alanları hiçbir zaman handler veya entity içinde manuel set edilmez. Bu alanlar `ContextService.addEvent()` ve `AggregateRoot.addDomainEvent()` tarafından ALS (`txStorage`) üzerinden otomatik doldurulur.

```typescript
// ❌ Yanlış — metadata elle set ediliyor
contextService.addEvent(
  new XEvent({ ...payload, correlationId: 'abc', eventId: uuid() })
);

// ✓ Doğru — sadece domain payload geçiliyor, metadata otomatik eklenir
contextService.addEvent(new XEvent(payload));
```

**5. GetContext Pattern**:

- Extracted via `@GetContext()` decorator in controllers
- Containst actor: ActorContext, source (Exection source) etc
- actor Contains `userId`, `organizationId`, `clinicId`, `managedClinics`, `source`, `capabilities`, `roleId`
- Passed inside commands/queries for authorization and audit

**6. Cross-Module Communication (Modüller Arası İletişim) — KURAL**:

- **Hiçbir modül diğer modülün repository'sine veya handler'ına direkt erişemez.**
- Modüller yalnızca `CommandBus` ve `QueryBus` üzerinden haberleşir.
- Hedef modülün query/command sınıfı import edilir; handler veya repo inject edilmez.
- `module.api.ts` / `module.api.interface.ts` pattern'i **kullanılmaz**. Modüller kendi query/command sınıflarını dışarıya açar.

**Akış**:

1. Hedef modülde işi yapacak bir query/command handler oluşturulur (örn. `FindPatientByIdQuery` + `FindPatientByIdHandler`)
2. Handler, hedef modülün `query.module.ts` / `command.module.ts`'ine kayıt edilir
3. Kaynak modülün handler'ı hedef modülün query/command sınıfını import edip bus üzerinden dispatch eder

**Örnek**:

```typescript
// ❌ Yanlış — direkt repo veya handler inject etmek
@CommandHandler(BookAppointmentCommand)
export class BookAppointmentHandler implements ICommandHandler<BookAppointmentCommand> {
  constructor(
    private patientRepository: PatientRepository, // ❌ Başka modülün repo'su
    private appointmentRepository: AppointmentRepository
  ) {}
}

// ✓ Doğru — PatientModule'de query handler oluştur
// crm/patient/application/queries/find-patient-by-id/find-patient-by-id.handler.ts
@QueryHandler(FindPatientByIdQuery)
export class FindPatientByIdHandler implements IQueryHandler<FindPatientByIdQuery> {
  constructor(
    @Inject(PATIENT_QUERY_REPOSITORY)
    private readonly patientQueryRepo: IPatientQueryRepository
  ) {}
  execute(query: FindPatientByIdQuery) { ... }
}

// crm/patient/application/queries/query.module.ts
@Module({
  imports: [CqrsModule, PatientRepositoryModule],
  providers: [FindPatientByIdHandler, ...],
  exports: [FindPatientByIdHandler, ...],
})
export class PatientQueryModule {}

// clinical/appointment/application/commands/book-appointment/book-appointment.handler.ts
// FindPatientByIdQuery sınıfını doğrudan import et; sadece QueryBus inject et
@CommandHandler(BookAppointmentCommand)
export class BookAppointmentHandler implements ICommandHandler<BookAppointmentCommand> {
  constructor(
    private readonly queryBus: QueryBus, // ✓ QueryBus üzerinden dispatch
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentCommandRepo: IAppointmentCommandRepository
  ) {}

  async execute(command: BookAppointmentCommand) {
    const patient = await this.queryBus.execute(
      new FindPatientByIdQuery(command.patientId, command.context)
    );
    // ...
  }
}
```

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

### CQRS Implementation Pattern

**Example: `create-clinic.command.ts`**

```typescript
// src/modules/organization/clinic/application/commands/create-clinic/create-clinic.command.ts
import { CreateClinicDto } from '@shared/modules/clinic/dto/commands';
import { ExecutionContext } from '@src/domain/common/execution/execution-context';

export class CreateClinicCommand {
  constructor(
    public readonly dto: CreateClinicDto,
    public readonly ctx: ExecutionContext
  ) {}
}
```

**Example: `create-clinic.handler.ts`**

```typescript
// src/modules/organization/clinic/application/commands/create-clinic/create-clinic.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateClinicCommand } from './create-clinic.command';
import type { CreateClinicResponse } from './create-clinic.response';

@CommandHandler(CreateClinicCommand)
export class CreateClinicHandler implements ICommandHandler<
  CreateClinicCommand,
  CreateClinicResponse
> {
  constructor(private readonly clinicRepository: ClinicRepository) {}

  async execute(command: CreateClinicCommand): Promise<CreateClinicResponse> {
    const { dto } = command;
    const clinic = await this.clinicRepository.create(dto);
    return {
      id: clinic.id,
      name: clinic.name,
      organizationId: clinic.organizationId,
    };
  }
}
```

**Example: `create-clinic.response.ts`**

```typescript
// src/modules/organization/clinic/application/commands/create-clinic/create-clinic.response.ts
export interface CreateClinicResponse {
  id: string;
  name: string;
  organizationId: string;
}
```

**Example: `command.module.ts`**

```typescript
// src/modules/organization/clinic/application/commands/command.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateClinicHandler } from './create-clinic/create-clinic.handler';
import { ClinicRepositoryModule } from '../../infrastructure/persistence/prisma/clinic-repository.module';

export const CLINIC_COMMAND_HANDLERS = [CreateClinicHandler];

@Module({
  imports: [CqrsModule, ClinicRepositoryModule],
  providers: CLINIC_COMMAND_HANDLERS,
  exports: CLINIC_COMMAND_HANDLERS,
})
export class ClinicCommandModule {}
```

### Coding Conventions

**Tarih/Zaman İşlemleri — KURAL**:

- Tarih ve zaman ile ilgili tüm işlemlerde **`dayjs`** kullanılır; native `Date` metotları (`getHours`, `setMinutes`, vb.) doğrudan kullanılmaz.
- Tüm dayjs yardımcı metodları **`DateTimeManager`** sınıfı içinde static metot olarak tanımlanır (`src/common/utils/date-time.manager.ts`).
- Yeni bir tarih/zaman operasyonuna ihtiyaç duyulduğunda önce `DateTimeManager`'a metot eklenir, ardından kullanılır.

```typescript
// ❌ Yanlış — native Date veya inline dayjs kullanımı
const end = new Date(start.getTime() + 30 * 60 * 1000);
const minutes = dayjs(date).hour() * 60 + dayjs(date).minute();

// ✓ Doğru — DateTimeManager üzerinden
const end = DateTimeManager.addMinutes(start, 30);
const minutes = DateTimeManager.getDayMinutes(date);
```

---

**Repository `findMany` kuralı**:

- Repository'de çok satır döndüren her sorgu **`paginate` helper'ı** ile yazılır; `this.db.*.findMany(...)` doğrudan
  kullanılmaz.
- `paginate`, `{ items, total }` döndürür ve tutarlı sayfalama + sıralama sağlar.
- Helper: `src/infrastructure/persistence/prisma/paginate.helper.ts`

```typescript
// ❌ Yanlış
findAll(clinicId
:
string
)
{
    return this.db.appointment.findMany({where: {clinicId}});
}

// ✓ Doğru
findAll(clinicId
:
string, pagination
:
Pagination
)
{
    return paginate({
        delegate: this.db.appointment,
        pagination,
        where: {clinicId, isDeleted: false},
    });
}
```

---

**Repository `find*` dönüş tipi — KURAL**:

- Tüm `find*` metodları ham Prisma kaydı değil, **domain entity** döndürür.
- Mapping (Prisma kaydı → entity) repository içinde yapılır; handler veya use-case'e sızmaz.
- `findMany` / `paginate` tabanlı sorgular `{ items: Entity[], total: number }` döndürür; `items` elemanları da entity olur.
- `select` / `include` ile daraltılmış projeksiyonlar (ör. `ConflictingAppointment`, `OccupiedSlot`) entity olmak zorunda değildir; ancak bunlar **domain type** (`domain/types/*.type.ts`) olarak tanımlanır ve interface'de açıkça belirtilir.

```typescript
// ❌ Yanlış — ham Prisma kaydı dönüyor
async findById(id: string) {
  return this.db.appointment.findUnique({ where: { id } });
}

// ✓ Doğru — domain entity dönüyor
async findById(id: string): Promise<Appointment | null> {
  const raw = await this.db.appointment.findUnique({ where: { id } });
  return raw ? new Appointment(raw) : null;
}

// ✓ Doğru — findMany: entity listesi dönüyor
async findMany(spec: Specification<Prisma.AppointmentWhereInput>, pagination: Pagination) {
  const result = await paginate({ delegate: this.db.appointment, pagination, where: spec.toQuery() });
  return { items: result.items.map((r) => new Appointment(r)), total: result.total };
}

// ✓ Doğru — projeksiyon: domain type dönüyor (entity değil, kabul edilebilir)
findConflictingAppointment(props: FindConflictingAppointmentProps): Promise<ConflictingAppointment | null> {
  return this.db.appointment.findFirst({ where: { ... }, select: { id: true, startTime: true, endTime: true } });
}
```

---

**Parametre sayısı kuralı**:

- Bir fonksiyon veya metoda **2'den fazla parametre** geçilecekse mutlaka **obje** olarak geçilir.
- Bu kural use case `execute`, private method, repository metodu dahil tüm fonksiyonlar için geçerlidir.
- **2 veya daha az parametre** varsa tip tanımı doğrudan fonksiyon imzasında yapılır.
- **Obje parametre kullanıldığında** tip tanımı (`interface` veya `type`) mutlaka **dışarıda** tanımlanır; inline
  `}: { ... }` yazılmaz.

```typescript
// ❌ Yanlış — çok sayıda düz parametre
resolvePatient(patientId, name, phone, email)

// ❌ Yanlış — obje parametre ama tip inline
resolvePatient({patientId, dtoPatientName}
:
{
    patientId ? : string;
    dtoPatientName ? : string
}
)

// ✓ Doğru — obje geçiliyor, tip dışarıda tanımlı
interface ResolvePatientInput {
    patientId?: string;
    dtoPatientName?: string;
    dtoPatientPhone?: string;
    dtoPatientEmail?: string;
}

resolvePatient({patientId, dtoPatientName, dtoPatientPhone, dtoPatientEmail}
:
ResolvePatientInput
)
```

---

### Common Patterns

**Controllers**:

- Use `@UseGuards(AuthGuard)` for protected routes
- Extract context with `@GetContext() context: IGetContext`
- Dispatch commands via `CommandBus.execute()` and queries via `QueryBus.execute()` — inject no handlers directly
- Keep thin — no business logic, only HTTP mapping and bus dispatch

**Creating New Modules**:

1. Follow the CQRS module structure above
2. Create `command.module.ts` registering all command handlers; create `query.module.ts` for query handlers
3. Import both in the main module alongside `CqrsModule`
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

- Events are published after successful database operations or after security problems for logging
- Listeners handle side effects (audit logging, notifications, cascading deletes)

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

The application supports multiple sectors: `ALL`, `DENTAL`, `HAIR_TRANSPLANT`, `AESTHETICS`. Entities like Clinic,
Provider, and treatments are sector-specific.

### Firebase Integration

Firebase Admin SDK is used for authentication. Configuration file should be at `firebase-sdk.json` (excluded from git).

## DTO, Schema, Types

The shared package (`packages/shared`) serves as the **Single Source of Truth** for validation, types, and DTOs. It ensures
synchronization between the Backend (NestJS) and Frontend (Next.js/React).

### Folder Structure — KURAL

For each module in `packages/shared/modules/{moduleName}/`, organize schemas, types, and DTOs by **commands and queries**:

```
modules/{moduleName}/
  schemas/
    commands/
      create-{entity}.schema.ts
      update-{entity}.schema.ts
      delete-{entity}.schema.ts
      index.ts                    # Barrel export
    queries/
      find-{entity}.schema.ts
      index.ts
    index.ts                       # Barrel export for all schemas
  types/
    commands/
      create-{entity}.type.ts
      update-{entity}.type.ts
      delete-{entity}.type.ts
      index.ts                    # Barrel export
    queries/
      find-{entity}.type.ts
      index.ts
    index.ts                       # Barrel export for all types
  dto/
    commands/
      create-{entity}.dto.ts
      update-{entity}.dto.ts
      delete-{entity}.dto.ts
      index.ts                    # Barrel export
    queries/
      find-{entity}.dto.ts
      index.ts
    index.ts                       # Barrel export for all DTOs
  interfaces/
    {entity}-response.interface.ts # API response contracts
    index.ts
```

**Example: User Module Structure**

```
modules/user/
  schemas/
    commands/
      create-user.schema.ts
      change-user-password.schema.ts
      update-user-by-actor.schema.ts
      send-user-password-reset-by-actor.schema.ts
      index.ts
    queries/
      check-email.schema.ts
      index.ts
    index.ts
  types/
    commands/
      create-user.type.ts
      change-user-password.type.ts
      update-user-by-actor.type.ts
      send-user-password-reset-by-actor.type.ts
      index.ts
    queries/
      check-email.type.ts
      index.ts
    index.ts
  dto/
    commands/
      create-user.dto.ts
      change-user-password.dto.ts
      update-user-by-actor.dto.ts
      send-user-password-reset-by-actor.dto.ts
      index.ts
    queries/
      check-email.dto.ts
      index.ts
    index.ts
  interfaces/
    user-response.interface.ts
    index.ts
```

### Implementation Pattern

**1. Schema (schemas/commands/create-appointment.schema.ts)**

Avoid importing directly from `@prisma/client` to prevent frontend crashes.

```typescript
import { z } from 'zod';

export const CreateAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  providerId: z.string().uuid(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']).default('PENDING'),
});
```

**2. Type (types/commands/create-appointment.type.ts)**

Never write types manually; always infer from schema:

```typescript
import { z } from 'zod';
import { CreateAppointmentSchema } from '../../schemas/commands';

export type CreateAppointment = z.infer<typeof CreateAppointmentSchema>;
```

**3. DTO (dto/commands/create-appointment.dto.ts)**

Used exclusively by NestJS Backend for `@Body()` or `@Query()` decorators:

```typescript
import { createZodDto } from 'nestjs-zod';
import { CreateAppointmentSchema } from '../../schemas/commands';

export class CreateAppointmentDto extends createZodDto(
  CreateAppointmentSchema
) {}
```

**4. Response Interface (interfaces/appointment-response.interface.ts)**

Lightweight definitions for Frontend consumption:

```typescript
import { CreateAppointment } from '../types/commands';

export interface AppointmentResponse {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
  patientName: string;
  providerName: string;
}
```

### Barrel Exports (index.ts) — KURAL

Every folder must have an `index.ts` to allow clean imports:

```typescript
// modules/user/types/commands/index.ts
export type { CreateUser } from './create-user.type';
export type { ChangeUserPassword } from './change-user-password.type';
export type { UpdateUserByActor } from './update-user-by-actor.type';

// modules/user/types/queries/index.ts
export type { CheckEmail } from './check-email.type';

// modules/user/types/index.ts
export * from './commands';
export * from './queries';

// modules/user/index.ts (main entry point)
export * from './schemas';
export * from './types';
export * from './dto';
export * from './interfaces';
```

### Usage Examples

**Backend (NestJS)**:

```typescript
import { CreateUserDto } from '@shared/modules/user/dto/commands';
import type { CreateUser } from '@shared/modules/user/types/commands';
```

**Frontend (React)**:

```typescript
import type { UserResponse } from '@shared/modules/user/interfaces';
```

### Important Considerations

**1. Prisma Enum Conflict**

- Frontend cannot import from `@prisma/client`
- Solution: Define enums in shared package as Zod Enum
- Backend Prisma will auto-map string values

**2. Build Artifacts**

- Add `*.js`, `*.js.map`, `*.d.ts` to `.gitignore` (except `node_modules`)
- Generate build artifacts only during deployment

**3. No Frontend Dependencies**

- Never import NestJS-specific packages (decorators, guards, etc.) in shared schemas
- Keep shared package framework-agnostic

## Cross-Module Data & Relationship Rules

### 1. Modüller Arası Veri Paylaşımı ve Sorgu Sınırları (Bounded Context)

**Kural:** Hiçbir modül, veritabanı düzeyinde (Prisma `include`/join vb.) başka bir modülün ilişkisel tablolarına sızamaz. Deep nesting (`include: { clinic: { include: { ... } } }`) kesinlikle YASAKTIR.

**Yöntem:** Eğer bir modül (örn: `User`), başka bir modüle ait veriye (örn: `Clinic`) ihtiyaç duyuyorsa, sorgu sonucundan sadece ilkel kimliği (`clinicId`) almalı ve hedef modülden veriyi bağımsız olarak talep etmelidir. TSQueryBus (src/common/cqrs/type-safe-query-bus.ts) kullanabilirsin.

```typescript
// ❌ Yanlış — başka modülün DB ilişkilerine sızmak (Sınır İhlali)
const user = await this.prisma.user.findUnique({
  where: { id: userId },
  include: {
    clinic: {
      include: {
        address: true, // User modülü Clinic ilişkilerini bilmemeli
      },
    },
  },
});

// ✓ Doğru — kendi modülünden ID al, diğer modülü QueryBus ile sorgula
const user = await this.userQueryRepo.findById(userId);
const clinicDetails = await this.queryBus.execute(
  new GetClinicDetailsQuery({ clinicId: user.clinicId })
);
```

#### ✅ Onaylanmış Altyapı İstisnası (Intentional Trade-off)

**Kural:** "Modüller arası veri paylaşımı yasaktır" kuralının **tek ve mutlak istisnası**, Auth Guard katmanında çalışan `findForAuth` (veya benzeri ActorContext inşa eden) merkezi altyapı sorgularıdır.

*   **Gerekçe:** Her HTTP isteğinde tetiklenen Auth Guard'ın performansını korumak ve veritabanı gidiş-dönüş (I/O) maliyetini düşürmek adına, aktörün yetki sınırlarını çizen ilişkisel kimlikler tek bir sorguda `include` edilmelidir.

```typescript
// src/modules/identity/auth/infrastructure/persistence/auth.repository.ts
// Bu sorgu, performans darboğazını engellemek için kasıtlı olarak birleşik yazılmıştır.
async findForAuth(firebaseUid: string) {
  return this.db.user.findFirst({
    where: { id: firebaseUid, status: GlobalStatus.ACTIVE },
    include: {
      managedClinics: { select: { id: true } },     // Sadece ID - Sınır ihlali yapmıyor
      ownedOrganizations: { select: { id: true } }, // Sadece ID - Sınır ihlali yapmıyor
      providerProfile: { select: { id: true } },
      role: {
        include: {
          capabilities: { include: { capability: true } }, // Yetki ağacı tek seferde çözülür
        },
      },
    },
  });
}
```

### 2. ID Yönetimi ve Veritabanı Bağımsızlığı (Pre-Generated IDs)

**Kural:** Çoklu modül barındıran orkestrasyon/Saga işlemlerinde, veritabanının auto-increment veya işlem sonrası ID üretmesi beklenmeyecektir.

**Yöntem:** Gerekli tüm benzersiz kimlikler (UUID), işlemin en tepesinde (Handler katmanında) `crypto.randomUUID()` ile peşinen üretilir ve alt servislerine dikte edilir.

**Kazanç:** Modüller arası bağımlılık zinciri kırılır, `if (!id) throw` kontrolleri elenir, asenkron Outbox loglaması güvenli hale gelir.

```typescript
// ✓ Doğru — ID'leri handler'da üret, servislere ilet
async execute(command: RegisterClinicCommand) {
  const clinicId = randomUUID();
  const adminUserId = randomUUID();

  await this.txManager.outboxRun(async () => {
    await this.clinicCommandRepo.create({ id: clinicId, ... });
    await this.commandBus.execute(
      new CreateUserCommand({ id: adminUserId, clinicId, ... })
    );
  });
}
```
