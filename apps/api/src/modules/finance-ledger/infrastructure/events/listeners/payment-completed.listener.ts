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
    this.logger.log(`Ödeme eventi yakalandı: installmentId=${event.installmentId}`);

    try {
      const installment = await this.prisma.paymentInstallment.findUnique({
        where: { id: event.installmentId },
        include: { payment: true },
      });

      if (!installment) {
        this.logger.warn(`Taksit bulunamadı, ledger atlandı: ${event.installmentId}`);
        return;
      }

      const clinic = await this.prisma.clinic.findUnique({
        where: { id: installment.payment.clinicId },
        select: { organizationId: true },
      });

      if (!clinic) {
        this.logger.warn(`Klinik bulunamadı, ledger atlandı: ${installment.payment.clinicId}`);
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

      this.logger.log(`Ledger kuyruğuna eklendi: installmentId=${event.installmentId}`);
    } catch (error) {
      this.logger.error(
        `Kuyruğa iş eklenirken hata oluştu: installmentId=${event.installmentId}`,
        error
      );
    }
  }
}
