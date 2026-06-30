import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  CreatePaymentCommand,
  CreatePaymentCommandResponse,
} from './create-payment.command';
import {
  IPaymentCommandRepository,
  PAYMENT_COMMAND_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';
import { Payment } from '@modules/finance/payment/domain/entities/payment.entity';
import { Decimal } from 'decimal.js';
import { Money } from '@src/domain/value-objects/money.vo';

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
    const { dto, internalRelations } = command;
    const paymentId = internalRelations?.paymentId ?? randomUUID();
    const installmentId = internalRelations?.installmentId ?? randomUUID();
    const amount = new Decimal(dto.amount);
    const totalAmount = Money.create(amount, dto.currency).orThrow();

    const payment = Payment.create({
      id: paymentId,
      clinicId: dto.clinicId,
      patientId: dto.patientId,
      appointmentId: dto.appointmentId,
      providerId: dto.providerId,
      totalAmount: totalAmount,
      installments: [
        {
          id: installmentId,
          installmentNo: 1,
          money: totalAmount,
          method: dto.method,
          dueDate: dto.dueDate,
          note: dto.note,
        },
      ],
    });

    const savedPayment = await this.paymentCommandRepo.save(payment);
    return savedPayment.id.value;
  }
}
