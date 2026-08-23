import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Decimal } from 'decimal.js';
import { ApplyInvoiceToPurchaseOrderCommand } from './apply-invoice-to-purchase-order.command';
import {
  IPurchaseOrderCommandRepository,
  PURCHASE_ORDER_COMMAND_REPOSITORY,
} from '@modules/supply/purchasing/domain/repositories/purchase-order.repository';
import {
  PurchaseOrderClinicMismatchException,
  PurchaseOrderCurrencyMismatchException,
  PurchaseOrderNotFoundException,
  PurchaseOrderSupplierMismatchException,
} from '@modules/supply/purchasing/domain/exceptions/purchasing.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

/**
 * Faturayı siparişe eşleştirir: sipariş kilitlenir, fatura ile uyumu (klinik,
 * tedarikçi, para birimi) doğrulanır, faturalanan tutar sayacı artırılır.
 *
 * Kilit şart: `invoicedTotal` kümülatif bir sayaçtır — aynı siparişe iki fatura
 * eşzamanlı eşleşirse kilitsiz okumada ikisi de aynı "kalan tutar"ı görür ve
 * sipariş iki kez faturalanmış olur (ödenecek borç şişer).
 */
@CommandHandler(ApplyInvoiceToPurchaseOrderCommand)
export class ApplyInvoiceToPurchaseOrderHandler implements ICommandHandler<
  ApplyInvoiceToPurchaseOrderCommand,
  void
> {
  private readonly logger = new Logger(ApplyInvoiceToPurchaseOrderHandler.name);

  constructor(
    @Inject(PURCHASE_ORDER_COMMAND_REPOSITORY)
    private readonly purchaseOrderRepo: IPurchaseOrderCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ApplyInvoiceToPurchaseOrderCommand): Promise<void> {
    const {
      orderId,
      invoiceId,
      clinicId,
      supplierId,
      grandTotal,
      currency,
      ctx,
    } = command.payload;

    await this.txManager.run(async () => {
      const order = await this.purchaseOrderRepo.findByIdForUpdate(orderId);
      if (!order) throw new PurchaseOrderNotFoundException(orderId);

      this.policyFactory
        .purchasing(ctx.actor, ctx.source)
        .evaluator.check((p) =>
          p.canManageClinicPurchasing(order.clinicId.value)
        )
        .orThrow('purchase-order.match-invoice');

      if (order.clinicId.value !== clinicId) {
        throw new PurchaseOrderClinicMismatchException({
          orderClinicId: order.clinicId.value,
          invoiceClinicId: clinicId,
        });
      }
      if (order.supplierId.value !== supplierId) {
        throw new PurchaseOrderSupplierMismatchException({
          orderSupplierId: order.supplierId.value,
          invoiceSupplierId: supplierId,
        });
      }
      if (order.currency !== currency) {
        throw new PurchaseOrderCurrencyMismatchException({
          orderCurrency: order.currency,
          invoiceCurrency: currency,
        });
      }

      order.applyInvoice(new Decimal(grandTotal));
      await this.purchaseOrderRepo.update(order);

      this.logger.log(
        `Fatura siparişe eşleştirildi: orderId=${orderId} invoiceId=${invoiceId} ` +
          `faturalanan=${order.invoicedTotal.toFixed(2)}/${order.grandTotal.toFixed(2)} ` +
          `durum=${order.billingStatus}`
      );
    });
  }
}
