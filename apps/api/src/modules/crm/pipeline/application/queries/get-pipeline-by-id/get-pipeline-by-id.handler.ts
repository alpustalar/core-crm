import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPipelineByIdQuery } from './get-pipeline-by-id.query';
import { GetPipelineByIdResponse } from './get-pipeline-by-id.response';
import {
  IPipelineQueryRepository,
  PIPELINE_QUERY_REPOSITORY,
} from '@modules/crm/pipeline/domain/repositories/pipeline/pipeline.query.repository';

@QueryHandler(GetPipelineByIdQuery)
export class GetPipelineByIdHandler
  implements IQueryHandler<GetPipelineByIdQuery, GetPipelineByIdResponse>
{
  constructor(
    @Inject(PIPELINE_QUERY_REPOSITORY)
    private readonly pipelineRepo: IPipelineQueryRepository
  ) {}

  async execute(query: GetPipelineByIdQuery): Promise<GetPipelineByIdResponse> {
    const data = await this.pipelineRepo.findById(query.pipelineId);
    return { data };
  }
}
