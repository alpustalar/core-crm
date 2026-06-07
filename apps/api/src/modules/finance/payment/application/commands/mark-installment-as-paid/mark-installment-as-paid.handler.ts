import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MarkInstallmentAsPaidCommand } from './mark-installment-as-paid.command';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';

@CommandHandler(MarkInstallmentAsPaidCommand)
export class MarkInstallmentAsPaidHandler
  implements ICommandHandler<MarkInstallmentAsPaidCommand, void>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository
  ) {}

  async execute(command: MarkInstallmentAsPaidCommand): Promise<void> {
    await this.paymentRepo.markInstallmentAsPaid(command.installmentId);
  }
}
