import { PartyOriginType } from '@prisma/client';
import { Pagination } from '@shared';
import { Party as IParty } from '@shared';
import { Party } from '../entities/party.entity';
import { FindPartiesFilter } from '@modules/finance/party/domain/contracts/party.contracts';

export const PARTY_COMMAND_REPOSITORY = Symbol('IPartyCommandRepository');
export const PARTY_QUERY_REPOSITORY = Symbol('IPartyQueryRepository');

export interface IPartyCommandRepository {
  create(party: Party): Promise<Party>;
  update(party: Party): Promise<Party>;

  /**
   * Cari zaten var mı (ensure akışı)? Kayıt açma/güncelleme kararını beslediği
   * için Command Context'te okunur; nihai güvence
   * `clinicId+originType+originId` unique kısıtı.
   */
  findByOrigin(
    clinicId: string,
    originType: PartyOriginType,
    originId: string
  ): Promise<Party | null>;
}

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface IPartyQueryRepository {
  findById(id: string): Promise<IParty | null>;
  findMany(
    filter: FindPartiesFilter,
    pagination: Pagination
  ): Promise<{ items: IParty[]; total: number }>;
}
