import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import type { UpdateProjectPhase } from '@shared/modules/project/types/commands';

export class UpdateProjectPhaseCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly phaseId: string;
      readonly data: UpdateProjectPhase;
      readonly ctx: IGetContext;
    }
  ) {}
}
