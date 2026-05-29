import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { Prisma, StockMovementDirection, StockMovementType } from '@prisma/client';
import { AdjustStockCommand } from './adjust-stock.command';
import {
  PRODUCT_QUERY_REPOSITORY,
  IProductQueryRepository,
} from '@modules/inventory/domain/repositories/product.repository.interface';
import {
  PRODUCT_BATCH_COMMAND_REPOSITORY,
  PRODUCT_BATCH_QUERY_REPOSITORY,
  IProductBatchCommandRepository,
  IProductBatchQueryRepository,
} from '@modules/inventory/domain/repositories/product-batch.repository.interface';
import {
  STOCK_MOVEMENT_COMMAND_REPOSITORY,
  IStockMovementCommandRepository,
} from '@modules/inventory/domain/repositories/stock-movement.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/policy/domain/interfaces/policy-factory.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

@CommandHandler(AdjustStockCommand)
export class AdjustStockHandler implements ICommandHandler<AdjustStockCommand, void> {
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
    private readonly txManager: TransactionManager,
  ) {}

  async execute(command: AdjustStockCommand): Promise<void> {
    const { clinicId, dto, ctx } = command;
    const { actor } = ctx;

    const { policy } = this.policyFactory.clinic(actor);
    if (!policy.isSystemAdmin() && !policy.actorCanManageTargetClinic(clinicId)) {
      throw new ForbiddenException('Bu klinikte stok düzeltme yetkiniz yok.');
    }

    const product = await this.productQueryRepo.findById(dto.productId);
    if (!product) throw new NotFoundException('Ürün bulunamadı.');

    const delta = new Prisma.Decimal(dto.quantityDelta);
    const isIncrease = delta.greaterThan(0);
    const absQty = delta.abs();

    let batch = dto.batchId
      ? await this.productBatchQueryRepo.findById(dto.batchId)
      : null;

    if (!batch) {
      const available = await this.productBatchQueryRepo.findAvailableByProduct(product.id, clinicId);
      batch = available[0] ?? null;
    }

    if (!batch && !isIncrease) {
      throw new BadRequestException('Düşüm yapılacak batch bulunamadı.');
    }

    await this.txManager.run(async () => {
      if (batch) {
        if (isIncrease) {
          batch.addQuantity(absQty);
        } else {
          batch.deductQuantity(absQty);
        }
        await this.productBatchCommandRepo.save(batch);
      }

      await this.stockMovementCommandRepo.create({
        id: crypto.randomUUID(),
        productId: product.id,
        clinicId,
        batchId: batch?.id ?? null,
        type: StockMovementType.ADJUSTMENT,
        direction: isIncrease ? StockMovementDirection.IN : StockMovementDirection.OUT,
        quantity: absQty,
        performedById: actor.userId,
        notes: dto.notes ?? null,
      });
    });
  }
}
