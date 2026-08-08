import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import type { CreateProjectPhase } from '@shared/modules/project/types/commands';

export class CreateProjectPhaseCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly projectId: string;
      readonly data: CreateProjectPhase;
      readonly ctx: IGetContext;
    }
  ) {}
}
