import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateProductCommand } from './update-product.command';
import {
  IProductCommandRepository,
  IProductQueryRepository,
  PRODUCT_COMMAND_REPOSITORY,
  PRODUCT_QUERY_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { ProductNotFoundException } from '@modules/supply/inventory/domain/exceptions/inventory.exceptions';

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler
  implements ICommandHandler<UpdateProductCommand, void>
{
  constructor(
    @Inject(PRODUCT_QUERY_REPOSITORY)
    private readonly productQueryRepo: IProductQueryRepository,
    @Inject(PRODUCT_COMMAND_REPOSITORY)
    private readonly productCommandRepo: IProductCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: UpdateProductCommand): Promise<void> {
    const { productId, dto, ctx } = command;
    const { actor } = ctx;

    this.policyFactory
      .clinic(actor)
      .evaluator.systemBypass(ctx.source)
      .check((p) => p.actorCanAccessTargetClinic(dto.clinicId))
      .orThrow();

    const product = await this.productCommandRepo.findById(productId);
    if (!product) throw new ProductNotFoundException();

    product.update({
      name: dto.name,
      barcode: dto.barcode,
      brand: dto.brand,
      description: dto.description,
      unit: dto.unit,
      vatRate: dto.vatRate,
      criticalStockQty: dto.criticalStockQty,
      reorderQty: dto.reorderQty,
      categoryId: dto.categoryId,
      supplierId: dto.supplierId,
    });

    await this.txManager.run(async () => {
      await this.productCommandRepo.save(product);
    });
  }
}
