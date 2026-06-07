import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateProductCommand } from './create-product.command';
import {
  IProductCommandRepository,
  PRODUCT_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler
  implements ICommandHandler<CreateProductCommand, string>
{
  constructor(
    @Inject(PRODUCT_COMMAND_REPOSITORY)
    private readonly productCommandRepo: IProductCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreateProductCommand): Promise<string> {
    const { dto, ctx } = command;
    const { actor } = ctx;

    const { policy } = this.policyFactory.organization(actor);
    if (
      !policy.isSystemAdmin() &&
      !policy.isOwnOrganization(actor.organizationId)
    ) {
      throw new ForbiddenException('Ürün oluşturma yetkiniz yok.');
    }

    return this.txManager.run(async () => {
      const product = await this.productCommandRepo.create({
        id: crypto.randomUUID(),
        name: dto.name,
        stockCode: dto.stockCode,
        barcode: dto.barcode ?? null,
        brand: dto.brand ?? null,
        description: dto.description ?? null,
        unit: dto.unit,
        condition: dto.condition,
        vatRate:
          dto.vatRate != null ? new Prisma.Decimal(dto.vatRate) : undefined,
        criticalStockQty:
          dto.criticalStockQty != null
            ? new Prisma.Decimal(dto.criticalStockQty)
            : undefined,
        reorderQty:
          dto.reorderQty != null
            ? new Prisma.Decimal(dto.reorderQty)
            : undefined,
        organizationId: actor.organizationId!,
        categoryId: dto.categoryId ?? null,
        supplierId: dto.supplierId ?? null,
      });
      return product.id;
    });
  }
}
