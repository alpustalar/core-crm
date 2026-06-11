import { PartyRole } from '@prisma/client';
import { IGetContext } from '@common/decorators';

export interface EnsurePartyForPatientResult {
  partyId: string;
  organizationId: string;
}

/**
 * Bir hasta için verilen şubenin (clinicId) finans carisini garanti eder ve
 * {partyId, organizationId} döner. Cari, işlemin gerçekleştiği şubenin defterine
 * aittir (clinic = source-of-truth). Patient → Party köprüsünü tek yerde toplar;
 * muhasebe köprüleri (payment/invoice/pos) bu komutu CommandBus ile çağırır.
 */
export class EnsurePartyForPatientCommand {
  readonly __responseType!: EnsurePartyForPatientResult;
  constructor(
    public readonly patientId: string,
    public readonly clinicId: string,
    public readonly role: PartyRole,
    public readonly ctx: IGetContext
  ) {}
}
