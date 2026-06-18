import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { MarkInstallmentAsFailedCommand } from './mark-installment-as-failed.command';
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

@CommandHandler(MarkInstallmentAsFailedCommand)
export class MarkInstallmentAsFailedHandler
  implements ICommandHandler<MarkInstallmentAsFailedCommand, void>
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

  async execute(command: MarkInstallmentAsFailedCommand): Promise<void> {
    const { installmentId, details } = command;

    await this.txManager.outboxRun(async () => {
      const payment =
        await this.paymentQueryRepo.findByInstallmentId(installmentId);
      if (!payment)
        throw new NotFoundException(`Taksit bulunamadı: ${installmentId}`);

      payment.failInstallment(installmentId);
      await this.paymentCommandRepo.save(payment);

      // TODO: entity'de domainEvent fırlatılacak buradan kaldırılacak
      // Event sahipliği payment modülünde: başarısız ödeme olayı burada fırlatılır.
      this.paymentEventPublisher.paymentFailed({
        paymentId: payment.id,
        appointmentId: payment.appointmentId,
        clinicId: payment.clinicId,
        action: LogAction.PAYMENT_FAILED,
        type: LogType.ERROR,
        details: details ?? 'Ödeme başarısız',
      });
    });
  }
}
