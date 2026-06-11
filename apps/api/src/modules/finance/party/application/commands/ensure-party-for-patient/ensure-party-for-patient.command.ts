import { PartyRole } from '@prisma/client';
import { IGetContext } from '@common/decorators';

export interface EnsurePartyForPatientResult {
  partyId: string;
  organizationId: string;
}

/**
 * Bir hasta için finans carisini garanti eder ve {partyId, organizationId} döner.
 * Patient → Party köprüsünü tek yerde toplar; muhasebe köprüleri (payment/invoice/pos)
 * hasta kimliğini tekrar tekrar çözmek yerine bu komutu CommandBus ile çağırır.
 */
export class EnsurePartyForPatientCommand {
  readonly __responseType!: EnsurePartyForPatientResult;
  constructor(
    public readonly patientId: string,
    public readonly role: PartyRole,
    public readonly ctx: IGetContext
  ) {}
}
