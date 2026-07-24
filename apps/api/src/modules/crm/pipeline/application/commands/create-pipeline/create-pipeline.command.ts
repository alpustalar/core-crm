import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreatePipeline } from '@shared/modules/pipeline';

export class CreatePipelineCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly data: CreatePipeline,
    public readonly ctx: IGetContext
  ) {}
}
