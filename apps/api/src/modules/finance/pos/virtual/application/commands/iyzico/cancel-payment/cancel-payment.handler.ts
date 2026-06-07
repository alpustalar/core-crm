import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelPaymentCommand } from './cancel-payment.command';
import { CancelPaymentCommandResponse } from './cancel-payment.response';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { PaymentDomainService } from '@modules/finance/pos/virtual/domain/services/payment-domain.service';
import {
  IIyzicoProvider,
  IYZICO_PROVIDER,
} from '@src/infrastructure/payment/providers/iyzico/domain/interfaces/iyzico.provider.interface';
import {
  IIyzicoTransactionRepository,
  IYZICO_TRANSACTION_REPOSITORY,
} from '@src/infrastructure/payment/providers/iyzico/domain/interfaces/iyzico-transaction.repository.interface';
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import {
  IPaymentEventPublisher,
  PAYMENT_EVENT_PUBLISHER,
} from '@modules/finance/pos/virtual/domain/interfaces/payment-event-publisher.interface';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '@modules/finance/pos/virtual/domain/repositories/payment.repository.interface';
import { InstallmentStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';

@CommandHandler(CancelPaymentCommand)
export class CancelPaymentHandler
  implements
    ICommandHandler<CancelPaymentCommand, CancelPaymentCommandResponse>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository,
    private readonly txManager: TransactionManager,
    @Inject(IYZICO_PROVIDER)
    private readonly iyzicoProvider: IIyzicoProvider,
    @Inject(IYZICO_TRANSACTION_REPOSITORY)
    private readonly iyzicoTransactionRepo: IIyzicoTransactionRepository,
    @Inject(PAYMENT_EVENT_PUBLISHER)
    private readonly paymentEventPublisher: IPaymentEventPublisher,
    private readonly paymentDomainService: PaymentDomainService
  ) {}

  async execute(
    command: CancelPaymentCommand
  ): Promise<CancelPaymentCommandResponse> {
    const {
      dto: { paymentId },
      ip,
    } = command;

    const payment =
      await this.paymentRepo.findPaymentWithInstallments(paymentId);
    if (!payment) {
      throw new NotFoundException(`Ödeme bulunamadı: paymentId=${paymentId}`);
    }

    this.paymentDomainService.paymentIsCompleteOrThrow(payment);

    const completedInstallment = payment.installments.find(
      (i) => i.status === InstallmentStatus.COMPLETED
    );
    if (!completedInstallment) {
      throw new BadRequestException(`Tamamlanmış taksit bulunamadı.`);
    }

    const iyzicoTx = await this.iyzicoTransactionRepo.findByInstallmentId(
      completedInstallment.id
    );
    if (!iyzicoTx?.iyzicoPaymentId) {
      throw new BadRequestException(
        `Bu ödeme için iyzico işlem kaydı bulunamadı.`
      );
    }

    const conversationId = randomUUID();

    const sdkResult = await this.iyzicoProvider.cancelPayment({
      conversationId,
      paymentId: iyzicoTx.iyzicoPaymentId,
      ip,
    });

    this.paymentDomainService.checkIyzicoSdkStatusOrThrow({
      status: sdkResult.status,
      paymentId,
      conversationId,
      sdkErrorMessage: sdkResult?.errorMessage,
    });

    await this.txManager.outboxRun(async () => {
      await this.paymentRepo.markInstallmentAsCancelled(
        completedInstallment.id
      );

      this.paymentEventPublisher.paymentCancelled({
        paymentId: payment.id,
        appointmentId: payment.appointmentId ?? null,
        clinicId: payment.clinicId,
        action: LogAction.PAYMENT_CANCELLED,
        type: LogType.INFO,
        details: 'Ödeme iptali başarılı',
      });
    });
  }
}
