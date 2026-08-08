import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateProductCategoryCommand } from './create-product-category.command';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { ProductCategory } from '@modules/supply/inventory/domain/entities/product-category.entity';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  IProductCategoryCommandRepository,
  PRODUCT_CATEGORY_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product-category/product-category.command.repository';

@CommandHandler(CreateProductCategoryCommand)
export class CreateProductCategoryHandler
  implements ICommandHandler<CreateProductCategoryCommand, string>
{
  constructor(
    @Inject(PRODUCT_CATEGORY_COMMAND_REPOSITORY)
    private readonly productCategoryRepo: IProductCategoryCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreateProductCategoryCommand): Promise<string> {
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

    const category = ProductCategory.create({
      name: data.name,
      parentId: data.parentId ?? null,
      organizationId: data.organizationId,
      clinicId: data.clinicId,
    });

    return this.txManager.run(async () => {
      const saved = await this.productCategoryRepo.create(category);
      return saved.id.value;
    });
  }
}
