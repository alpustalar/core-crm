import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import type { CreateProjectTask } from '@shared/modules/project/types/commands';

export class CreateProjectTaskCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly projectId: string;
      readonly data: CreateProjectTask;
      readonly ctx: IGetContext;
    }
  ) {}
}
