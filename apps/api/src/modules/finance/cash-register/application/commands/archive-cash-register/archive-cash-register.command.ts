import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class ArchiveCashRegisterCommand implements ICommand {
  constructor(
    public readonly registerId: string,
    public readonly ctx: IGetContext
  ) {}
}
