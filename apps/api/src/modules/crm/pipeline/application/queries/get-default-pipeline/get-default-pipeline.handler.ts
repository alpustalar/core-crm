import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDefaultPipelineQuery } from './get-default-pipeline.query';
import { GetDefaultPipelineResponse } from './get-default-pipeline.response';
import {
  IPipelineQueryRepository,
  PIPELINE_QUERY_REPOSITORY,
} from '@modules/crm/pipeline/domain/repositories/pipeline/pipeline.query.repository';

@QueryHandler(GetDefaultPipelineQuery)
export class GetDefaultPipelineHandler
  implements IQueryHandler<GetDefaultPipelineQuery, GetDefaultPipelineResponse>
{
  constructor(
    @Inject(PIPELINE_QUERY_REPOSITORY)
    private readonly pipelineRepo: IPipelineQueryRepository
  ) {}

  async execute(
    query: GetDefaultPipelineQuery
  ): Promise<GetDefaultPipelineResponse> {
    const data = await this.pipelineRepo.findDefaultByClinic(query.clinicId);
    return { data };
  }
}
