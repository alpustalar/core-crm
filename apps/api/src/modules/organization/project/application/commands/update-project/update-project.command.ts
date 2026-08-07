import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import type { UpdateProject } from '@shared/modules/project/types/commands';

export class UpdateProjectCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly projectId: string;
      readonly data: UpdateProject;
      readonly ctx: IGetContext;
    }
  ) {}
}
