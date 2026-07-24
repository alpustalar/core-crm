import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { AddPipelineStage } from '@shared/modules/pipeline';

export class AddPipelineStageCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly payload: {
      pipelineId: string;
      data: AddPipelineStage;
      ctx: IGetContext;
    }
  ) {}
}
