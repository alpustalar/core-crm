import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AdjustStockCommand } from './adjust-stock.command';
import {
  IProductQueryRepository,
  PRODUCT_QUERY_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product.repository.interface';
import {
  IProductBatchCommandRepository,
  IProductBatchQueryRepository,
  PRODUCT_BATCH_COMMAND_REPOSITORY,
  PRODUCT_BATCH_QUERY_REPOSITORY,
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
export class AdjustStockHandler
  implements ICommandHandler<AdjustStockCommand, void>
{
  constructor(
    @Inject(PRODUCT_QUERY_REPOSITORY)
    private readonly productQueryRepo: IProductQueryRepository,
    @Inject(PRODUCT_BATCH_QUERY_REPOSITORY)
    private readonly productBatchQueryRepo: IProductBatchQueryRepository,
    @Inject(PRODUCT_BATCH_COMMAND_REPOSITORY)
    private readonly productBatchCommandRepo: IProductBatchCommandRepository,
    @Inject(STOCK_MOVEMENT_COMMAND_REPOSITORY)
    private readonly stockMovementCommandRepo: IStockMovementCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: AdjustStockCommand): Promise<void> {
    const { clinicId, dto, ctx } = command;
    const { actor, source } = ctx;

    this.policyFactory
      .clinic(actor)
      .evaluator.check(
        (p) => p.actorCanManageTargetClinic(clinicId),
        'Bu klinikte işlem yapma yetkiniz yok.'
      )
      .systemBypass(source)
      .orThrow(INVENTORY_EVENTS.ADJUST_STOCK);

    const product = await this.productQueryRepo.findById(dto.productId);
    if (!product) throw new ProductNotFoundException();

    const availableBatches =
      await this.productBatchQueryRepo.findAvailableByProduct(
        product.id.value,
        clinicId
      );

    const { updatedBatch, stockMovementProps } = product.handleStockChange({
      quantityDelta: dto.quantityDelta,
      clinicId,
      availableBatches,
      explicitBatchId: dto.batchId,
      performedById: actor.userId,
      notes: dto.notes,
    });

    const stockMovement = StockMovement.create(stockMovementProps);
    await this.txManager.run(async () => {
      if (updatedBatch) {
        await this.productBatchCommandRepo.save(updatedBatch);
      }
      await this.stockMovementCommandRepo.create(stockMovement);
    });
  }
}
