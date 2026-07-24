import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  IPipelineQueryRepository,
  PIPELINE_QUERY_REPOSITORY,
} from '@modules/crm/pipeline/domain/repositories/pipeline.repository';
import { GetPipelineByIdQuery } from './get-pipeline-by-id.query';
import { GetPipelineByIdResponse } from './get-pipeline-by-id.response';

@QueryHandler(GetPipelineByIdQuery)
export class GetPipelineByIdHandler
  implements IQueryHandler<GetPipelineByIdQuery, GetPipelineByIdResponse>
{
  constructor(
    @Inject(PIPELINE_QUERY_REPOSITORY)
    private readonly pipelineQueryRepo: IPipelineQueryRepository
  ) {}

  async execute(
    query: GetPipelineByIdQuery
  ): Promise<GetPipelineByIdResponse> {
    const data = await this.pipelineQueryRepo.findById(query.pipelineId);
    return { data };
  }
}
