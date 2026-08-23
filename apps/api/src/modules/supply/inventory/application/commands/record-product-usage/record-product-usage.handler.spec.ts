import { ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RecordProductUsageHandler } from './record-product-usage.handler';
import { RecordProductUsageCommand } from './record-product-usage.command';
import { PolicyFactory } from '@modules/platform/policy/staff/application/policy-factory';
import { ExecutionSources } from '@src/domain/constants/execution-source.constant';
import { ProductNotFoundException } from '@modules/supply/inventory/domain/exceptions/inventory.exceptions';
import { ActorContext } from '@common/interfaces';
import { LogSource } from '@src/domain/constants/log-action.constant';
import type { IGetContext } from '@common/decorators/get-context.decorator';
import type { RecordProductUsageDto } from '@shared/modules/inventory/dto/commands';

/**
 * Tüketim düşümü de `clinics/:clinicId/stock/usage` altında; kiracı sınırı
 * yalnız burada doğrulanır (guard yeteneğe bakar, kiracıya bakmaz).
 */
describe('RecordProductUsageHandler — klinik kapsamı', () => {
  const CLINIC_A = 'clinic-a';
  const ORG_1 = 'org-1';

  const buildActor = (overrides: Partial<ActorContext>): ActorContext => ({
    userId: 'user-1',
    email: 'staff@clinic.com',
    source: LogSource.WEB,
    capabilities: ['stockmovement:create'],
    rolePriority: 50,
    managedClinics: [],
    ownedOrganizations: [],
    ...overrides,
  });

  const run = async (actor: ActorContext, clinicId: string) => {
    const productRepo = {
      findByIdForUpdate: jest.fn().mockResolvedValue(null),
    };
    const txManager = { outboxRun: jest.fn((cb: () => unknown) => cb()) };

    const handler = new RecordProductUsageHandler(
      productRepo as never,
      { findById: jest.fn(), findAvailableByProduct: jest.fn() } as never,
      { resolve: jest.fn().mockResolvedValue(ORG_1) } as never,
      new PolicyFactory(new EventEmitter2()),
      txManager as never
    );

    const ctx: IGetContext = { actor, source: ExecutionSources.USER_ACTION };
    const dto = {
      productId: 'product-1',
      quantity: 1,
    } as RecordProductUsageDto;

    return {
      txManager,
      execute: () =>
        handler.execute(new RecordProductUsageCommand(clinicId, dto, ctx)),
    };
  };

  it('başka kiracının kliniğinden stok düşümü reddedilir — transaction açılmaz', async () => {
    const { execute, txManager } = await run(
      buildActor({ clinicId: CLINIC_A, organizationId: ORG_1 }),
      'other-tenant-clinic'
    );

    await expect(execute()).rejects.toThrow(ForbiddenException);
    expect(txManager.outboxRun).not.toHaveBeenCalled();
  });

  it('kendi kliniğinde düşüm kapıdan geçer', async () => {
    const { execute, txManager } = await run(
      buildActor({ clinicId: CLINIC_A, organizationId: ORG_1 }),
      CLINIC_A
    );

    await expect(execute()).rejects.toThrow(ProductNotFoundException);
    expect(txManager.outboxRun).toHaveBeenCalled();
  });

  it('organizasyon sahibi kendi org’undaki klinikte düşüm yapabilir', async () => {
    const { execute } = await run(
      buildActor({
        clinicId: undefined,
        ownedOrganizations: [{ id: ORG_1 }],
        organizationId: ORG_1,
      }),
      CLINIC_A
    );

    await expect(execute()).rejects.toThrow(ProductNotFoundException);
  });
});
