import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetPipelineByIdResponse } from './get-pipeline-by-id.response';

export class GetPipelineByIdQuery implements IQuery {
  readonly __responseType!: GetPipelineByIdResponse;
  constructor(
    public readonly pipelineId: string,
    public readonly ctx: IGetContext
  ) {}
}
