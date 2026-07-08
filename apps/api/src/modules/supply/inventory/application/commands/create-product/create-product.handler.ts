import { Product } from '@modules/supply/inventory/domain/entities/product.entity';
import {
  IProductCommandRepository,
  PRODUCT_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/product.repository.interface';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { CreateProductCommand } from './create-product.command';
import { OrganizationNotAssignedException } from '@src/domain/exceptions/organization-not-assigned.exception';
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
    const { dto, ctx } = command;
    const { actor, source } = ctx;

    if (!actor.organizationId) throw new OrganizationNotAssignedException();

    if (!actor.clinicId) {
      this.policyFactory
        .clinic(actor)
        .evaluator.systemBypass(source)
        .check((p) => p.actorCanAccessTargetClinic(dto.clinicId))
        .orThrow();
    }

    const product = Product.create({
      vatRate: dto.vatRate ?? 0,
      criticalStockQty: dto.criticalStockQty ?? 0,
      reorderQty: dto.reorderQty ?? 0,
      organizationId: actor.organizationId,
      ...dto,
    });

    return this.txManager.run(async () => {
      const saved = await this.productCommandRepo.create(product);
      return saved.id.value;
    });
  }
}
