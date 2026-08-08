import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import InstallmentStatusSchema from '@input-type-schemas/InstallmentStatusSchema';
import { MarkInstallmentAsRefundedCommand } from '@modules/finance/payment/application/commands/mark-installment-as-refunded/mark-installment-as-refunded.command';
import { GetPaymentWithInstallmentsQuery } from '@modules/finance/payment/application/queries/get-payment-with-installments/get-payment-with-installments.query';
import {
  IPaymentEventPublisher,
  PAYMENT_EVENT_PUBLISHER,
} from '@modules/finance/payment/domain/interfaces/payment-event-publisher.interface';
import { IyzicoResultGuard } from '@src/domain/value-objects/iyzico-result-guard.vo';
import {
  IIyzicoTransactionCommandRepository,
  IYZICO_TRANSACTION_COMMAND_REPOSITORY,
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
} from '@src/infrastructure/payment/pos/virtual/providers/iyzico/interfaces/iyzico.provider.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { RefundPaymentCommand } from './refund-payment.command';
import { RefundPaymentCommandResponse } from './refund-payment.response';
import { Currency, UUID } from '@src/domain/value-objects';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';

@CommandHandler(RefundPaymentCommand)
export class RefundPaymentHandler
  implements
    ICommandHandler<RefundPaymentCommand, RefundPaymentCommandResponse>
{
  constructor(
    @Inject(IYZICO_PROVIDER)
    private readonly iyzicoProvider: IIyzicoProvider,
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

    const ctx = ExecutionContextFactory.createInternal();

    const { data: payment } = await this.queryBus.execute(
      new GetPaymentWithInstallmentsQuery(paymentId)
    );
    if (!payment) throw new PaymentNotFoundException(paymentId);

    const completedInstallment = payment.installments.find(
      (i) => i.status === InstallmentStatusSchema.enum.COMPLETED
    );

    if (!completedInstallment)
      throw new CompletedInstallmentNotFoundException();

    // İade çağrısı için dış referans (paymentTransactionId). Okuma command repo'dan:
    // kayıt az önce yazılmış olabilir, replica gecikmesi iadeyi "kayıt yok" diye
    // reddederdi. Kilit burada anlamsız — SDK çağrısı transaction dışında olmalı.
    const iyzicoTx = await this.iyzicoCommandRepo.findByInstallmentId(
      completedInstallment.id
    );

    if (!iyzicoTx?.iyzicoPaymentTransactionId) {
      throw new IyzicoPaymentRecordNotFoundException(
        'Bu ödeme için iyzico işlem transaction kaydı bulunamadı.'
      );
    }

    const generatedConversationUUID = UUID.generate();

    const sdkResult = await this.iyzicoProvider.refund({
      locale: 'TR',
      conversationId: generatedConversationUUID.value,
      paymentTransactionId: iyzicoTx.iyzicoPaymentTransactionId,
      price: completedInstallment.amount.toString(),
      ip,
      currency: Currency.enum.TRY,
    });

    IyzicoResultGuard.create({
      status: sdkResult.status,
      errorMessage: sdkResult.errorMessage,
    })
      .isSuccess()
      .orThrow();

    await this.txManager.outboxRun(async () => {
      // SDK çağrısı sürerken callback/webhook aynı kaydı güncellemiş olabilir;
      // yukarıdaki kopyayı geri yazmak onu ezerdi. Kilitli ve taze okunur.
      const lockedTx =
        await this.iyzicoCommandRepo.findByInstallmentIdForUpdate(
          completedInstallment.id
        );
      if (!lockedTx) {
        throw new IyzicoPaymentRecordNotFoundException(
          'Bu ödeme için iyzico işlem transaction kaydı bulunamadı.'
        );
      }

      lockedTx.markAsRefunded({ rawResponse: sdkResult });
      await this.iyzicoCommandRepo.update(lockedTx);

      await this.commandBus.execute(
        new MarkInstallmentAsRefundedCommand({
          installmentId: completedInstallment.id,
          ctx,
        })
      );

      // TODO: event entity içinde addDomainEvent ile pushlanacak save ile flush edilecek. payment event publisherı çağrılmayacak. buraya başka bir listener ve duruma göre producer ve processor yazılacak ve işlem öyle tamamlanacak
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
