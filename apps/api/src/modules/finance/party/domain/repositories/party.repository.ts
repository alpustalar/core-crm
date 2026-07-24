import { PartyOriginType } from '@prisma/client';
import { Pagination } from '@shared';
import { Party } from '../entities/party.entity';
import { FindPartiesFilter } from '@modules/finance/party/domain/contracts/party.contracts';

export const PARTY_COMMAND_REPOSITORY = Symbol('IPartyCommandRepository');
export const PARTY_QUERY_REPOSITORY = Symbol('IPartyQueryRepository');

export interface IPartyCommandRepository {
  create(party: Party): Promise<Party>;
  save(party: Party): Promise<Party>;
}

export interface IPartyQueryRepository {
  findById(id: string): Promise<Party | null>;
  findByOrigin(
    clinicId: string,
    originType: PartyOriginType,
    originId: string
  ): Promise<Party | null>;
  findMany(
    filter: FindPartiesFilter,
    pagination: Pagination
  ): Promise<{ items: Party[]; total: number }>;
}
