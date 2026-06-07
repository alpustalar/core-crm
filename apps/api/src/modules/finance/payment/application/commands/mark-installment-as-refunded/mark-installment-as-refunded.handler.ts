import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MarkInstallmentAsRefundedCommand } from './mark-installment-as-refunded.command';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';

@CommandHandler(MarkInstallmentAsRefundedCommand)
export class MarkInstallmentAsRefundedHandler
  implements ICommandHandler<MarkInstallmentAsRefundedCommand, void>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository
  ) {}

  async execute(command: MarkInstallmentAsRefundedCommand): Promise<void> {
    await this.paymentRepo.markInstallmentAsRefunded(command.installmentId);
  }
}
