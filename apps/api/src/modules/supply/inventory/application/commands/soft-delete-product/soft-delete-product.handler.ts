import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { SoftDeleteProductCommand } from './soft-delete-product.command';
import { ProductNotFoundException } from '@modules/supply/inventory/domain/exceptions/inventory.exceptions';
import {
  IProductCommandRepository,
  PRODUCT_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product/product.command.repository';

@CommandHandler(SoftDeleteProductCommand)
export class SoftDeleteProductHandler
  implements ICommandHandler<SoftDeleteProductCommand, void>
{
  constructor(
    @Inject(PRODUCT_COMMAND_REPOSITORY)
    private readonly productRepo: IProductCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: SoftDeleteProductCommand): Promise<void> {
    const { productId, ctx } = command;

    const product = await this.productRepo.findById(productId);
    if (!product) throw new ProductNotFoundException();

    this.policyFactory
      .organization(ctx.actor, ctx.source)
      .evaluator.check(
        (p) => p.actorCanManageTargetOrganization(product.organizationId.value),
        'Ürün silme yetkiniz yok.'
      )
      .orThrow();

    product.softDelete();
    await this.txManager.run(async () => {
      await this.productRepo.update(product);
    });
  }
}
