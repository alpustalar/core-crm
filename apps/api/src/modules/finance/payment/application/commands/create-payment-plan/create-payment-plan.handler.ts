import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePaymentPlanCommand } from './create-payment-plan.command';
import { CreatePaymentPlanCommandResponse } from './create-payment-plan.response';

import { Inject } from '@nestjs/common';
import { Payment } from '@modules/finance/payment/domain/entities/payment.entity';
import { Money } from '@src/domain/value-objects/money.vo';
import {
  IPaymentCommandRepository,
  PAYMENT_COMMAND_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment/payment.command.repository';

@CommandHandler(CreatePaymentPlanCommand)
export class CreatePaymentPlanHandler
  implements
    ICommandHandler<CreatePaymentPlanCommand, CreatePaymentPlanCommandResponse>
{
  constructor(
    @Inject(PAYMENT_COMMAND_REPOSITORY)
    private readonly paymentRepo: IPaymentCommandRepository
  ) {}

  async execute(
    command: CreatePaymentPlanCommand
  ): Promise<CreatePaymentPlanCommandResponse> {
    const { dto } = command;

    const installmentsData = dto.installments.map((inst, idx) => ({
      id: crypto.randomUUID(),
      installmentNo: idx + 1,
      money: Money.create(inst.amount, dto.currency).orThrow(),
      method: inst.method,
      dueDate: inst.dueDate,
      note: inst.note,
    }));

    const calculatedTotalMoney = installmentsData
      .map((inst) => inst.money)
      .reduce((total, current) => total.add(current));

    calculatedTotalMoney.validate.greaterThanZero.orThrow(
      'Ödeme planı toplam tutarı sıfırdan büyük olmalıdır.'
    );

    const payment = Payment.create({
      totalAmount: calculatedTotalMoney,
      clinicId: dto.clinicId,
      patientId: dto.patientId,
      appointmentId: dto.appointmentId,
      providerId: dto.providerId,
      installments: installmentsData,
    });

    const savedPayment = await this.paymentRepo.create(payment);
    return savedPayment.id;
  }
}
