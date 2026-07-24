import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  IPipelineQueryRepository,
  PIPELINE_QUERY_REPOSITORY,
} from '@modules/crm/pipeline/domain/repositories/pipeline.repository';
import { GetPipelinesQuery } from './get-pipelines.query';
import { GetPipelinesResponse } from './get-pipelines.response';

@QueryHandler(GetPipelinesQuery)
export class GetPipelinesHandler
  implements IQueryHandler<GetPipelinesQuery, GetPipelinesResponse>
{
  constructor(
    @Inject(PIPELINE_QUERY_REPOSITORY)
    private readonly pipelineQueryRepo: IPipelineQueryRepository
  ) {}

  async execute(query: GetPipelinesQuery): Promise<GetPipelinesResponse> {
    // Huni klinik-seviye — aktif klinik bağlamı yoksa liste boştur.
    const clinicId = query.ctx.actor.clinicId;
    if (!clinicId) return { data: [] };

    const data = await this.pipelineQueryRepo.findByClinic(clinicId);
    return { data };
  }
}
