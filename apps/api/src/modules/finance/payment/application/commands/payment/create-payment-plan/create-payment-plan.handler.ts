import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePaymentPlanCommand } from './create-payment-plan.command';
import { CreatePaymentPlanCommandResponse } from './create-payment-plan.response';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';
import { Inject } from '@nestjs/common';

@CommandHandler(CreatePaymentPlanCommand)
export class CreatePaymentPlanHandler
  implements
    ICommandHandler<CreatePaymentPlanCommand, CreatePaymentPlanCommandResponse>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository
  ) {}

  async execute(
    command: CreatePaymentPlanCommand
  ): Promise<CreatePaymentPlanCommandResponse> {
    const { dto } = command;
    return this.paymentRepo.createInstallmentPlan({
      clinicId: dto.clinicId,
      patientId: dto.patientId,
      appointmentId: dto.appointmentId,
      providerId: dto.providerId,
      currency: dto.currency ?? 'TRY',
      installments: dto.installments,
    });
  }
}
