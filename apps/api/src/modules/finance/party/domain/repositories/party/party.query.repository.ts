import { Pagination, Party } from '@shared';
import { FindPartiesFilter } from '@modules/finance/party/domain/contracts/party.contracts';

export const PARTY_QUERY_REPOSITORY = Symbol('IPartyQueryRepository');

export interface IPartyQueryRepository {
  findById(id: string): Promise<Party | null>;
  findMany(
    filter: FindPartiesFilter,
    pagination: Pagination
  ): Promise<{ items: Party[]; total: number }>;
}
