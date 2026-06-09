import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { StockMovement } from '@modules/supply/inventory/domain/entities/stock-movement.entity';
import {
  IProductBatchCommandRepository,
  IProductBatchQueryRepository,
  PRODUCT_BATCH_COMMAND_REPOSITORY,
  PRODUCT_BATCH_QUERY_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product-batch.repository.interface';
import {
  IProductQueryRepository,
  PRODUCT_QUERY_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product.repository.interface';
import {
  IStockMovementCommandRepository,
  STOCK_MOVEMENT_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/stock-movement.repository.interface';
import {
  BadRequestException,
  Inject,
  NotFoundException
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { RecordProductUsageCommand } from './record-product-usage.command';

@CommandHandler(RecordProductUsageCommand)
export class RecordProductUsageHandler
  implements ICommandHandler<RecordProductUsageCommand, void>
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

  async execute(command: RecordProductUsageCommand): Promise<void> {
    const { clinicId, dto, ctx } = command;
    const { actor } = ctx;

    // TODO: capability guard

    const product = await this.productQueryRepo.findById(dto.productId);
    if (!product) throw new NotFoundException('Ürün bulunamadı.');

    const quantity = new Prisma.Decimal(dto.quantity);

    let batch = dto.batchId
      ? await this.productBatchQueryRepo.findById(dto.batchId)
      : null;

    if (!batch) {
      const available = await this.productBatchQueryRepo.findAvailableByProduct(
        product.id,
        clinicId
      );
      batch = available[0] ?? null;
    }

    if (!batch) {
      throw new BadRequestException('Kullanılabilir stok bulunamadı.');
    }

    const stockMovementProps = batch.deductQuantity(
        quantity,
        actor.userId,
        dto.notes
    );
    
    const stockMovement = StockMovement.create(stockMovementProps);

    await this.txManager.run(async () => {
      await this.productBatchCommandRepo.save(batch);
      await this.stockMovementCommandRepo.save(stockMovement);
    });
  }
}
