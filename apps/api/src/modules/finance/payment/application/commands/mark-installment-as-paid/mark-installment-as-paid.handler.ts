import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { InstallmentNotFoundException } from '@modules/finance/payment/domain/exceptions/payment.exceptions';
import { MarkInstallmentAsPaidCommand } from './mark-installment-as-paid.command';
import {
  IPaymentCommandRepository,
  IPaymentQueryRepository,
  PAYMENT_COMMAND_REPOSITORY,
  PAYMENT_QUERY_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';
import {
  IPaymentEventPublisher,
  PAYMENT_EVENT_PUBLISHER,
} from '@modules/finance/payment/domain/interfaces/payment-event-publisher.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';

@CommandHandler(MarkInstallmentAsPaidCommand)
export class MarkInstallmentAsPaidHandler
  implements ICommandHandler<MarkInstallmentAsPaidCommand, void>
{
  constructor(
    @Inject(PAYMENT_QUERY_REPOSITORY)
    private readonly paymentQueryRepo: IPaymentQueryRepository,
    @Inject(PAYMENT_COMMAND_REPOSITORY)
    private readonly paymentCommandRepo: IPaymentCommandRepository,
    @Inject(PAYMENT_EVENT_PUBLISHER)
    private readonly paymentEventPublisher: IPaymentEventPublisher,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: MarkInstallmentAsPaidCommand): Promise<void> {
    const { installmentId, details } = command;

    await this.txManager.outboxRun(async () => {
      const payment =
        await this.paymentQueryRepo.findByInstallmentId(installmentId);
      if (!payment) throw new InstallmentNotFoundException(installmentId);

      payment.completeInstallment(installmentId);
      await this.paymentCommandRepo.save(payment);

      // Event sahipliği payment modülünde: tahsilat olayı burada fırlatılır.
      // TODO: event domain event olarak completeInstallment içinde fırlatılacak
      this.paymentEventPublisher.paymentPaid({
        installmentId,
        paymentId: payment.id.value,
        appointmentId: payment.appointmentId?.value ?? null,
        clinicId: payment.clinicId.value,
        action: LogAction.PAYMENT_SUCCESS,
        type: LogType.INFO,
        details: details ?? 'Ödeme tahsil edildi',
      });
    });
  }
}
