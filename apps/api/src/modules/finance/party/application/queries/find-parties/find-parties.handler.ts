import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { FindPartiesQuery } from './find-parties.query';
import { FindPartiesResponse } from './find-parties.response';
import {
  IPartyQueryRepository,
  PARTY_QUERY_REPOSITORY,
} from '@modules/finance/party/domain/repositories/party/party.query.repository';

@QueryHandler(FindPartiesQuery)
export class FindPartiesHandler
  implements IQueryHandler<FindPartiesQuery, FindPartiesResponse>
{
  constructor(
    @Inject(PARTY_QUERY_REPOSITORY)
    private readonly partyRepo: IPartyQueryRepository
  ) {}

  async execute(query: FindPartiesQuery): Promise<FindPartiesResponse> {
    const { organizationId, pagination, role } = query;

    const { items, total } = await this.partyRepo.findMany(
      { organizationId, role },
      pagination
    );

    return {
      data: items,
      meta: { pagination: buildPaginationMeta(pagination, total) },
    };
  }
}
