import { CheckConflictProps } from '@modules/clinical/appointment/domain/contracts/appointment';

export const APPOINTMENT_CHECKER_SERVICE = Symbol('IAppointmentCheckerService');

export interface IAppointmentCheckerService {
  assertNoConflict(props: CheckConflictProps): Promise<void>;
}
