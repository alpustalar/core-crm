import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  IPipelineQueryRepository,
  PIPELINE_QUERY_REPOSITORY,
} from '@modules/crm/pipeline/domain/repositories/pipeline.repository';
import { GetPipelineStageByIdQuery } from './get-pipeline-stage-by-id.query';
import { GetPipelineStageByIdResponse } from './get-pipeline-stage-by-id.response';

@QueryHandler(GetPipelineStageByIdQuery)
export class GetPipelineStageByIdHandler
  implements IQueryHandler<GetPipelineStageByIdQuery, GetPipelineStageByIdResponse>
{
  constructor(
    @Inject(PIPELINE_QUERY_REPOSITORY)
    private readonly pipelineQueryRepo: IPipelineQueryRepository
  ) {}

  async execute(
    query: GetPipelineStageByIdQuery
  ): Promise<GetPipelineStageByIdResponse> {
    const data = await this.pipelineQueryRepo.findStageById(query.stageId);
    return { data };
  }
}
