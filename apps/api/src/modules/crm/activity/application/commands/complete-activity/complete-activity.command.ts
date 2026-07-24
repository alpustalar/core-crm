import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class CompleteActivityCommand implements ICommand {
  constructor(
    public readonly activityId: string,
    public readonly ctx: IGetContext
  ) {}
}
