import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

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

    const { policy } = this.policyFactory.organization(actor);
    if (
      !policy.isSystemAdmin() &&
      !policy.isOwnOrganization(actor.organizationId)
    ) {
      throw new ForbiddenException('Ürün güncelleme yetkiniz yok.');
    }

    const product = await this.productQueryRepo.findById(productId);
    if (!product) throw new NotFoundException('Ürün bulunamadı.');

    product.update({
      name: dto.name,
      barcode: dto.barcode,
      brand: dto.brand,
      description: dto.description,
      unit: dto.unit,
      vatRate:
        dto.vatRate != null ? new Prisma.Decimal(dto.vatRate) : undefined,
      criticalStockQty:
        dto.criticalStockQty != null
          ? new Prisma.Decimal(dto.criticalStockQty)
          : undefined,
      reorderQty:
        dto.reorderQty != null ? new Prisma.Decimal(dto.reorderQty) : undefined,
      categoryId: dto.categoryId,
      supplierId: dto.supplierId,
    });

    await this.txManager.run(async () => {
      await this.productCommandRepo.save(product);
    });
  }
}
