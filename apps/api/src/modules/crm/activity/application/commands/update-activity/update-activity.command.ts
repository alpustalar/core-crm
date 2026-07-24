import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { UpdateActivity } from '@shared/modules/activity';

export class UpdateActivityCommand implements ICommand {
  constructor(
    public readonly payload: {
      activityId: string;
      data: UpdateActivity;
      ctx: IGetContext;
    }
  ) {}
}
