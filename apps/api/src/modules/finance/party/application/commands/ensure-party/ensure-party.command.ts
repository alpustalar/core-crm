import { PartyOriginType, PartyRole, PartyType } from '@prisma/client';
import { IGetContext } from '@common/decorators';

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
  role: PartyRole;
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
