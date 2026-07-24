import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class ArchiveBankAccountCommand implements ICommand {
  constructor(
    public readonly accountId: string,
    public readonly ctx: IGetContext
  ) {}
}
