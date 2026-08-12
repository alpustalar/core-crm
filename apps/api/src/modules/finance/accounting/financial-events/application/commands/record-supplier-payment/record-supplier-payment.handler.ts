import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { FinancialEventTypeSchema } from '@shared';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { FINANCIAL_EVENT_SOURCE_MODULES } from '@modules/finance/shared/domain/constants/financial-event-source-modules.constant';
import { FinancialEventDedupeKeys } from '@modules/finance/shared/domain/constants/financial-event-dedupe-keys.constant';
import { PaymentMadeEventPayload } from '@modules/finance/accounting/posting/domain/posting/event-payloads';
import { RecordFinancialEventCommand } from '../record-financial-event/record-financial-event.command';
import { RecordSupplierPaymentCommand } from './record-supplier-payment.command';

/**
 * Satıcıya ödeme kaydeder. İşin tamamı bir `FinancialEvent` yazmaktır; fişi
 * `PaymentMadeRule` üretir (B 320 cari / A 100|102).
 *
 * `reference` (havale/dekont no) verilirse idempotency anahtarı olur: aynı dekont
 * ikinci kez girilirse borç iki kez kapanmaz. Referans yoksa dedupe edilmez —
 * aynı satıcıya aynı gün aynı tutarda iki ayrı ödeme meşrudur, onları
 * birleştirmek veri kaybı olurdu.
 */
@CommandHandler(RecordSupplierPaymentCommand)
export class RecordSupplierPaymentHandler
  implements ICommandHandler<RecordSupplierPaymentCommand, string>
{
  constructor(
    private readonly commandBus: TSCommandBus,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(command: RecordSupplierPaymentCommand): Promise<string> {
    const { data, ctx } = command.payload;

    this.policyFactory
      .finance(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canAccessClinicFinances(data.clinicId))
      .orThrow();

    const payload: PaymentMadeEventPayload = {
      method: data.method,
      amount: data.amount,
      partyId: data.partyId,
      currency: data.currency,
      reference: data.reference,
    };

    return this.commandBus.execute(
      new RecordFinancialEventCommand(
        {
          clinicId: data.clinicId,
          type: FinancialEventTypeSchema.enum.PAYMENT_MADE,
          occurredAt: data.paidAt,
          payload: { ...payload },
          sourceModule: FINANCIAL_EVENT_SOURCE_MODULES.SUPPLIER_PAYMENT,
          sourceRefId: data.partyId,
          dedupeKey: data.reference
            ? FinancialEventDedupeKeys.supplier_payment(
                data.clinicId,
                data.reference
              )
            : undefined,
          performedById: ctx.actor.userId,
        },
        ctx
      )
    );
  }
}
