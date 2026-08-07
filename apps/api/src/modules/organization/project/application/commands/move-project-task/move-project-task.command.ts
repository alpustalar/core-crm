import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import type { MoveProjectTask } from '@shared/modules/project/types/commands';

export class MoveProjectTaskCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly taskId: string;
      readonly data: MoveProjectTask;
      readonly ctx: IGetContext;
    }
  ) {}
}
