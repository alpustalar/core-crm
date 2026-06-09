import { ICommand } from '@nestjs/cqrs';
import { CreatePaymentDto } from '@shared/modules/payment/dto';

export interface CreatePaymentCommandResponse {
  paymentId: string;
  installmentId: string;
}

export class CreatePaymentCommand implements ICommand {
  readonly __responseType!: CreatePaymentCommandResponse;

  constructor(public readonly dto: CreatePaymentDto) {}
}
