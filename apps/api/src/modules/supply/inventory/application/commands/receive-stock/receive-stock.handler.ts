import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ReceiveStockCommand } from './receive-stock.command';
import { StockMovement } from '@modules/supply/inventory/domain/entities/stock-movement.entity';
import {
  IProductQueryRepository,
  PRODUCT_QUERY_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product.repository.interface';
import {
  IProductBatchCommandRepository,
  PRODUCT_BATCH_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product-batch.repository.interface';
import {
  IStockMovementCommandRepository,
  STOCK_MOVEMENT_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/stock-movement.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { ProductBatch } from '@modules/supply/inventory/domain/entities/product-batch.entity';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { StockMovementDirectionSchema, StockMovementTypeSchema } from '@shared';
import { Quantity } from '@src/domain/value-objects/quantity.vo';
import { Money } from '@src/domain/value-objects/money.vo';
import { ProductNotFoundException } from '@modules/supply/inventory/domain/exceptions/inventory.exceptions';
import { UUID } from '@src/domain/value-objects/uuid.vo';

@CommandHandler(ReceiveStockCommand)
export class ReceiveStockHandler
  implements ICommandHandler<ReceiveStockCommand, string>
{
  constructor(
    @Inject(PRODUCT_QUERY_REPOSITORY)
    private readonly productQueryRepo: IProductQueryRepository,
    @Inject(PRODUCT_BATCH_COMMAND_REPOSITORY)
    private readonly productBatchCommandRepo: IProductBatchCommandRepository,
    @Inject(STOCK_MOVEMENT_COMMAND_REPOSITORY)
    private readonly stockMovementCommandRepo: IStockMovementCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ReceiveStockCommand): Promise<string> {
    const { clinicId, dto, ctx } = command;
    const { actor } = ctx;

    // TODO: capability guard

    const product = await this.productQueryRepo.findById(dto.productId);
    if (!product) throw new ProductNotFoundException();

    const batchId = UUID.generate();

    const batch = ProductBatch.createFromPurchase({
      id: batchId.value,
      productId: product.id.value,
      clinicId,
      organizationId: UUID.create(actor.organizationId).orThrow().value,
      supplierId: dto.supplierId ?? null,
      lotNumber: dto.lotNumber ?? null,
      expiresAt: dto.expiresAt ?? null,
      quantity: Quantity.create(dto.quantity).orThrow(),
      purchasePrice: Money.create(dto.purchasePrice, dto.currency).orThrow(),
      notes: dto.notes ?? null,
      eventPayload: {
        action: LogAction.INVENTORY_STOCK_RECEIVE,
        source: LogSource.WEB,
        type: LogType.INFO,
        actorId: actor.userId,
      },
    });

    const stockMovement = StockMovement.create({
      productId: product.id.value,
      clinicId,
      batchId: batchId.value,
      type: StockMovementTypeSchema.enum.PURCHASE,
      direction: StockMovementDirectionSchema.enum.IN,
      quantity: dto.quantity,
      unitPrice: Money.create(dto.purchasePrice, dto.currency).instance,
      vatRate: dto.vatRate ?? null,
      performedById: actor.userId,
      notes: dto.notes ?? null,
    });

    return this.txManager.run(async () => {
      await this.productBatchCommandRepo.save(batch);
      await this.stockMovementCommandRepo.save(stockMovement);
      return batchId.value;
    });
  }
}
