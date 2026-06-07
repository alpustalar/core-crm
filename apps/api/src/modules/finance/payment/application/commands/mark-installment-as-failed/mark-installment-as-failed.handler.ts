import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MarkInstallmentAsFailedCommand } from './mark-installment-as-failed.command';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';

@CommandHandler(MarkInstallmentAsFailedCommand)
export class MarkInstallmentAsFailedHandler
  implements ICommandHandler<MarkInstallmentAsFailedCommand, void>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository
  ) {}

  async execute(command: MarkInstallmentAsFailedCommand): Promise<void> {
    await this.paymentRepo.markInstallmentAsFailed(command.installmentId);
  }
}
