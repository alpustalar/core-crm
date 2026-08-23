import {
  IProductBatchCommandRepository,
  PRODUCT_BATCH_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product-batch/product-batch.command.repository';
import { BadRequestException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { RecordProductUsageCommand } from './record-product-usage.command';
import { Decimal } from 'decimal.js';
import { ProductNotFoundException } from '@modules/supply/inventory/domain/exceptions/inventory.exceptions';
import {
  IProductCommandRepository,
  PRODUCT_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product/product.command.repository';
import {
  ITenantScopeResolver,
  TENANT_SCOPE_RESOLVER,
} from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@CommandHandler(RecordProductUsageCommand)
export class RecordProductUsageHandler implements ICommandHandler<
  RecordProductUsageCommand,
  void
> {
  constructor(
    @Inject(PRODUCT_COMMAND_REPOSITORY)
    private readonly productRepo: IProductCommandRepository,
    @Inject(PRODUCT_BATCH_COMMAND_REPOSITORY)
    private readonly productBatchRepo: IProductBatchCommandRepository,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: RecordProductUsageCommand): Promise<void> {
    const { clinicId, dto, ctx } = command;
    const { actor } = ctx;

    const quantity = new Decimal(dto.quantity);

    // Kapsam kontrolü: `CapabilityGuard` yalnız yeteneğe bakar (stockmovement:create),
    // kiracıya bakmaz — `clinicId` URL'den geldiği için başka bir kiracının stoğu
    // bu uçtan düşülebilirdi. İşlem izni yetenekte, kiracı sınırı burada.
    const organizationId = await this.tenantScopeResolver.resolve({ clinicId });

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check((p) =>
        p.actorCanAccessClinicOrOwnsOrganization(clinicId, organizationId)
      )
      .orThrow('inventory.stock.usage');

    // Ürün satırı FOR UPDATE ile kilitlenir, partiler kilit altında okunup düşülür:
    // aksi halde aynı ürüne eşzamanlı iki kullanım aynı parti bakiyesini okuyup
    // ayrı ayrı düşer → lost update (stok olduğundan fazla görünür).
    //
    // outboxRun: stok hareketi kaydı düşümün defteridir; olay kaybolursa bakiye
    // düşer ama izi kalmaz. Olay, miktarla aynı transaction'da outbox'a mühürlenir.
    await this.txManager.outboxRun(async () => {
      const product = await this.productRepo.findByIdForUpdate(dto.productId);
      if (!product) throw new ProductNotFoundException();

      let batch = dto.batchId
        ? await this.productBatchRepo.findById(dto.batchId)
        : null;

      if (!batch) {
        const available = await this.productBatchRepo.findAvailableByProduct(
          product.id.value,
          clinicId
        );
        batch = available[0] ?? null;
      }

      if (!batch) {
        throw new BadRequestException('Kullanılabilir stok bulunamadı.');
      }

      batch.deductQuantity({
        qty: quantity,
        performedById: actor.userId,
        notes: dto.notes,
      });

      // Hareket kaydı yan etkidir: batch yazılırken olay boşalır, dinleyici yazar.
      await this.productBatchRepo.update(batch);
    });
  }
}
