import {
  IClinicAvailability,
  IClinicException,
} from '@modules/clinic/domain/repositories/clinic-availability.repository.interface';

export interface GetClinicScheduleResponse {
  availabilities: IClinicAvailability[];
  exceptions: IClinicException[];
}
