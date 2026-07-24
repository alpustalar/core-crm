import { Injectable } from '@nestjs/common';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetPaymentWithInstallmentsQuery } from '@modules/finance/payment/application/queries/get-payment-with-installments/get-payment-with-installments.query';
import { MarkInstallmentAsPaidCommand } from '@modules/finance/payment/application/commands/mark-installment-as-paid/mark-installment-as-paid.command';
import { MarkInstallmentAsFailedCommand } from '@modules/finance/payment/application/commands/mark-installment-as-failed/mark-installment-as-failed.command';
import { MarkInstallmentAsRefundedCommand } from '@modules/finance/payment/application/commands/mark-installment-as-refunded/mark-installment-as-refunded.command';
import InstallmentStatusSchema, {
  InstallmentStatusType,
} from '@input-type-schemas/InstallmentStatusSchema';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';

interface PosPaymentSyncInput {
  paymentId: string;
  clinicId: string;
  reason?: string;
}

/**
 * Physical POS işlemlerinin sonucunu payment modülüne yansıtır.
 *
 * POS modülü ledger'a doğrudan dokunmaz; yalnızca ilgili taksiti
 * COMPLETED / PENDING / REFUNDED olarak işaretlemek için payment command'ini
 * dispatch eder. Payment event'lerinin (PaymentPaid/Failed/Refunded) sahipliği
 * payment modülündedir; event'ler ilgili command handler içinde fırlatılır.
 * Ledger kayıtları finance-ledger modülündeki payment listener'ları üzerinden oluşur.
 *
 * KURAL: Bu metodlar mutlaka bir TransactionManager.outboxRun() içinden çağrılır;
 * command handler'ında fırlatılan payment event'leri aynı transaction'da Outbox'a
 * mühürlenir (nested run/outboxRun mevcut context'i yeniden kullanır).
 */
@Injectable()
export class PosPaymentSyncService {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  /** POS tahsilatı başarılı: taksit COMPLETED + PaymentPaidEvent (handler'da). */
  async markPaid({ paymentId }: PosPaymentSyncInput): Promise<void> {
    const installmentId = await this.resolveInstallmentId(paymentId, [
      InstallmentStatusSchema.enum.PENDING,
    ]);
    if (!installmentId) return;

    await this.commandBus.execute(
      new MarkInstallmentAsPaidCommand(
        installmentId,
        'POS ödemesi tahsil edildi'
      )
    );
  }

  /** POS tahsilatı reddedildi: taksit PENDING'e döner + PaymentFailedEvent (handler'da). */
  async markFailed({ paymentId, reason }: PosPaymentSyncInput): Promise<void> {
    const installmentId = await this.resolveInstallmentId(paymentId, [
      InstallmentStatusSchema.enum.PENDING,
    ]);
    if (!installmentId) return;

    await this.commandBus.execute(
      new MarkInstallmentAsFailedCommand(
        installmentId,
        reason ?? 'POS ödemesi reddedildi'
      )
    );
  }

  /** POS iade/void başarılı: tamamlanmış taksit REFUNDED + PaymentRefundedEvent (handler'da). */
  async markRefunded({ paymentId }: PosPaymentSyncInput): Promise<void> {
    const installmentId = await this.resolveInstallmentId(paymentId, [
      InstallmentStatusSchema.enum.COMPLETED,
    ]);
    if (!installmentId) return;

    await this.commandBus.execute(
      new MarkInstallmentAsRefundedCommand({
        installmentId: installmentId,
        details: 'POS işlemi iade edildi',
        ctx: ExecutionContextFactory.createInternal(),
      })
    );
  }

  private async resolveInstallmentId(
    paymentId: string,
    statuses: InstallmentStatusType[]
  ): Promise<string | null> {
    const { data: payment } = await this.queryBus.execute(
      new GetPaymentWithInstallmentsQuery(paymentId)
    );
    if (!payment) return null;

    const installment = payment.installments.find((i) =>
      statuses.includes(i.status)
    );
    return installment?.id ?? null;
  }
}
