import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import {
  IProductCommandRepository,
  IProductQueryRepository,
  PRODUCT_COMMAND_REPOSITORY,
  PRODUCT_QUERY_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product.repository.interface';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { SoftDeleteProductCommand } from './soft-delete-product.command';
import { ProductNotFoundException } from '@modules/supply/inventory/domain/exceptions/inventory.exceptions';

@CommandHandler(SoftDeleteProductCommand)
export class SoftDeleteProductHandler
  implements ICommandHandler<SoftDeleteProductCommand, void>
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

  async execute(command: SoftDeleteProductCommand): Promise<void> {
    const { productId, ctx } = command;
    const { actor, source } = ctx;

    const product = await this.productQueryRepo.findById(productId);
    if (!product) throw new ProductNotFoundException();

    this.policyFactory
      .organization(actor)
      .evaluator.systemBypass(source)
      .check(
        (p) => p.isOwnOrganization(product.organizationId.value),
        'Ürün silme yetkiniz yok.'
      )
      .orThrow();

    product.softDelete();
    await this.txManager.run(async () => {
      await this.productCommandRepo.save(product);
    });
  }
}
