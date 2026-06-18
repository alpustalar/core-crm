import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefundPaymentCommand } from './refund-payment.command';
import { RefundPaymentCommandResponse } from './refund-payment.response';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import {
  IIyzicoProvider,
  IYZICO_PROVIDER,
} from '@src/infrastructure/payment/providers/iyzico/domain/interfaces/iyzico.provider.interface';
import {
  IIyzicoTransactionRepository,
  IYZICO_TRANSACTION_REPOSITORY,
} from '@src/infrastructure/payment/providers/iyzico/domain/interfaces/iyzico-transaction.repository.interface';
import { PaymentDomainService } from '@modules/finance/payment/domain/services/payment-domain.service';
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import {
  IPaymentEventPublisher,
  PAYMENT_EVENT_PUBLISHER,
} from '@modules/finance/payment/domain/interfaces/payment-event-publisher.interface';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetPaymentWithInstallmentsQuery } from '@modules/finance/payment/application/queries/get-payment-with-installments/get-payment-with-installments.query';
import { MarkInstallmentAsRefundedCommand } from '@modules/finance/payment/application/commands/mark-installment-as-refunded/mark-installment-as-refunded.command';
import InstallmentStatusSchema from '@input-type-schemas/InstallmentStatusSchema';

@CommandHandler(RefundPaymentCommand)
export class RefundPaymentHandler
  implements
    ICommandHandler<RefundPaymentCommand, RefundPaymentCommandResponse>
{
  constructor(
    @Inject(IYZICO_PROVIDER)
    private readonly iyzicoProvider: IIyzicoProvider,
    @Inject(IYZICO_TRANSACTION_REPOSITORY)
    private readonly iyzicoTransactionRepo: IIyzicoTransactionRepository,
    @Inject(PAYMENT_EVENT_PUBLISHER)
    private readonly paymentEventPublisher: IPaymentEventPublisher,
    private readonly paymentDomainService: PaymentDomainService,
    private readonly txManager: TransactionManager,
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    command: RefundPaymentCommand
  ): Promise<RefundPaymentCommandResponse> {
    const { paymentId, ip } = command;

    const payment = await this.queryBus.execute(
      new GetPaymentWithInstallmentsQuery(paymentId)
    );
    if (!payment) {
      throw new NotFoundException(`Ödeme bulunamadı: paymentId=${paymentId}`);
    }

    this.paymentDomainService.validateRefundEligibilityOrThrow(payment);

    const completedInstallment = payment.installments.find(
      (i) => i.status === InstallmentStatusSchema.enum.COMPLETED
    );
    if (!completedInstallment) {
      throw new BadRequestException(`Tamamlanmış taksit bulunamadı.`);
    }

    const iyzicoTx = await this.iyzicoTransactionRepo.findByInstallmentId(
      completedInstallment.id
    );
    if (!iyzicoTx?.iyzicoPaymentTransactionId) {
      throw new BadRequestException(
        `Bu ödeme için iyzico işlem transaction kaydı bulunamadı.`
      );
    }

    const conversationId = randomUUID();

    const sdkResult = await this.iyzicoProvider.refund({
      locale: 'TR',
      conversationId,
      paymentTransactionId: iyzicoTx.iyzicoPaymentTransactionId,
      price: completedInstallment.amount.toString(),
      ip,
      currency: 'TRY',
    });

    this.paymentDomainService.checkIyzicoSdkStatusOrThrow({
      paymentId,
      conversationId,
      sdkErrorMessage: sdkResult.errorMessage,
      status: sdkResult.status,
    });

    await this.txManager.outboxRun(async () => {
      await this.iyzicoTransactionRepo.markAsRefunded({
        iyzicoTransactionId: iyzicoTx.id,
        rawResponse: sdkResult,
      });

      await this.commandBus.execute(
        new MarkInstallmentAsRefundedCommand(completedInstallment.id)
      );

      // TODO: entity oluşturulacak. event entity içinde addDomainEvent ile pushlanacak save ile flush edilecek
      this.paymentEventPublisher.paymentRefund({
        installmentId: completedInstallment.id,
        paymentId: payment.id,
        appointmentId: payment.appointmentId ?? null,
        clinicId: payment.clinicId,
        action: LogAction.PAYMENT_REFUNDED,
        type: LogType.INFO,
        details: '',
      });
    });
  }
}
