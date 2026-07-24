import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class CheckOutCommand implements ICommand {
  constructor(
    public readonly employeeId: string,
    public readonly ctx: IGetContext
  ) {}
}
