import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPipelinesQuery } from './get-pipelines.query';
import { GetPipelinesResponse } from './get-pipelines.response';
import {
  IPipelineQueryRepository,
  PIPELINE_QUERY_REPOSITORY,
} from '@modules/crm/pipeline/domain/repositories/pipeline/pipeline.query.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@QueryHandler(GetPipelinesQuery)
export class GetPipelinesHandler
  implements IQueryHandler<GetPipelinesQuery, GetPipelinesResponse>
{
  constructor(
    @Inject(PIPELINE_QUERY_REPOSITORY)
    private readonly pipelineQueryRepo: IPipelineQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(query: GetPipelinesQuery): Promise<GetPipelinesResponse> {
    const { actor, source } = query.ctx;

    const { policy } = this.policyFactory.clinic(actor, source);

    // Huni klinik-seviye — aktif klinik bağlamı yoksa liste boştur.
    const clinicId = actor.clinicId;
    const serializationOptions = policy.getSerializationOptions({ clinicId });

    if (!clinicId) return { data: [], meta: { serializationOptions } };

    const data = await this.pipelineQueryRepo.findByClinic(clinicId);

    return { data, meta: { serializationOptions } };
  }
}
