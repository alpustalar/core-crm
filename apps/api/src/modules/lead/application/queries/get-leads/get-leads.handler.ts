import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetLeadsQuery } from './get-leads.query';
import { GetLeadsResponse } from './get-leads.response';
import {
  LEAD_QUERY_REPOSITORY,
  ILeadQueryRepository,
} from '@modules/lead/domain/repositories/lead.repository.interface';
import { LeadSource, LeadStatus } from '@prisma/client';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';

@QueryHandler(GetLeadsQuery)
export class GetLeadsHandler implements IQueryHandler<GetLeadsQuery, GetLeadsResponse> {
  constructor(
    @Inject(LEAD_QUERY_REPOSITORY)
    private readonly leadQueryRepo: ILeadQueryRepository,
  ) {}

  async execute(query: GetLeadsQuery): Promise<GetLeadsResponse> {
    const { clinicId, dto, pagination } = query;

    const result = await this.leadQueryRepo.findMany({
      clinicId,
      status: dto.status as LeadStatus | undefined,
      source: dto.source as LeadSource | undefined,
      assignedToId: dto.assignedToId,
      pagination,
    });

    return {
      data: result.items,
      meta: { pagination: buildPaginationMeta(pagination, result.total) },
    };
  }
}
