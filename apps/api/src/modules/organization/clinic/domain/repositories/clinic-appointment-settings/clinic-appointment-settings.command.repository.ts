import { ClinicAppointmentSettings } from '@modules/organization/clinic/domain/entities/clinic-appointment-settings.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const CLINIC_APPOINTMENT_SETTINGS_COMMAND_REPOSITORY = Symbol(
  'IClinicAppointmentSettingsCommandRepository'
);

export type IClinicAppointmentSettingsCommandRepository =
  IBaseCommandRepository<ClinicAppointmentSettings> & {
    /** clinicId unique → get-or-create (upsert). */
    upsertByClinicId(
      entity: ClinicAppointmentSettings
    ): Promise<ClinicAppointmentSettings>;
    findByClinicId(clinicId: string): Promise<ClinicAppointmentSettings | null>;
  };
