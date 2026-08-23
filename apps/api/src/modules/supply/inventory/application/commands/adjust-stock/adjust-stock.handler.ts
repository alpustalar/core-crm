import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AdjustStockCommand } from './adjust-stock.command';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { ProductNotFoundException } from '@modules/supply/inventory/domain/exceptions/inventory.exceptions';
import { INVENTORY_EVENTS } from '@src/domain/constants/events';
import {
  IProductCommandRepository,
  PRODUCT_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product/product.command.repository';
import {
  IProductBatchCommandRepository,
  PRODUCT_BATCH_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product-batch/product-batch.command.repository';

@CommandHandler(AdjustStockCommand)
export class AdjustStockHandler implements ICommandHandler<
  AdjustStockCommand,
  void
> {
  constructor(
    @Inject(PRODUCT_COMMAND_REPOSITORY)
    private readonly productRepo: IProductCommandRepository,
    @Inject(PRODUCT_BATCH_COMMAND_REPOSITORY)
    private readonly productBatchRepo: IProductBatchCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: AdjustStockCommand): Promise<void> {
    const { clinicId, data, ctx } = command.payload;
    const { actor, source } = ctx;

    const product = await this.productRepo.findById(data.productId);
    if (!product) throw new ProductNotFoundException();

    this.policyFactory
      .clinic(actor, source)
      .evaluator.check(
        (p) => p.actorCanManageTargetClinic(product.clinicId.value),
        'Bu klinikte işlem yapma yetkiniz yok.'
      )
      .orThrow(INVENTORY_EVENTS.ADJUST_STOCK);

    // Ürünü FOR UPDATE ile kilitle, sonra batch'leri kilit ALTINDA oku: aynı ürüne
    // eşzamanlı stok değişimlerini serialize eder. Aksi halde iki istek aynı batch
    // quantity'sini okuyup ayrı ayrı düşer → lost update (mevcut bakiyeyi bozar).
    //
    // outboxRun: stok hareketi kaydı miktar değişiminin defteridir; olay kaybolursa
    // bakiye değişir ama izi kalmaz. Bu yüzden olay, miktarla aynı transaction'da
    // outbox'a mühürlenir.
    await this.txManager.outboxRun(async () => {
      const lockedProduct = await this.productRepo.findByIdForUpdate(
        product.id.value
      );
      if (!lockedProduct) throw new ProductNotFoundException();

      const availableBatches =
        await this.productBatchRepo.findAvailableByProduct(
          lockedProduct.id.value,
          clinicId
        );

      const updatedBatch = lockedProduct.handleStockChange({
        quantityDelta: data.quantityDelta,
        clinicId,
        availableBatches,
        explicitBatchId: data.batchId,
        performedById: actor.userId,
        notes: data.notes,
      });

      if (updatedBatch) {
        await this.productBatchRepo.update(updatedBatch);
        return;
      }

      // Parti bulunmayan artışta olayı ürün fırlattı; olaylar yalnız kalıcılaştırma
      // sırasında boşaltıldığı için ürün yazılır (satır zaten kilit altında).
      await this.productRepo.update(lockedProduct);
    });
  }
}
