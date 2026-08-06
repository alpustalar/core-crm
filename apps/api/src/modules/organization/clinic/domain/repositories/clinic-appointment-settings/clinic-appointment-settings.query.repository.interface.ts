import { ClinicAppointmentSettings } from '@shared';

export const CLINIC_APPOINTMENT_SETTINGS_QUERY_REPOSITORY = Symbol(
  'IClinicAppointmentSettingsQueryRepository'
);

export interface IClinicAppointmentSettingsQueryRepository {
  findByClinicId(clinicId: string): Promise<ClinicAppointmentSettings | null>;
}
