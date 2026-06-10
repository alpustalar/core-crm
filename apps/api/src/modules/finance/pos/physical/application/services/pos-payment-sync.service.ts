import { Inject, Injectable } from '@nestjs/common';
import { InstallmentStatus } from '@prisma/client';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import {
  IPaymentEventPublisher,
  PAYMENT_EVENT_PUBLISHER,
} from '@modules/finance/payment/domain/interfaces/payment-event-publisher.interface';
import { GetPaymentWithInstallmentsQuery } from '@modules/finance/payment/application/queries/get-payment-with-installments/get-payment-with-installments.query';
import { MarkInstallmentAsPaidCommand } from '@modules/finance/payment/application/commands/mark-installment-as-paid/mark-installment-as-paid.command';
import { MarkInstallmentAsFailedCommand } from '@modules/finance/payment/application/commands/mark-installment-as-failed/mark-installment-as-failed.command';
import { MarkInstallmentAsRefundedCommand } from '@modules/finance/payment/application/commands/mark-installment-as-refunded/mark-installment-as-refunded.command';

interface PosPaymentSyncInput {
  paymentId: string;
  clinicId: string;
  reason?: string;
}

interface ResolvedInstallment {
  installmentId: string;
  appointmentId: string | null;
}

/**
 * Physical POS işlemlerinin sonucunu payment modülüne yansıtır.
 *
 * POS modülü ledger'a doğrudan dokunmaz; yalnızca ilgili taksiti
 * COMPLETED / PENDING / REFUNDED olarak işaretler ve payment event'ini yayınlar.
 * Ledger kayıtları finance-ledger modülündeki payment listener'ları üzerinden oluşur.
 *
 * KURAL: Bu metodlar mutlaka bir TransactionManager.outboxRun() içinden çağrılır;
 * yayınlanan payment event'leri aynı transaction'da Outbox'a mühürlenir.
 */
@Injectable()
export class PosPaymentSyncService {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus,
    @Inject(PAYMENT_EVENT_PUBLISHER)
    private readonly paymentEventPublisher: IPaymentEventPublisher
  ) {}

  /** POS tahsilatı başarılı: taksit COMPLETED + PaymentPaidEvent. */
  async markPaid({ paymentId, clinicId }: PosPaymentSyncInput): Promise<void> {
    const resolved = await this.resolveInstallment(paymentId, [
      InstallmentStatus.PENDING,
    ]);
    if (!resolved) return;

    await this.commandBus.execute(
      new MarkInstallmentAsPaidCommand(resolved.installmentId)
    );

    // TODO: payment modülünün eventini kaldır. command eevent handler içinde fırlatılacak. duruma göre command'e internalContext ve internalData geçilebilir

    this.paymentEventPublisher.paymentPaid({
      installmentId: resolved.installmentId,
      paymentId,
      appointmentId: resolved.appointmentId,
      clinicId,
      action: LogAction.PAYMENT_SUCCESS,
      type: LogType.INFO,
      details: 'POS ödemesi tahsil edildi',
    });
  }

  /** POS tahsilatı reddedildi: taksit PENDING'e döner + PaymentFailedEvent. */
  async markFailed({
    paymentId,
    clinicId,
    reason,
  }: PosPaymentSyncInput): Promise<void> {
    const resolved = await this.resolveInstallment(paymentId, [
      InstallmentStatus.PENDING,
    ]);
    if (!resolved) return;

    await this.commandBus.execute(
      new MarkInstallmentAsFailedCommand(resolved.installmentId)
    );

    // TODO: payment modülü eventi kaldıralacak. event command handler içinde fırlatılacak

    this.paymentEventPublisher.paymentFailed({
      paymentId,
      appointmentId: resolved.appointmentId,
      clinicId,
      action: LogAction.PAYMENT_FAILED,
      type: LogType.ERROR,
      details: reason ?? 'POS ödemesi reddedildi',
    });
  }

  /** POS iade/void başarılı: tamamlanmış taksit REFUNDED + PaymentRefundedEvent. */
  async markRefunded({
    paymentId,
    clinicId,
  }: PosPaymentSyncInput): Promise<void> {
    const resolved = await this.resolveInstallment(paymentId, [
      InstallmentStatus.COMPLETED,
    ]);
    if (!resolved) return;

    await this.commandBus.execute(
      new MarkInstallmentAsRefundedCommand(resolved.installmentId)
    );

    // TODO: bu event command handler içinde fırlatılacak
    this.paymentEventPublisher.paymentRefund({
      installmentId: resolved.installmentId,
      paymentId,
      appointmentId: resolved.appointmentId,
      clinicId,
      action: LogAction.PAYMENT_REFUNDED,
      type: LogType.INFO,
      details: 'POS işlemi iade edildi',
    });
  }

  private async resolveInstallment(
    paymentId: string,
    statuses: InstallmentStatus[]
  ): Promise<ResolvedInstallment | null> {
    const payment = await this.queryBus.execute(
      new GetPaymentWithInstallmentsQuery(paymentId)
    );
    if (!payment) return null;

    const installment = payment.installments.find((i) =>
      statuses.includes(i.status)
    );
    if (!installment) return null;

    return {
      installmentId: installment.id,
      appointmentId: payment.appointmentId,
    };
  }
}
