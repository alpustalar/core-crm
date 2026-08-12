import { IGetContext } from '@common/decorators';
import { EnsurePartyForEmployeeResponse } from '@modules/finance/party/application/commands/ensure-party-for-employee/ensure-party-for-employee.response';

/**
 * Bir personel (User) için verilen şubenin (clinicId) finans carisini garanti eder
 * ve {partyId, organizationId} döner. Bordro tahakkuku posting öncesi bu komutu
 * CommandBus ile çağırıp 335 (Personele Borçlar) alt defterini elde eder.
 * User → Party köprüsünü tek yerde toplar (EnsurePartyForPatient simetriği).
 */

export class EnsurePartyForEmployeeCommand {
  readonly __responseType!: EnsurePartyForEmployeeResponse;
  constructor(
    public readonly payload: {
      readonly userId: string;
      readonly clinicId: string;
      readonly organizationId?: string | null;
      readonly ctx: IGetContext;
    }
  ) {}
}
