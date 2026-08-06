import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClinicAppointmentSettingsQuery } from './get-clinic-appointment-settings.query';
import {
  ClinicAppointmentSettingsView,
  GetClinicAppointmentSettingsResponse,
} from './get-clinic-appointment-settings.response';

import { ClinicAppointmentSettings } from '@modules/organization/clinic/domain/entities/clinic-appointment-settings.entity';
import {
  CLINIC_CACHE_SERVICE,
  IClinicCacheService,
} from '@modules/organization/clinic/domain/interfaces/clinic-cache.service.interface';
import {
  CLINIC_APPOINTMENT_SETTINGS_QUERY_REPOSITORY,
  IClinicAppointmentSettingsQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic-appointment-settings/clinic-appointment-settings.query.repository.interface';

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
    private readonly clinicAppointmentSettingsRepo: IClinicAppointmentSettingsQueryRepository,
    @Inject(CLINIC_CACHE_SERVICE)
    private readonly cacheService: IClinicCacheService
  ) {}

  async execute(
    query: GetClinicAppointmentSettingsQuery
  ): Promise<GetClinicAppointmentSettingsResponse> {
    // Cache-aside: randevu oluşturma gibi hot-path'ler bu sorguyu sık çağırır;
    // önce Redis'e bakılır, yoksa DB'den okunup TTL ile cache'lenir.
    const cached = await this.cacheService
      .clinicAppointmentSettings<ClinicAppointmentSettingsView>()
      .get(query.clinicId);

    if (cached) return { data: cached };

    // Satır henüz yoksa DB default'ları geçerli — entity `createDefault` ile
    // birebir aynı varsayılanlar döner (6/24 saat, patient iptal açık vb.).
    const settings =
      (await this.clinicAppointmentSettingsRepo.findByClinicId(
        query.clinicId
      )) ?? ClinicAppointmentSettings.createDefault(query.clinicId);

    const view: ClinicAppointmentSettingsView = {
      clinicId:
        typeof settings.clinicId === 'string'
          ? settings.clinicId
          : settings.clinicId.value,
      allowPatientBooking: settings.allowPatientBooking,
      rescheduleLimitHours: settings.rescheduleLimitHours,
      cancelLimitHours: settings.cancelLimitHours,
      allowPatientCancel: settings.allowPatientCancel,
      requireConfirmation: settings.requireConfirmation,
      maxActivePatientBookings: settings.maxActivePatientBookings,
      maxFutureBookingDays: settings.maxFutureBookingDays,
      slotDurationMinutes: settings.slotDurationMinutes,
      staffAllowOverbooking: settings.staffAllowOverbooking,
      sendSmsReminderHours: settings.sendSmsReminderHours,
      requireReminderResponse: settings.requireReminderResponse,
    };

    await this.cacheService
      .clinicAppointmentSettings()
      .set(query.clinicId, view);

    return { data: view };
  }
}
