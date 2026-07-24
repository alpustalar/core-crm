import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetPipelineStageByIdResponse } from './get-pipeline-stage-by-id.response';

/** Tek aşamayı kimliğiyle çözer (Lead move'da hedef aşamanın tip+huni bilgisi için). */
export class GetPipelineStageByIdQuery implements IQuery {
  readonly __responseType!: GetPipelineStageByIdResponse;
  constructor(
    public readonly stageId: string,
    public readonly ctx: IGetContext
  ) {}
}
