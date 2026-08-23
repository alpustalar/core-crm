import { ICommand } from '@nestjs/cqrs';
import { InitCheckoutFormCommandResponse } from './init-checkout-form.response';
import { InitCheckoutFormDto } from '@shared';
import { IGetContext } from '@common/decorators';

export class InitCheckoutFormCommand implements ICommand {
  readonly __responseType!: InitCheckoutFormCommandResponse;

  constructor(
    public readonly dto: InitCheckoutFormDto,
    public readonly ip: string,
    public readonly ctx: IGetContext
  ) {}
}
