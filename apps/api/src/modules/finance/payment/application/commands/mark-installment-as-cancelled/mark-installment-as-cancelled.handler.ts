import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MarkInstallmentAsCancelledCommand } from './mark-installment-as-cancelled.command';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';

@CommandHandler(MarkInstallmentAsCancelledCommand)
export class MarkInstallmentAsCancelledHandler
  implements ICommandHandler<MarkInstallmentAsCancelledCommand, void>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository
  ) {}

  async execute(command: MarkInstallmentAsCancelledCommand): Promise<void> {
    await this.paymentRepo.markInstallmentAsCancelled(command.installmentId);
  }
}
