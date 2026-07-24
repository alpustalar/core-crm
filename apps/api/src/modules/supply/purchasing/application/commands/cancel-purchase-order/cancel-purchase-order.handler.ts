import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelPurchaseOrderCommand } from './cancel-purchase-order.command';
import {
  IPurchaseOrderCommandRepository,
  PURCHASE_ORDER_COMMAND_REPOSITORY,
} from '@modules/supply/purchasing/domain/repositories/purchase-order.repository';
import { PurchaseOrderNotFoundException } from '@modules/supply/purchasing/domain/exceptions/purchasing.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@CommandHandler(CancelPurchaseOrderCommand)
export class CancelPurchaseOrderHandler
  implements ICommandHandler<CancelPurchaseOrderCommand, void>
{
  constructor(
    @Inject(PURCHASE_ORDER_COMMAND_REPOSITORY)
    private readonly poCommandRepo: IPurchaseOrderCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CancelPurchaseOrderCommand): Promise<void> {
    const { orderId, ctx } = command;

    await this.txManager.run(async () => {
      const order = await this.poCommandRepo.findById(orderId);
      if (!order) throw new PurchaseOrderNotFoundException(orderId);

      this.policyFactory
        .purchasing(ctx.actor, ctx.source)
        .evaluator.check((p) =>
          p.canManageClinicPurchasing(order.clinicId.value)
        )
        .orThrow('purchase-order.cancel');

      order.cancel();
      await this.poCommandRepo.save(order);
    });
  }
}
