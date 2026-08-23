import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePurchaseRequestCommand } from './create-purchase-request.command';
import {
  IPurchaseRequestCommandRepository,
  PURCHASE_REQUEST_COMMAND_REPOSITORY,
} from '@modules/supply/purchasing/domain/repositories/purchase-request.repository';
import { PurchaseRequest } from '@modules/supply/purchasing/domain/entities/purchase-request.entity';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { TENANT_SCOPE_RESOLVER } from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';
import { ITenantScopeResolver } from '@shared';

@CommandHandler(CreatePurchaseRequestCommand)
export class CreatePurchaseRequestHandler implements ICommandHandler<
  CreatePurchaseRequestCommand,
  string
> {
  constructor(
    @Inject(PURCHASE_REQUEST_COMMAND_REPOSITORY)
    private readonly prCommandRepo: IPurchaseRequestCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreatePurchaseRequestCommand): Promise<string> {
    const { data, ctx } = command;
    const { actor } = ctx;

    const organizationId = await this.tenantScopeResolver.resolve(data);

    this.policyFactory
      .purchasing(actor, ctx.source)
      .evaluator.check((p) => p.canAccessClinicPurchasing(data.clinicId))
      .orThrow('purchase-request.create');

    const request = PurchaseRequest.create({
      clinicId: data.clinicId,
      organizationId,
      requestedById: actor.userId,
      neededBy: data.neededBy,
      note: data.note,
      items: data.items,
    });

    return this.txManager.run(async () => {
      const saved = await this.prCommandRepo.create(request);
      return saved.id.value;
    });
  }
}
