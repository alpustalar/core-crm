import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateCashRegister } from '@shared/modules/cash-register/types/commands';

export class CreateCashRegisterCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly data: CreateCashRegister,
    public readonly ctx: IGetContext
  ) {}
}
