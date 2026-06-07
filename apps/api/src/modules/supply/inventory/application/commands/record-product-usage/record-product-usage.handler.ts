import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  StockMovementDirection,
  StockMovementType,
} from '@prisma/client';
import { RecordProductUsageCommand } from './record-product-usage.command';
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
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

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

    const { policy } = this.policyFactory.clinic(actor);
    if (
      !policy.isSystemAdmin() &&
      !policy.actorCanManageTargetClinic(clinicId)
    ) {
      throw new ForbiddenException(
        'Bu klinikte ürün kullanımı kaydedemezsiniz.'
      );
    }

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

    await this.txManager.run(async () => {
      batch.deductQuantity(quantity);
      await this.productBatchCommandRepo.save(batch);

      await this.stockMovementCommandRepo.create({
        id: crypto.randomUUID(),
        productId: product.id,
        clinicId,
        batchId: batch.id,
        type: StockMovementType.USAGE,
        direction: StockMovementDirection.OUT,
        quantity,
        performedById: actor.userId,
        notes: dto.notes ?? null,
      });
    });
  }
}
