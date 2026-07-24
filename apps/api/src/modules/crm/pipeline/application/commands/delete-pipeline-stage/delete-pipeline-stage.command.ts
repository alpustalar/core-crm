import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class DeletePipelineStageCommand implements ICommand {
  readonly __responseType!: void;
  constructor(
    public readonly stageId: string,
    public readonly ctx: IGetContext
  ) {}
}
