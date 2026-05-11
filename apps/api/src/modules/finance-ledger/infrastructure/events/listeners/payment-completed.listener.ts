import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PAYMENT_EVENTS } from '@src/domain/constants/events';
import { PaymentPaidEvent } from '@modules/payment/domain/events/payment-paid.event';
import { FinanceLedgerProducer } from '@modules/finance-ledger/infrastructure/queue/producers/finance-ledger.producer';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class PaymentCompletedListener {
  private readonly logger = new Logger(PaymentCompletedListener.name);

  constructor(
    private readonly financeLedgerProducer: FinanceLedgerProducer,
    private readonly prisma: PrismaService
  ) {}

  @OnEvent(PAYMENT_EVENTS.PAID, { async: true })
  async handlePaymentPaid(event: PaymentPaidEvent): Promise<void> {
    this.logger.log(`Ödeme eventi yakalandı: ${event.paymentId}`);

    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: event.paymentId },
      });

      if (!payment) {
        this.logger.warn(
          `Ödeme bulunamadı, ledger atlandı: ${event.paymentId}`
        );
        return;
      }

      await this.financeLedgerProducer.addToLedgerQueue({
        paymentId: payment.id,
        appointmentId: event.appointmentId,
        clinicId: payment.clinicId,
        patientId: payment.patientId,
        amount: payment.expectedAmount.toString(),
        currency: payment.currency,
      });

      this.logger.log(`Ledger kuyruğuna eklendi: ${event.paymentId}`);
    } catch (error) {
      this.logger.error(
        `Kuyruğa iş eklenirken hata oluştu: ${event.paymentId}`,
        error
      );
    }
  }
}
