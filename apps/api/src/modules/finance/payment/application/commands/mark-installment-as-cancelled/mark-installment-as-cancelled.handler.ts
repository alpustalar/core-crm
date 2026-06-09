import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
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
    const { installmentId } = command;
    const payment = await this.paymentRepo.findByInstallmentId(installmentId);
    if (!payment) throw new NotFoundException(`Taksit bulunamadı: ${installmentId}`);
    payment.cancelInstallment(installmentId);
    await this.paymentRepo.save(payment);
  }
}
