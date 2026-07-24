import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateActivity } from '@shared/modules/activity';

export class CreateActivityCommand implements ICommand {
  constructor(
    public readonly data: CreateActivity,
    public readonly ctx: IGetContext
  ) {}
}
