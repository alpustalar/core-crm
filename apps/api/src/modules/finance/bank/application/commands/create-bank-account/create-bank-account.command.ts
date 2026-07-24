import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateBankAccount } from '@shared/modules/bank/types/commands';

export class CreateBankAccountCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly data: CreateBankAccount,
    public readonly ctx: IGetContext
  ) {}
}
