import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClinicOpenSlotsQuery } from './get-clinic-open-slots.query';
import { GetClinicOpenSlotsResponse } from './get-clinic-open-slots.response';
import {
  ClinicOpenSlot,
  ClinicOpenSlotsDay,
} from '@modules/clinical/appointment/domain/contracts/appointment.contracts';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { DateTimeManager } from '@common/utils';
import { TimeZoneType } from '@input-type-schemas/TimeZoneSchema';
import { ProviderCalendarDayResponse } from '@shared';
import { GetClinicTimezoneQuery } from '@modules/organization/clinic/application/queries/get-clinic-timezone/get-clinic-timezone.query';
import { GetClinicAppointmentSettingsQuery } from '@modules/organization/clinic/application/queries/get-clinic-appointment-settings/get-clinic-appointment-settings.query';
import { FindProvidersDirectoryQuery } from '@modules/clinical/provider/application/queries/find-providers-directory/find-providers-directory.query';
import { GetProviderAvailabilityQuery } from '@modules/clinical/appointment/application/queries/get-provider-availability/get-provider-availability.query';
import { GetProviderAvailabilityDto } from '@shared/modules/appointment/dto/queries/get-provider-availability.dto';

interface BuildDaySlotsInput {
  day: ProviderCalendarDayResponse;
  providerId: string;
  providerName: string;
  tz: TimeZoneType;
  durationMinutes: number;
  now: Date;
}

/**
 * Bir kliniğin verilen tarih aralığındaki tüm açık slotlarını üretir. Mevcut
 * müsaitlik motorunu ({@link GetProviderAvailabilityQuery}) her aktif doktor için
 * çağırır — böylece klinik programı/istisnaları + doktor programı/vardiya/istisnaları +
 * dolu randevular tek yerde çözülür — ardından çalışma saatlerini `durationMinutes`
 * adımıyla slotlara böler; mola, doktor izin (OFF) blokları, dolu randevu ve geçmiş
 * zamanla çakışanları eler. Slot süresi: DTO override > klinik ayarı > 30 dk.
 */
@QueryHandler(GetClinicOpenSlotsQuery)
export class GetClinicOpenSlotsHandler
  implements IQueryHandler<GetClinicOpenSlotsQuery, GetClinicOpenSlotsResponse>
{
  constructor(private readonly queryBus: TSQueryBus) {}

  async execute(
    query: GetClinicOpenSlotsQuery
  ): Promise<GetClinicOpenSlotsResponse> {
    const { dto, ctx } = query;
    const { clinicId, startDate, endDate, providerId } = dto;

    const [{ data: tz }, durationMinutes, { data: providers }] =
      await Promise.all([
        this.queryBus.execute(new GetClinicTimezoneQuery(clinicId)),
        this.resolveSlotDuration(clinicId, dto.slotDurationMinutes),
        this.queryBus.execute(new FindProvidersDirectoryQuery(clinicId)),
      ]);

    const targetProviders = providerId
      ? providers.filter((provider) => provider.providerId === providerId)
      : providers;

    if (targetProviders.length === 0) {
      return { data: [] };
    }

    const now = DateTimeManager.create();

    // Her doktorun aralık müsaitliğini paralel çöz; günlere göre slotları topla.
    const perProviderDays = await Promise.all(
      targetProviders.map(async (provider) => {
        const availabilityDto: GetProviderAvailabilityDto = {
          providerId: provider.providerId,
          clinicId,
          startDate,
          endDate,
        } as GetProviderAvailabilityDto;

        const { data: days } = await this.queryBus.execute(
          new GetProviderAvailabilityQuery(availabilityDto, ctx)
        );

        return days.map((day) => ({
          date: day.date,
          slots: this.buildDaySlots({
            day,
            providerId: provider.providerId,
            providerName: provider.name,
            tz,
            durationMinutes,
            now,
          }),
        }));
      })
    );

    const byDate = new Map<string, ClinicOpenSlot[]>();
    for (const providerDays of perProviderDays) {
      for (const { date, slots } of providerDays) {
        if (slots.length === 0) continue;
        const existing = byDate.get(date) ?? [];
        existing.push(...slots);
        byDate.set(date, existing);
      }
    }

    const result: ClinicOpenSlotsDay[] = [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, slots]) => ({
        date,
        slots: slots.sort(
          (a, b) =>
            a.start.getTime() - b.start.getTime() ||
            a.providerName.localeCompare(b.providerName)
        ),
      }));

    return { data: result };
  }

  /** DTO override > klinik ayarındaki varsayılan slot süresi. */
  private async resolveSlotDuration(
    clinicId: string,
    override?: number
  ): Promise<number> {
    if (override && override > 0) return override;
    const { data: settings } = await this.queryBus.execute(
      new GetClinicAppointmentSettingsQuery(clinicId)
    );
    return settings.slotDurationMinutes;
  }

  /**
   * Bir doktorun bir gününü açık slotlara böler. Çalışma penceresi `durationMinutes`
   * adımıyla taranır; mola penceresi, doktor izin (OFF) blokları, dolu randevu ve
   * geçmiş zamanla çakışan slotlar elenir.
   */
  private buildDaySlots(input: BuildDaySlotsInput): ClinicOpenSlot[] {
    const { day, providerId, providerName, tz, durationMinutes, now } = input;
    if (!day.isWorkingDay || !day.workingHours) return [];

    const { startMinute, endMinute, breakStartMinute, breakEndMinute } =
      day.workingHours;

    // Doktorun kısmi izin (OFF) blokları — bu pencerelere düşen slotlar açık sayılmaz.
    const offBlocks = day.providerExceptions.filter(
      (exception) => exception.type === 'OFF'
    );

    const slots: ClinicOpenSlot[] = [];

    for (
      let m = startMinute;
      m + durationMinutes <= endMinute;
      m += durationMinutes
    ) {
      const slotEndMinute = m + durationMinutes;

      // Mola penceresiyle çakışan slotları atla.
      if (breakStartMinute != null && breakEndMinute != null) {
        const overlapsBreak =
          m < breakEndMinute && slotEndMinute > breakStartMinute;
        if (overlapsBreak) continue;
      }

      const time = DateTimeManager.minutesToHHMM(m);
      const start = DateTimeManager.fromLocalDateTime(day.date, time, tz);
      const end = DateTimeManager.addMinutes(start, durationMinutes, tz);

      // Geçmiş slotları atla.
      if (start <= now) continue;

      // Doktor izin bloğuyla çakışanları atla.
      const overlapsOff = offBlocks.some((exception) =>
        DateTimeManager.isOverlapping(
          { start, end },
          { start: exception.startTime, end: exception.endTime }
        )
      );
      if (overlapsOff) continue;

      // Dolu randevularla çakışanları atla.
      const isOccupied = day.occupiedSlots.some((occupied) =>
        DateTimeManager.isOverlapping(
          { start, end },
          { start: occupied.startTime, end: occupied.endTime }
        )
      );
      if (isOccupied) continue;

      slots.push({
        providerId,
        providerName,
        time,
        start,
        end,
        durationMinutes,
      });
    }

    return slots;
  }
}
