import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import type { UpdateProjectTask } from '@shared/modules/project/types/commands';

export class UpdateProjectTaskCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly taskId: string;
      readonly data: UpdateProjectTask;
      readonly ctx: IGetContext;
    }
  ) {}
}
