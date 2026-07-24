import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { MoveLeadToStage } from '@shared';

export class MoveLeadToStageCommand implements ICommand {
  constructor(
    public readonly payload: {
      leadId: string;
      data: MoveLeadToStage;
      ctx: IGetContext;
    }
  ) {}
}
