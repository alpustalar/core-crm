import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import InstallmentStatusSchema from '@input-type-schemas/InstallmentStatusSchema';
import { MarkInstallmentAsRefundedCommand } from '@modules/finance/payment/application/commands/mark-installment-as-refunded/mark-installment-as-refunded.command';
import { GetPaymentWithInstallmentsQuery } from '@modules/finance/payment/application/queries/get-payment-with-installments/get-payment-with-installments.query';
import {
  IPaymentEventPublisher,
  PAYMENT_EVENT_PUBLISHER,
} from '@modules/finance/payment/domain/interfaces/payment-event-publisher.interface';
import { PaymentGuard } from '@modules/finance/payment/domain/value-objects/payment-guard.vo';
import { IyzicoResultGuard } from '@modules/finance/pos/virtual/domain/value-objects/iyzico-result-guard.vo';
import {
  IIyzicoTransactionCommandRepository,
  IIyzicoTransactionQueryRepository,
  IYZICO_TRANSACTION_COMMAND_REPOSITORY,
  IYZICO_TRANSACTION_QUERY_REPOSITORY,
} from '@modules/finance/pos/virtual/domain/repositories/iyzico-transaction.repository.interface';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CompletedInstallmentNotFoundException,
  PaymentNotFoundException,
} from '@modules/finance/payment/domain/exceptions/payment.exceptions';
import { IyzicoPaymentRecordNotFoundException } from '@modules/finance/pos/virtual/domain/exceptions/iyzico.exceptions';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import {
  IIyzicoProvider,
  IYZICO_PROVIDER,
} from '@src/infrastructure/payment/pos/virtual/providers/iyzico/domain/interfaces/iyzico.provider.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { randomUUID } from 'crypto';
import { RefundPaymentCommand } from './refund-payment.command';
import { RefundPaymentCommandResponse } from './refund-payment.response';

@CommandHandler(RefundPaymentCommand)
export class RefundPaymentHandler
  implements
    ICommandHandler<RefundPaymentCommand, RefundPaymentCommandResponse>
{
  constructor(
    @Inject(IYZICO_PROVIDER)
    private readonly iyzicoProvider: IIyzicoProvider,
    @Inject(IYZICO_TRANSACTION_QUERY_REPOSITORY)
    private readonly iyzicoQueryRepo: IIyzicoTransactionQueryRepository,
    @Inject(IYZICO_TRANSACTION_COMMAND_REPOSITORY)
    private readonly iyzicoCommandRepo: IIyzicoTransactionCommandRepository,
    @Inject(PAYMENT_EVENT_PUBLISHER)
    private readonly paymentEventPublisher: IPaymentEventPublisher,
    private readonly txManager: TransactionManager,
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    command: RefundPaymentCommand
  ): Promise<RefundPaymentCommandResponse> {
    const { paymentId, ip } = command;

    const { data: payment } = await this.queryBus.execute(
      new GetPaymentWithInstallmentsQuery(paymentId)
    );
    if (!payment) throw new PaymentNotFoundException(paymentId);

    PaymentGuard.of(payment).validate.refundEligibility().orThrow();

    const completedInstallment = payment.installments.find(
      (i) => i.status === InstallmentStatusSchema.enum.COMPLETED
    );
    if (!completedInstallment) {
      throw new CompletedInstallmentNotFoundException();
    }

    const iyzicoTx = await this.iyzicoQueryRepo.findByInstallmentId(
      completedInstallment.id
    );
    if (!iyzicoTx?.iyzicoPaymentTransactionId) {
      throw new IyzicoPaymentRecordNotFoundException(
        'Bu ödeme için iyzico işlem transaction kaydı bulunamadı.'
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

    IyzicoResultGuard.of({
      status: sdkResult.status,
      errorMessage: sdkResult.errorMessage,
    })
      .assertSuccess()
      .orThrow();

    await this.txManager.outboxRun(async () => {
      iyzicoTx.markAsRefunded({ rawResponse: sdkResult });
      await this.iyzicoCommandRepo.save(iyzicoTx);

      await this.commandBus.execute(
        new MarkInstallmentAsRefundedCommand(completedInstallment.id)
      );

      // TODO: entity oluşturulacak. event entity içinde addDomainEvent ile pushlanacak save ile flush edilecek
      this.paymentEventPublisher.paymentRefund({
        installmentId: completedInstallment?.id,
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
