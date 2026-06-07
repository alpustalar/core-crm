import { ICommand } from '@nestjs/cqrs';
import { RefundPaymentCommandResponse } from './refund-payment.response';

export class RefundPaymentCommand implements ICommand {
  readonly __responseType!: RefundPaymentCommandResponse;

  constructor(
    public readonly paymentId: string,
    public readonly ip: string
  ) {}
}
