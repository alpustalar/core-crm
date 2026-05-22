import { ICommand } from '@nestjs/cqrs';
import { CancelPaymentCommandResponse } from './cancel-payment.response';
import { IGetContext } from '@common/decorators';
import { CancelPaymentDto } from '@shared';

export class CancelPaymentCommand implements ICommand {
  readonly __responseType!: CancelPaymentCommandResponse;

  constructor(
    public readonly dto: CancelPaymentDto,
    public readonly ip: string,
    public readonly ctx: IGetContext
  ) {}
}
