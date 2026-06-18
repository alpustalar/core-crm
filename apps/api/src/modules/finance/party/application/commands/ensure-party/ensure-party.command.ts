import { IGetContext } from '@common/decorators';
import { PartyTypeType as PartyType } from '@input-type-schemas/PartyTypeSchema';
import { PartyOriginTypeType as PartyOriginType } from '@input-type-schemas/PartyOriginTypeSchema';
import { PartyRoleType } from '@input-type-schemas/PartyRoleSchema';

/**
 * Bir kaynak kayıt (Patient/Supplier/User) için finans carisini garanti eder.
 * Modüller arası entegrasyon noktası: invoice/payment/pos handler'ları posting
 * öncesi bu komutu CommandBus üzerinden çağırıp partyId alır.
 */
export interface EnsurePartyInput {
  clinicId: string; // cari, defter sahibi şubeye aittir (source-of-truth)
  organizationId: string; // denormalize — konsolide raporlama
  originType: PartyOriginType;
  originId: string;
  role: PartyRoleType;
  type: PartyType;
  name: string;
  taxNumber?: string | null;
  nationalId?: string | null;
  taxOffice?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export class EnsurePartyCommand {
  readonly __responseType!: string;
  constructor(
    public readonly input: EnsurePartyInput,
    public readonly ctx: IGetContext
  ) {}
}
