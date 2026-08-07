import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLeadByIdQuery } from './get-lead-by-id.query';
import { GetLeadByIdResponse } from './get-lead-by-id.response';
import {
  ILeadQueryRepository,
  LEAD_QUERY_REPOSITORY,
} from '@modules/crm/lead/domain/repositories/lead.repository';

@QueryHandler(GetLeadByIdQuery)
export class GetLeadByIdHandler
  implements IQueryHandler<GetLeadByIdQuery, GetLeadByIdResponse>
{
  constructor(
    @Inject(LEAD_QUERY_REPOSITORY)
    private readonly leadRepo: ILeadQueryRepository
  ) {}

  async execute(query: GetLeadByIdQuery): Promise<GetLeadByIdResponse> {
    const lead = await this.leadRepo.findById(query.leadId);
    if (!lead) throw new NotFoundException('Lead bulunamadı.');
    return { data: lead };
  }
}
