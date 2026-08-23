import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Decimal } from 'decimal.js';
import { RevertInvoiceFromPurchaseOrderCommand } from './revert-invoice-from-purchase-order.command';
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

@CommandHandler(RevertInvoiceFromPurchaseOrderCommand)
export class RevertInvoiceFromPurchaseOrderHandler implements ICommandHandler<
  RevertInvoiceFromPurchaseOrderCommand,
  void
> {
  constructor(
    @Inject(PURCHASE_ORDER_COMMAND_REPOSITORY)
    private readonly purchaseOrderRepo: IPurchaseOrderCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: RevertInvoiceFromPurchaseOrderCommand): Promise<void> {
    const { orderId, grandTotal, ctx } = command.payload;

    await this.txManager.run(async () => {
      // Sayaç düşürme de kümülatif bir yazmadır → aynı kilit gerekir.
      const order = await this.purchaseOrderRepo.findByIdForUpdate(orderId);
      if (!order) throw new PurchaseOrderNotFoundException(orderId);

      this.policyFactory
        .purchasing(ctx.actor, ctx.source)
        .evaluator.check((p) =>
          p.canManageClinicPurchasing(order.clinicId.value)
        )
        .orThrow('purchase-order.unmatch-invoice');

      order.revertInvoice(new Decimal(grandTotal));
      await this.purchaseOrderRepo.update(order);
    });
  }
}
