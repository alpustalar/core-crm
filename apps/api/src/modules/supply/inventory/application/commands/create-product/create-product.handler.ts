import { Product } from '@modules/supply/inventory/domain/entities/product.entity';
import {
  IProductCommandRepository,
  PRODUCT_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product.repository.interface';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { CreateProductCommand } from './create-product.command';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler
  implements ICommandHandler<CreateProductCommand, string>
{
  constructor(
    @Inject(PRODUCT_COMMAND_REPOSITORY)
    private readonly productCommandRepo: IProductCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreateProductCommand): Promise<string> {
    const { dto, ctx } = command;
    const { actor } = ctx;

    // TODO: controllera capability guard ekle

    return this.txManager.run(async () => {
      const product = Product.create({
        name: dto.name,
        stockCode: dto.stockCode,
        barcode: dto.barcode,
        brand: dto.brand,
        description: dto.description,
        unit: dto.unit,
        condition: dto.condition,
        vatRate: dto.vatRate ?? 0,
        criticalStockQty: dto.criticalStockQty ?? 0,
        reorderQty: dto.reorderQty ?? 0,
        organizationId: actor.organizationId!,
        categoryId: dto.categoryId,
        supplierId: dto.supplierId,
      });
      const saved = await this.productCommandRepo.save(product);
      return saved.id;
    });
  }
}
