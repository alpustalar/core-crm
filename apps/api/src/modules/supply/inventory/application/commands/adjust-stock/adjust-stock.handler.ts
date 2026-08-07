import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AdjustStockCommand } from './adjust-stock.command';
import {
  IProductCommandRepository,
  PRODUCT_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product.repository.interface';
import {
  IProductBatchCommandRepository,
  PRODUCT_BATCH_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product-batch.repository.interface';
import {
  IStockMovementCommandRepository,
  STOCK_MOVEMENT_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/stock-movement.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { StockMovement } from '@modules/supply/inventory/domain/entities/stock-movement.entity';
import { ProductNotFoundException } from '@modules/supply/inventory/domain/exceptions/inventory.exceptions';
import { INVENTORY_EVENTS } from '@src/domain/constants/events';

@CommandHandler(AdjustStockCommand)
export class AdjustStockHandler implements ICommandHandler<
  AdjustStockCommand,
  void
> {
  constructor(
    @Inject(PRODUCT_COMMAND_REPOSITORY)
    private readonly productCommandRepo: IProductCommandRepository,
    @Inject(PRODUCT_BATCH_COMMAND_REPOSITORY)
    private readonly productBatchCommandRepo: IProductBatchCommandRepository,
    @Inject(STOCK_MOVEMENT_COMMAND_REPOSITORY)
    private readonly stockMovementCommandRepo: IStockMovementCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: AdjustStockCommand): Promise<void> {
    const { clinicId, data, ctx } = command.payload;
    const { actor, source } = ctx;

    const product = await this.productCommandRepo.findById(data.productId);
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
    await this.txManager.run(async () => {
      const lockedProduct = await this.productCommandRepo.findByIdForUpdate(
        product.id.value
      );
      if (!lockedProduct) throw new ProductNotFoundException();

      const availableBatches =
        await this.productBatchCommandRepo.findAvailableByProduct(
          lockedProduct.id.value,
          clinicId
        );

      const { updatedBatch, stockMovementProps } =
        lockedProduct.handleStockChange({
          quantityDelta: data.quantityDelta,
          clinicId,
          availableBatches,
          explicitBatchId: data.batchId,
          performedById: actor.userId,
          notes: data.notes,
        });

      const stockMovement = StockMovement.create(stockMovementProps);
      if (updatedBatch) {
        await this.productBatchCommandRepo.update(updatedBatch);
      }
      await this.stockMovementCommandRepo.create(stockMovement);
    });
  }
}
