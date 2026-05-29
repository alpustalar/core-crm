import { Inject, NotFoundException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetLeadByIdQuery } from './get-lead-by-id.query';
import { GetLeadByIdResponse } from './get-lead-by-id.response';
import {
  LEAD_QUERY_REPOSITORY,
  ILeadQueryRepository,
} from '@modules/lead/domain/repositories/lead.repository.interface';

@QueryHandler(GetLeadByIdQuery)
export class GetLeadByIdHandler implements IQueryHandler<GetLeadByIdQuery, GetLeadByIdResponse> {
  constructor(
    @Inject(LEAD_QUERY_REPOSITORY)
    private readonly leadQueryRepo: ILeadQueryRepository,
  ) {}

  async execute(query: GetLeadByIdQuery): Promise<GetLeadByIdResponse> {
    const lead = await this.leadQueryRepo.findById(query.leadId);
    if (!lead) throw new NotFoundException('Lead bulunamadı.');
    return { data: lead };
  }
}
