import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import {
  CreatePaymentCommand,
  CreatePaymentCommandResponse,
} from './create-payment.command';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';
import { Payment } from '@modules/finance/payment/domain/entities/payment.entity';

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentHandler
  implements
    ICommandHandler<CreatePaymentCommand, CreatePaymentCommandResponse>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository
  ) {}

  async execute(
    command: CreatePaymentCommand
  ): Promise<CreatePaymentCommandResponse> {
    const { dto } = command;
    const paymentId = randomUUID();
    const installmentId = randomUUID();
    const currency = dto.currency ?? 'TRY';
    const amount = new Prisma.Decimal(dto.amount);

    const payment = Payment.create({
      id: paymentId,
      clinicId: dto.clinicId,
      patientId: dto.patientId,
      appointmentId: dto.appointmentId,
      providerId: dto.providerId,
      totalAmount: amount,
      currency,
      installments: [
        {
          id: installmentId,
          installmentNo: 1,
          amount,
          currency,
          method: dto.method,
          dueDate: dto.dueDate,
          note: dto.note,
        },
      ],
    });

    await this.paymentRepo.save(payment);
    return { paymentId, installmentId };
  }
}
