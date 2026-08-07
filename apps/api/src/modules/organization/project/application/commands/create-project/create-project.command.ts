import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import type { CreateProject } from '@shared/modules/project/types/commands';

export class CreateProjectCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly data: CreateProject;
      readonly ctx: IGetContext;
    }
  ) {}
}
