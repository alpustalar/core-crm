import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { UpdatePipelineStage } from '@shared/modules/pipeline';

export class UpdatePipelineStageCommand implements ICommand {
  readonly __responseType!: void;
  constructor(
    public readonly payload: {
      stageId: string;
      data: UpdatePipelineStage;
      ctx: IGetContext;
    }
  ) {}
}
