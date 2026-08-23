import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePurchaseOrderCommand } from './create-purchase-order.command';
import {
  IPurchaseOrderCommandRepository,
  PURCHASE_ORDER_COMMAND_REPOSITORY,
} from '@modules/supply/purchasing/domain/repositories/purchase-order.repository';
import {
  IPurchaseRequestCommandRepository,
  PURCHASE_REQUEST_COMMAND_REPOSITORY,
} from '@modules/supply/purchasing/domain/repositories/purchase-request.repository';
import { PurchaseOrder } from '@modules/supply/purchasing/domain/entities/purchase-order.entity';
import { PurchaseRequestNotFoundException } from '@modules/supply/purchasing/domain/exceptions/purchasing.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { TENANT_SCOPE_RESOLVER } from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';
import { ITenantScopeResolver } from '@shared';

@CommandHandler(CreatePurchaseOrderCommand)
export class CreatePurchaseOrderHandler implements ICommandHandler<
  CreatePurchaseOrderCommand,
  string
> {
  constructor(
    @Inject(PURCHASE_ORDER_COMMAND_REPOSITORY)
    private readonly purchaseOrderRepo: IPurchaseOrderCommandRepository,
    @Inject(PURCHASE_REQUEST_COMMAND_REPOSITORY)
    private readonly purchaseRequestRepo: IPurchaseRequestCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreatePurchaseOrderCommand): Promise<string> {
    const { data, ctx } = command;
    const { actor } = ctx;

    const organizationId = await this.tenantScopeResolver.resolve(data);

    this.policyFactory
      .purchasing(actor, ctx.source)
      .evaluator.check((p) => p.canManageClinicPurchasing(data.clinicId))
      .orThrow('purchase-order.create');

    const order = PurchaseOrder.create({
      clinicId: data.clinicId,
      organizationId,
      supplierId: data.supplierId,
      purchaseRequestId: data.purchaseRequestId,
      expectedDate: data.expectedDate,
      note: data.note,
      items: data.items,
    });

    return this.txManager.run(async () => {
      // Onaylı talepten oluşturuluyorsa talebi ORDERED işaretle (atomik).
      if (data.purchaseRequestId) {
        const request = await this.purchaseRequestRepo.findByIdForUpdate(
          data.purchaseRequestId
        );
        if (!request) {
          throw new PurchaseRequestNotFoundException(data.purchaseRequestId);
        }
        request.markOrdered();
        await this.purchaseRequestRepo.update(request);
      }

      const saved = await this.purchaseOrderRepo.create(order);
      return saved.id.value;
    });
  }
}
