import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class CancelLeaveCommand implements ICommand {
  constructor(
    public readonly leaveId: string,
    public readonly ctx: IGetContext
  ) {}
}
