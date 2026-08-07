import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAdAttributedLeadsQuery } from './get-ad-attributed-leads.query';
import { GetAdAttributedLeadsResponse } from './get-ad-attributed-leads.response';
import {
  ILeadQueryRepository,
  LEAD_QUERY_REPOSITORY,
} from '@modules/crm/lead/domain/repositories/lead.repository';

@QueryHandler(GetAdAttributedLeadsQuery)
export class GetAdAttributedLeadsHandler
  implements
    IQueryHandler<GetAdAttributedLeadsQuery, GetAdAttributedLeadsResponse>
{
  constructor(
    @Inject(LEAD_QUERY_REPOSITORY)
    private readonly leadRepo: ILeadQueryRepository
  ) {}

  async execute(
    query: GetAdAttributedLeadsQuery
  ): Promise<GetAdAttributedLeadsResponse> {
    const { payload } = query;
    const data = await this.leadRepo.findAdAttributedConverted({
      clinicId: payload.clinicId,
      from: payload.from,
      to: payload.to,
    });
    return { data };
  }
}
