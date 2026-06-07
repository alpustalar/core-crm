import { ICommand } from '@nestjs/cqrs';

export type CreatePaymentCommandDto = {
  clinicId: string;
  patientId: string;
  amount: number;
  currency?: string;
  providerId?: string;
  appointmentId?: string;
};

export interface CreatePaymentCommandResponse {
  paymentId: string;
  installmentId: string;
}

export class CreatePaymentCommand implements ICommand {
  readonly __responseType!: CreatePaymentCommandResponse;

  constructor(public readonly dto: CreatePaymentCommandDto) {}
}
