import { PartyOriginType } from '@prisma/client';
import { Party } from '@modules/finance/party/domain/entities/party.entity';

export const PARTY_COMMAND_REPOSITORY = Symbol('IPartyCommandRepository');

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
