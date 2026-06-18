import { ICommand } from '@nestjs/cqrs';
import { CreatePaymentPlanCommandResponse } from './create-payment-plan.response';
import { PaymentMethodType as PaymentMethod } from '@input-type-schemas/PaymentMethodSchema';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

export type InstallmentDto = {
  amount: number;
  method: PaymentMethod;
  dueDate?: Date;
  note?: string;
  installmentNo: number;
};

export type CreatePaymentPlanDto = {
  clinicId: string;
  patientId: string;
  appointmentId?: string;
  providerId?: string;
  currency: CurrencyType;
  installments: InstallmentDto[];
};

export class CreatePaymentPlanCommand implements ICommand {
  readonly __responseType!: CreatePaymentPlanCommandResponse;

  constructor(public readonly dto: CreatePaymentPlanDto) {}
}
