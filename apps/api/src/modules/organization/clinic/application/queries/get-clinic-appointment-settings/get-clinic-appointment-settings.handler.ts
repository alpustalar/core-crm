import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClinicAppointmentSettingsQuery } from './get-clinic-appointment-settings.query';
import { GetClinicAppointmentSettingsResponse } from './get-clinic-appointment-settings.response';
import {
  CLINIC_APPOINTMENT_SETTINGS_QUERY_REPOSITORY,
  IClinicAppointmentSettingsQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic-appointment-settings.repository.interface';
import { ClinicAppointmentSettings } from '@modules/organization/clinic/domain/entities/clinic-appointment-settings.entity';

@QueryHandler(GetClinicAppointmentSettingsQuery)
export class GetClinicAppointmentSettingsHandler
  implements
    IQueryHandler<
      GetClinicAppointmentSettingsQuery,
      GetClinicAppointmentSettingsResponse
    >
{
  constructor(
    @Inject(CLINIC_APPOINTMENT_SETTINGS_QUERY_REPOSITORY)
    private readonly appointmentSettingsQueryRepo: IClinicAppointmentSettingsQueryRepository
  ) {}

  async execute(
    query: GetClinicAppointmentSettingsQuery
  ): Promise<GetClinicAppointmentSettingsResponse> {
    // Satır henüz yoksa DB default'ları geçerli — entity `createDefault` ile
    // birebir aynı varsayılanlar döner (6/24 saat, patient iptal açık vb.).
    const settings =
      (await this.appointmentSettingsQueryRepo.findByClinicId(
        query.clinicId
      )) ?? ClinicAppointmentSettings.createDefault(query.clinicId);

    return {
      data: {
        clinicId: settings.clinicId.value,
        rescheduleLimitHours: settings.rescheduleLimitHours,
        cancelLimitHours: settings.cancelLimitHours,
        allowPatientCancel: settings.allowPatientCancel,
        requireConfirmation: settings.requireConfirmation,
        maxFutureBookingDays: settings.maxFutureBookingDays,
      },
    };
  }
}
