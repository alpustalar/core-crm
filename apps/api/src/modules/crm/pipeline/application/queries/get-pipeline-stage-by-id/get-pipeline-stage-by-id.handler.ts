import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPipelineStageByIdQuery } from './get-pipeline-stage-by-id.query';
import { GetPipelineStageByIdResponse } from './get-pipeline-stage-by-id.response';
import {
  IPipelineQueryRepository,
  PIPELINE_QUERY_REPOSITORY,
} from '@modules/crm/pipeline/domain/repositories/pipeline/pipeline.query.repository';

@QueryHandler(GetPipelineStageByIdQuery)
export class GetPipelineStageByIdHandler
  implements
    IQueryHandler<GetPipelineStageByIdQuery, GetPipelineStageByIdResponse>
{
  constructor(
    @Inject(PIPELINE_QUERY_REPOSITORY)
    private readonly pipelineRepo: IPipelineQueryRepository
  ) {}

  async execute(
    query: GetPipelineStageByIdQuery
  ): Promise<GetPipelineStageByIdResponse> {
    const data = await this.pipelineRepo.findStageById(query.stageId);
    return { data };
  }
}
