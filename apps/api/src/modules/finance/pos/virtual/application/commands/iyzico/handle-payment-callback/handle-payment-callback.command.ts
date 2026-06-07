import { ICommand } from '@nestjs/cqrs';
import { HandlePaymentCallbackCommandResponse } from './handle-payment-callback.response';

export class HandlePaymentCallbackCommand implements ICommand {
  readonly __responseType!: HandlePaymentCallbackCommandResponse;

  constructor(
    public readonly token: string,
    public readonly conversationId: string,
    public readonly signature: string
  ) {}
}
