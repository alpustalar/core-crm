import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
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
    const { installmentId } = command;
    const payment = await this.paymentRepo.findByInstallmentId(installmentId);
    if (!payment) throw new NotFoundException(`Taksit bulunamadı: ${installmentId}`);
    payment.completeInstallment(installmentId);
    await this.paymentRepo.save(payment);
  }
}
