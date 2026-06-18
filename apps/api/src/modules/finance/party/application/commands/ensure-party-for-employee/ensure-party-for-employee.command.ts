import { IGetContext } from '@common/decorators';

export interface EnsurePartyForEmployeeResult {
  partyId: string;
  organizationId: string;
}

/**
 * Bir personel (User) için verilen şubenin (clinicId) finans carisini garanti eder
 * ve {partyId, organizationId} döner. Bordro tahakkuku posting öncesi bu komutu
 * CommandBus ile çağırıp 335 (Personele Borçlar) alt defterini elde eder.
 * User → Party köprüsünü tek yerde toplar (EnsurePartyForPatient simetriği).
 */
export class EnsurePartyForEmployeeCommand {
  readonly __responseType!: EnsurePartyForEmployeeResult;
  constructor(
    public readonly userId: string,
    public readonly clinicId: string,
    public readonly organizationId: string,
    public readonly ctx: IGetContext
  ) {}
}
