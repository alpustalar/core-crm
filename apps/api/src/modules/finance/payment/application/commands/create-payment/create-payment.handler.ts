import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  CreatePaymentCommand,
  CreatePaymentCommandResponse,
} from './create-payment.command';
import {
  IPaymentCommandRepository,
  PAYMENT_COMMAND_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';
import { Payment } from '@modules/finance/payment/domain/entities/payment.entity';
import { Money, UUID } from '@src/domain/value-objects';

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentHandler
  implements
    ICommandHandler<CreatePaymentCommand, CreatePaymentCommandResponse>
{
  constructor(
    @Inject(PAYMENT_COMMAND_REPOSITORY)
    private readonly paymentCommandRepo: IPaymentCommandRepository
  ) {}

  async execute(
    command: CreatePaymentCommand
  ): Promise<CreatePaymentCommandResponse> {
    const { data, internalRelations } = command;
    const paymentId = UUID.createOrGenerate(internalRelations?.paymentId);
    const installmentId = UUID.createOrGenerate(
      internalRelations?.installmentId
    );

    const totalAmount = Money.create(data.amount, data.currency).orThrow();

    const payment = Payment.create({
      id: paymentId.value,
      clinicId: data.clinicId,
      patientId: data.patientId,
      appointmentId: data.appointmentId,
      providerId: data.providerId,
      totalAmount: totalAmount,
      installments: [
        {
          id: installmentId.value,
          installmentNo: 1,
          money: totalAmount,
          method: data.method,
          dueDate: data.dueDate,
          note: data.note,
        },
      ],
    });

    const savedPayment = await this.paymentCommandRepo.create(payment);
    return savedPayment.id.value;
  }
}
