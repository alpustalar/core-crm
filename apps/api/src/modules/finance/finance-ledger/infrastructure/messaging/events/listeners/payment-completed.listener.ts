import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PAYMENT_EVENTS } from '@src/domain/constants/events';
import { PaymentPaidEvent } from '@modules/finance/payment/domain/events/payment-paid.event';
import { FinanceLedgerProducer } from '@modules/finance/finance-ledger/infrastructure/messaging/queue/producers/finance-ledger.producer';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { CriticalFailurePublisher } from '@common/observability/critical-failure.publisher';

@Injectable()
export class PaymentCompletedListener {
  private readonly logger = new Logger(PaymentCompletedListener.name);

  constructor(
    private readonly financeLedgerProducer: FinanceLedgerProducer,
    private readonly prisma: PrismaService,
    private readonly criticalFailure: CriticalFailurePublisher
  ) {}

  @OnEvent(PAYMENT_EVENTS.PAID, { async: true })
  async handlePaymentPaid(event: PaymentPaidEvent): Promise<void> {
    this.logger.log(
      `Ödeme eventi yakalandı: installmentId=${event.installmentId}`
    );

    try {
      const installment = await this.prisma.paymentInstallment.findUnique({
        where: { id: event.installmentId },
        include: { payment: true },
      });

      if (!installment) {
        this.logger.warn(
          `Taksit bulunamadı, ledger atlandı: ${event.installmentId}`
        );
        return;
      }

      const clinic = await this.prisma.clinic.findUnique({
        where: { id: installment.payment.clinicId },
        select: { organizationId: true },
      });

      if (!clinic) {
        this.logger.warn(
          `Klinik bulunamadı, ledger atlandı: ${installment.payment.clinicId}`
        );
        return;
      }

      await this.financeLedgerProducer.addToLedgerQueue({
        installmentId: installment.id,
        paymentId: installment.paymentId,
        appointmentId: event.appointmentId,
        organizationId: clinic.organizationId,
        clinicId: installment.payment.clinicId,
        patientId: installment.payment.patientId,
        amount: installment.amount.toString(),
        currency: installment.currency,
      });

      this.logger.log(
        `Ledger kuyruğuna eklendi: installmentId=${event.installmentId}`
      );
    } catch (error) {
      this.logger.error(
        `Kuyruğa iş eklenirken hata oluştu: installmentId=${event.installmentId}`,
        error
      );
      // Tahsilat alındı ama cari kayıt kuyruğa hiç girmedi: hasta bakiyesi ve
      // klinik geliri eksik görünür, kuyrukta yeniden denenecek bir iş de yok.
      this.criticalFailure.publish({
        operation: 'finance.ledger.enqueue',
        severity: 'CRITICAL',
        summary: 'Tahsilat için cari kayıt kuyruğa alınamadı.',
        errorMessage: error instanceof Error ? error.message : String(error),
        context: {
          installmentId: event.installmentId,
          paymentId: event.paymentId,
        },
        clinicId: event.clinicId,
        dedupeKey: `ledger-enqueue-failed:${event.installmentId}`,
      });
    }
  }
}
