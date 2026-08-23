import { ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReceiveStockHandler } from './receive-stock.handler';
import { ReceiveStockCommand } from './receive-stock.command';
import { PolicyFactory } from '@modules/platform/policy/staff/application/policy-factory';
import { ExecutionSources } from '@src/domain/constants/execution-source.constant';
import { ProductNotFoundException } from '@modules/supply/inventory/domain/exceptions/inventory.exceptions';
import { ActorContext } from '@common/interfaces';
import { LogSource } from '@src/domain/constants/log-action.constant';
import type { IGetContext } from '@common/decorators/get-context.decorator';
import type { ReceiveStockDto } from '@shared/modules/inventory/dto/commands';

/**
 * `clinicId` URL parametresinden gelir; `CapabilityGuard` yalnız aktörde
 * `stockmovement:create` var mı diye bakar, hangi kiracının kliniği olduğuna
 * bakmaz. Kiracı sınırı bu yüzden handler'da doğrulanır.
 */
describe('ReceiveStockHandler — klinik kapsamı', () => {
  const CLINIC_A = 'clinic-a';
  const CLINIC_B = 'clinic-b';
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
    const productRepo = { findById: jest.fn().mockResolvedValue(null) };
    const handler = new ReceiveStockHandler(
      productRepo as never,
      { create: jest.fn() } as never,
      { create: jest.fn() } as never,
      { resolve: jest.fn().mockResolvedValue(ORG_1) } as never,
      new PolicyFactory(new EventEmitter2()),
      { run: jest.fn((cb: () => unknown) => cb()) } as never
    );

    const ctx: IGetContext = { actor, source: ExecutionSources.USER_ACTION };
    const dto = { productId: 'product-1', quantity: 1 } as ReceiveStockDto;

    return {
      productRepo,
      execute: () =>
        handler.execute(new ReceiveStockCommand(clinicId, dto, ctx)),
    };
  };

  it('başka kiracının kliniğine mal kabulü reddedilir — ürüne bile bakılmaz', async () => {
    const { execute, productRepo } = await run(
      buildActor({ clinicId: CLINIC_A, organizationId: ORG_1 }),
      'other-tenant-clinic'
    );

    await expect(execute()).rejects.toThrow(ForbiddenException);
    expect(productRepo.findById).not.toHaveBeenCalled();
  });

  it('aynı organizasyondaki KARDEŞ kliniğe yazma da reddedilir', async () => {
    // Org üyeliği tek başına yetmez; yoksa çok klinikli organizasyonda klinik
    // yalıtımı tamamen kalkardı.
    const { execute } = await run(
      buildActor({ clinicId: CLINIC_B, organizationId: ORG_1 }),
      CLINIC_A
    );

    await expect(execute()).rejects.toThrow(ForbiddenException);
  });

  it('kendi kliniğine mal kabulü kapıdan geçer', async () => {
    const { execute, productRepo } = await run(
      buildActor({ clinicId: CLINIC_A, organizationId: ORG_1 }),
      CLINIC_A
    );

    // Kapıyı geçtiğinin kanıtı: akış ürün aramaya kadar ilerledi.
    await expect(execute()).rejects.toThrow(ProductNotFoundException);
    expect(productRepo.findById).toHaveBeenCalledWith('product-1');
  });

  it('organizasyon sahibi, yönetmediği ama sahibi olduğu kliniğe yazabilir', async () => {
    // (b) seçeneğinin tam olarak çözdüğü durum: `create-clinic` yeni kliniği
    // sahibin managedClinics'ine bağlamaz, sahiplik org seviyesinde kalır.
    const { execute } = await run(
      buildActor({
        clinicId: undefined,
        managedClinics: [],
        ownedOrganizations: [{ id: ORG_1 }],
        organizationId: ORG_1,
      }),
      CLINIC_A
    );

    await expect(execute()).rejects.toThrow(ProductNotFoundException);
  });

  it('başka organizasyonun sahibi bu kliniğe yazamaz', async () => {
    const { execute } = await run(
      buildActor({
        clinicId: undefined,
        ownedOrganizations: [{ id: 'org-2' }],
        organizationId: 'org-2',
      }),
      CLINIC_A
    );

    await expect(execute()).rejects.toThrow(ForbiddenException);
  });
});
