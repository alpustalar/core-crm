import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPipelineByIdQuery } from './get-pipeline-by-id.query';
import { GetPipelineByIdResponse } from './get-pipeline-by-id.response';
import {
  IPipelineQueryRepository,
  PIPELINE_QUERY_REPOSITORY,
} from '@modules/crm/pipeline/domain/repositories/pipeline/pipeline.query.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { PIPELINE_EVENTS } from '@src/domain/constants/events';

@QueryHandler(GetPipelineByIdQuery)
export class GetPipelineByIdHandler
  implements IQueryHandler<GetPipelineByIdQuery, GetPipelineByIdResponse>
{
  constructor(
    @Inject(PIPELINE_QUERY_REPOSITORY)
    private readonly pipelineRepo: IPipelineQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(query: GetPipelineByIdQuery): Promise<GetPipelineByIdResponse> {
    const { actor, source } = query.ctx;

    const data = await this.pipelineRepo.findById(query.pipelineId);

    const { evaluator, policy } = this.policyFactory.clinic(actor, source);

    // Huni başka kliniğe aitse detay sızmaz — id tahmini kapıda durdurulur.
    evaluator
      .check(
        (p) => !data || p.actorCanAccessTargetClinic(data.clinicId),
        'Bu huniye erişim yetkiniz yok.'
      )
      .orThrow(PIPELINE_EVENTS.DETAIL);

    return {
      data,
      meta: {
        serializationOptions: policy.getSerializationOptions({
          clinicId: data?.clinicId,
        }),
      },
    };
  }
}
