import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelPaymentCommand } from './cancel-payment.command';
import { CancelPaymentCommandResponse } from './cancel-payment.response';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { PaymentGuard } from '@modules/finance/payment/domain/value-objects/payment-guard.vo';
import { IyzicoResultGuard } from '@modules/finance/pos/virtual/domain/value-objects/iyzico-result-guard.vo';
import {
  IIyzicoProvider,
  IYZICO_PROVIDER,
} from '@src/infrastructure/payment/pos/virtual/providers/iyzico/domain/interfaces/iyzico.provider.interface';

import { Inject } from '@nestjs/common';
import {
  CompletedInstallmentNotFoundException,
  PaymentNotFoundException,
} from '@modules/finance/payment/domain/exceptions/payment.exceptions';
import { IyzicoPaymentRecordNotFoundException } from '@modules/finance/pos/virtual/domain/exceptions/iyzico.exceptions';
import {
  IPaymentEventPublisher,
  PAYMENT_EVENT_PUBLISHER,
} from '@modules/finance/payment/domain/interfaces/payment-event-publisher.interface';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetPaymentWithInstallmentsQuery } from '@modules/finance/payment/application/queries/get-payment-with-installments/get-payment-with-installments.query';
import { MarkInstallmentAsCancelledCommand } from '@modules/finance/payment/application/commands/mark-installment-as-cancelled/mark-installment-as-cancelled.command';
import InstallmentStatusSchema from '@input-type-schemas/InstallmentStatusSchema';
import {
  IIyzicoTransactionQueryRepository,
  IYZICO_TRANSACTION_QUERY_REPOSITORY,
} from '@modules/finance/pos/virtual/domain/repositories/iyzico-transaction.repository.interface';
import { UUID } from '@src/domain/value-objects/uuid.vo';

@CommandHandler(CancelPaymentCommand)
export class CancelPaymentHandler
  implements
    ICommandHandler<CancelPaymentCommand, CancelPaymentCommandResponse>
{
  constructor(
    private readonly txManager: TransactionManager,
    @Inject(IYZICO_PROVIDER)
    private readonly iyzicoProvider: IIyzicoProvider,
    @Inject(IYZICO_TRANSACTION_QUERY_REPOSITORY)
    private readonly iyzicoQueryRepo: IIyzicoTransactionQueryRepository,
    @Inject(PAYMENT_EVENT_PUBLISHER)
    private readonly paymentEventPublisher: IPaymentEventPublisher,
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    command: CancelPaymentCommand
  ): Promise<CancelPaymentCommandResponse> {
    const {
      dto: { paymentId },
      ip,
    } = command;

    const { data: payment } = await this.queryBus.execute(
      new GetPaymentWithInstallmentsQuery(paymentId)
    );
    if (!payment) {
      throw new PaymentNotFoundException(paymentId);
    }

    PaymentGuard.of(payment).validate.isComplete().orThrow();

    const completedInstallment = payment.installments.find(
      (i) => i.status === InstallmentStatusSchema.enum.COMPLETED
    );
    if (!completedInstallment) {
      throw new CompletedInstallmentNotFoundException();
    }

    const iyzicoTx = await this.iyzicoQueryRepo.findByInstallmentId(
      completedInstallment.id
    );

    if (!iyzicoTx?.iyzicoPaymentId) {
      throw new IyzicoPaymentRecordNotFoundException();
    }

    const conversationId = UUID.generate();

    const sdkResult = await this.iyzicoProvider.cancelPayment({
      conversationId: conversationId.value,
      paymentId: iyzicoTx.iyzicoPaymentId,
      ip,
    });

    IyzicoResultGuard.of({
      status: sdkResult.status,
      errorMessage: sdkResult?.errorMessage,
    })
      .assertSuccess()
      .orThrow();

    await this.txManager.outboxRun(async () => {
      await this.commandBus.execute(
        new MarkInstallmentAsCancelledCommand(completedInstallment.id)
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
