import { StockMovement } from '@modules/supply/inventory/domain/entities/stock-movement.entity';
import {
  IProductBatchCommandRepository,
  PRODUCT_BATCH_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product-batch.repository.interface';
import {
  IProductCommandRepository,
  PRODUCT_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product.repository.interface';
import {
  IStockMovementCommandRepository,
  STOCK_MOVEMENT_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/stock-movement.repository.interface';
import { BadRequestException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { RecordProductUsageCommand } from './record-product-usage.command';
import { Decimal } from 'decimal.js';
import { ProductNotFoundException } from '@modules/supply/inventory/domain/exceptions/inventory.exceptions';

@CommandHandler(RecordProductUsageCommand)
export class RecordProductUsageHandler implements ICommandHandler<
  RecordProductUsageCommand,
  void
> {
  constructor(
    @Inject(PRODUCT_COMMAND_REPOSITORY)
    private readonly productCommandRepo: IProductCommandRepository,
    @Inject(PRODUCT_BATCH_COMMAND_REPOSITORY)
    private readonly productBatchCommandRepo: IProductBatchCommandRepository,
    @Inject(STOCK_MOVEMENT_COMMAND_REPOSITORY)
    private readonly stockMovementCommandRepo: IStockMovementCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: RecordProductUsageCommand): Promise<void> {
    const { clinicId, dto, ctx } = command;
    const { actor } = ctx;

    const quantity = new Decimal(dto.quantity);

    // Ürün satırı FOR UPDATE ile kilitlenir, partiler kilit altında okunup düşülür:
    // aksi halde aynı ürüne eşzamanlı iki kullanım aynı parti bakiyesini okuyup
    // ayrı ayrı düşer → lost update (stok olduğundan fazla görünür).
    await this.txManager.run(async () => {
      const product = await this.productCommandRepo.findByIdForUpdate(
        dto.productId
      );
      if (!product) throw new ProductNotFoundException();

      let batch = dto.batchId
        ? await this.productBatchCommandRepo.findById(dto.batchId)
        : null;

      if (!batch) {
        const available =
          await this.productBatchCommandRepo.findAvailableByProduct(
            product.id.value,
            clinicId
          );
        batch = available[0] ?? null;
      }

      if (!batch) {
        throw new BadRequestException('Kullanılabilir stok bulunamadı.');
      }

      const stockMovementProps = batch.deductQuantity({
        qty: quantity,
        performedById: actor.userId,
        notes: dto.notes,
      });

      const stockMovement = StockMovement.create(stockMovementProps);

      await this.productBatchCommandRepo.update(batch);
      await this.stockMovementCommandRepo.create(stockMovement);
    });
  }
}
