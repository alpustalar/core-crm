import { IGetContext } from '@common/decorators';
import { EnsurePartyForEmployeeResponse } from '@modules/finance/party/application/commands/ensure-party-for-employee/ensure-party-for-employee.response';

export interface EnsurePartyForEmployeeData {
  userId: string;
  clinicId: string;
  organizationId: string;
}

/**
 * Bir personel (User) için verilen şubenin (clinicId) finans carisini garanti eder
 * ve {partyId, organizationId} döner. Bordro tahakkuku posting öncesi bu komutu
 * CommandBus ile çağırıp 335 (Personele Borçlar) alt defterini elde eder.
 * User → Party köprüsünü tek yerde toplar (EnsurePartyForPatient simetriği).
 */

export class EnsurePartyForEmployeeCommand {
  readonly __responseType!: EnsurePartyForEmployeeResponse;
  constructor(
    public readonly data: EnsurePartyForEmployeeData,
    public readonly ctx: IGetContext
  ) {}
}
