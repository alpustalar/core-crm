import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import type { ChangeProjectStatus } from '@shared/modules/project/types/commands';

export class ChangeProjectStatusCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly projectId: string;
      readonly data: ChangeProjectStatus;
      readonly ctx: IGetContext;
    }
  ) {}
}
