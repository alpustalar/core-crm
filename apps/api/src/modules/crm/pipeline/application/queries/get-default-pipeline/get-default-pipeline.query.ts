import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetDefaultPipelineResponse } from './get-default-pipeline.response';

/** Kliniğin varsayılan hunisi — Lead create'te ilk aşamaya atamak için (cross-module). */
export class GetDefaultPipelineQuery implements IQuery {
  readonly __responseType!: GetDefaultPipelineResponse;
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext
  ) {}
}
