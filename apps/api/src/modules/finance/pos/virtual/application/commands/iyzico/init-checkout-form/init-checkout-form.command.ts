import { ICommand } from '@nestjs/cqrs';
import { InitCheckoutFormCommandResponse } from './init-checkout-form.response';
import { InitCheckoutFormDto } from '@shared';

export class InitCheckoutFormCommand implements ICommand {
  readonly __responseType!: InitCheckoutFormCommandResponse;

  constructor(
    public readonly dto: InitCheckoutFormDto,
    public readonly ip: string
  ) {}
}
