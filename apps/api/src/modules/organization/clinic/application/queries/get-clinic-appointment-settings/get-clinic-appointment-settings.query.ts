import { IQuery } from '@nestjs/cqrs';
import { GetClinicAppointmentSettingsResponse } from './get-clinic-appointment-settings.response';

export class GetClinicAppointmentSettingsQuery implements IQuery {
  readonly __responseType!: GetClinicAppointmentSettingsResponse;

  constructor(public readonly clinicId: string) {}
}
