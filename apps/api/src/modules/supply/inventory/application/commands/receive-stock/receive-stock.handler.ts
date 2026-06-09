import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  StockMovementDirection,
  StockMovementType,
} from '@prisma/client';
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
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { ProductBatch } from '@modules/supply/inventory/domain/entities/product-batch.entity';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';

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
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ReceiveStockCommand): Promise<string> {
    const { clinicId, dto, ctx } = command;
    const { actor } = ctx;

    // TODO: capability guard

    const product = await this.productQueryRepo.findById(dto.productId);
    if (!product) throw new NotFoundException('Ürün bulunamadı.');

    const quantity = new Prisma.Decimal(dto.quantity);
    const purchasePrice = new Prisma.Decimal(dto.purchasePrice);
    const vatRate =
      dto.vatRate != null ? new Prisma.Decimal(dto.vatRate) : null;
    const totalAmount = purchasePrice.times(quantity);
    const vatAmount = vatRate
      ? totalAmount.times(vatRate).dividedBy(100)
      : null;

    const batchId = crypto.randomUUID();

    const batch = ProductBatch.createFromPurchase({
      id: batchId,
      productId: product.id,
      clinicId,
      organizationId: actor.organizationId!,
      supplierId: dto.supplierId ?? null,
      lotNumber: dto.lotNumber ?? null,
      expiresAt: dto.expiresAt ?? null,
      quantity,
      purchasePrice,
      currency: dto.currency ?? 'TRY',
      notes: dto.notes ?? null,
      eventPayload: {
        action: LogAction.INVENTORY_STOCK_RECEIVE,
        source: LogSource.WEB,
        type: LogType.INFO,
        actorId: actor.userId,
      },
    });

    const stockMovement = StockMovement.create({
      productId: product.id,
      clinicId,
      batchId,
      type: StockMovementType.PURCHASE,
      direction: StockMovementDirection.IN,
      quantity,
      unitPrice: purchasePrice,
      currency: dto.currency ?? 'TRY',
      vatRate,
      vatAmount,
      totalAmount: vatAmount ? totalAmount.plus(vatAmount) : totalAmount,
      performedById: actor.userId,
      notes: dto.notes ?? null,
    });

    return this.txManager.run(async () => {
      await this.productBatchCommandRepo.save(batch);
      await this.stockMovementCommandRepo.save(stockMovement);
      return batchId;
    });
  }
}
