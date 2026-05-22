import { ICommand } from '@nestjs/cqrs';
import { CreatePaymentPlanCommandResponse } from './create-payment-plan.response';
import { PaymentMethod } from '@prisma/client';

export type InstallmentDto = {
  amount: number;
  method: PaymentMethod;
  dueDate?: Date;
  note?: string;
};

export type CreatePaymentPlanDto = {
  clinicId: string;
  patientId: string;
  appointmentId?: string;
  providerId?: string;
  currency?: string;
  installments: InstallmentDto[];
};

export class CreatePaymentPlanCommand implements ICommand {
  readonly __responseType!: CreatePaymentPlanCommandResponse;

  constructor(public readonly dto: CreatePaymentPlanDto) {}
}
