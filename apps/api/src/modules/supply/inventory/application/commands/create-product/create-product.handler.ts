import { Product } from '@modules/supply/inventory/domain/entities/product.entity';
import {
  IProductCommandRepository,
  PRODUCT_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product.repository.interface';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { CreateProductCommand } from './create-product.command';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

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
    const { data, ctx } = command;

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check((p) =>
        p.actorCanAccessClinicAndOrganization(
          data.clinicId,
          data.organizationId
        )
      )
      .orThrow();

    const product = Product.create({
      vatRate: data.vatRate ?? 0,
      criticalStockQty: data.criticalStockQty ?? 0,
      reorderQty: data.reorderQty ?? 0,
      ...data,
    });

    return this.txManager.run(async () => {
      const saved = await this.productCommandRepo.create(product);
      return saved.id.value;
    });
  }
}
