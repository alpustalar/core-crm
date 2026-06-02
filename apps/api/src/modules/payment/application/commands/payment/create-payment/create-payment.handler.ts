import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreatePaymentCommand } from './create-payment.command';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '@modules/payment/domain/repositories/payment.repository.interface';

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentHandler
  implements ICommandHandler<CreatePaymentCommand, string>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository,
  ) {}

  async execute(command: CreatePaymentCommand): Promise<string> {
    const { dto } = command;
    const payment = await this.paymentRepo.createSinglePayment({
      clinicId: dto.clinicId,
      patientId: dto.patientId,
      amount: dto.amount,
      currency: dto.currency ?? 'TRY',
      providerId: dto.providerId,
    });
    return payment.id;
  }
}
