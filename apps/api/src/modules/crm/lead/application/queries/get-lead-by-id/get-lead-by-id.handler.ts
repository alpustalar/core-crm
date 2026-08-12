import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLeadByIdQuery } from './get-lead-by-id.query';
import { GetLeadByIdResponse } from './get-lead-by-id.response';
import {
  ILeadQueryRepository,
  LEAD_QUERY_REPOSITORY,
} from '@modules/crm/lead/domain/repositories/lead/lead.query.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { LeadNotFoundException } from '@modules/crm/lead/domain/exceptions/lead.exceptions';

@QueryHandler(GetLeadByIdQuery)
export class GetLeadByIdHandler
  implements IQueryHandler<GetLeadByIdQuery, GetLeadByIdResponse>
{
  constructor(
    @Inject(LEAD_QUERY_REPOSITORY)
    private readonly leadRepo: ILeadQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(query: GetLeadByIdQuery): Promise<GetLeadByIdResponse> {
    const lead = await this.leadRepo.findById(query.leadId);

    if (!lead) throw new LeadNotFoundException(query.leadId);

    const { policy } = this.policyFactory.clinic(
      query.ctx.actor,
      query.ctx.source
    );

    return {
      data: lead,
      meta: {
        serializationOptions: policy.getSerializationOptions({
          clinicId: lead.clinicId,
        }),
      },
    };
  }
}
