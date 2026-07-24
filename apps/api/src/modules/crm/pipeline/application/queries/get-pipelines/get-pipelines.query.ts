import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetPipelinesResponse } from './get-pipelines.response';

export class GetPipelinesQuery implements IQuery {
  readonly __responseType!: GetPipelinesResponse;
  constructor(public readonly ctx: IGetContext) {}
}
