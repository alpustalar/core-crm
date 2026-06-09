import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
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
    const { installmentId } = command;
    const payment = await this.paymentRepo.findByInstallmentId(installmentId);
    if (!payment)
      throw new NotFoundException(`Taksit bulunamadı: ${installmentId}`);
    payment.failInstallment(installmentId);
    await this.paymentRepo.save(payment);
  }
}
