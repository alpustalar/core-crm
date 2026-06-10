import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  IPartyQueryRepository,
  PARTY_QUERY_REPOSITORY,
} from '@modules/finance/party/domain/repositories/party.repository';
import { GetPartyByIdQuery } from './get-party-by-id.query';
import { GetPartyByIdResponse } from './get-party-by-id.response';

@QueryHandler(GetPartyByIdQuery)
export class GetPartyByIdHandler
  implements IQueryHandler<GetPartyByIdQuery, GetPartyByIdResponse>
{
  constructor(
    @Inject(PARTY_QUERY_REPOSITORY)
    private readonly partyQueryRepo: IPartyQueryRepository
  ) {}

  async execute(query: GetPartyByIdQuery): Promise<GetPartyByIdResponse> {
    const party = await this.partyQueryRepo.findById(query.partyId);
    return { data: party };
  }
}
