import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import type { AssignProjectTask } from '@shared/modules/project/types/commands';

export class AssignProjectTaskCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly taskId: string;
      readonly data: AssignProjectTask;
      readonly ctx: IGetContext;
    }
  ) {}
}
