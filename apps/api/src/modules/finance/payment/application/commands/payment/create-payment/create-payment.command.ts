import { ICommand } from '@nestjs/cqrs';

export type CreatePaymentCommandDto = {
  clinicId: string;
  patientId: string;
  amount: number;
  currency?: string;
  providerId?: string;
};

export class CreatePaymentCommand implements ICommand {
  readonly __responseType!: string;

  constructor(public readonly dto: CreatePaymentCommandDto) {}
}
