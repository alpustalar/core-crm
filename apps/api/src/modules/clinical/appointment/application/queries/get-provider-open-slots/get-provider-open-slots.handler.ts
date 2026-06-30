import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProviderOpenSlotsQuery } from './get-provider-open-slots.query';
import { GetProviderOpenSlotsResponse } from './get-provider-open-slots.response';
import { OpenSlot } from '@modules/clinical/appointment/domain/contracts/appointment.contracts';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { DateTimeManager } from '@common/utils';
import { GetClinicTimezoneQuery } from '@modules/organization/clinic/application/queries/get-clinic-timezone/get-clinic-timezone.query';
import { GetProviderAvailabilityQuery } from '@modules/clinical/appointment/application/queries/get-provider-availability/get-provider-availability.query';
import { GetProviderAvailabilityDto } from '@shared/modules/appointment/dto/queries/get-provider-availability.dto';

/**
 * Bir doktorun verilen gündeki hazır boş slotlarını döner. Çalışma saatlerinden
 * mola, dolu randevular ve geçmiş zaman çıkarılarak `durationMinutes` adımıyla
 * hesaplanır. AI asistanı bu çıktıyı doğrudan hastaya sunar — slot aritmetiği
 * LLM'e bırakılmaz. Zaman dilimi kliniğin kendi timezone'undan çözülür.
 */
@QueryHandler(GetProviderOpenSlotsQuery)
export class GetProviderOpenSlotsHandler
  implements
    IQueryHandler<GetProviderOpenSlotsQuery, GetProviderOpenSlotsResponse>
{
  constructor(private readonly queryBus: TSQueryBus) {}

  async execute(
    query: GetProviderOpenSlotsQuery
  ): Promise<GetProviderOpenSlotsResponse> {
    const { input, ctx } = query;
    const { providerId, clinicId, date, durationMinutes } = input;

    const { data: tz } = await this.queryBus.execute(
      new GetClinicTimezoneQuery(clinicId)
    );

    const startDate = DateTimeManager.fromLocalDateTime(date, '00:00', tz);
    const endDate = DateTimeManager.fromLocalDateTime(date, '23:59', tz);

    const dto: GetProviderAvailabilityDto = {
      providerId,
      clinicId,
      startDate,
      endDate,
    } as GetProviderAvailabilityDto;

    const { data: days } = await this.queryBus.execute(
      new GetProviderAvailabilityQuery(dto, ctx)
    );

    const day = days.find((d) => d.date === date);
    if (!day || !day.isWorkingDay || !day.workingHours) {
      return { data: [] };
    }

    const { startMinute, endMinute, breakStartMinute, breakEndMinute } =
      day.workingHours;
    const now = new Date();
    const slots: OpenSlot[] = [];

    for (let m = startMinute; m + durationMinutes <= endMinute; m += durationMinutes) {
      const slotEndMin = m + durationMinutes;

      // Mola penceresiyle çakışan slotları atla
      if (breakStartMinute != null && breakEndMinute != null) {
        const overlapsBreak = m < breakEndMinute && slotEndMin > breakStartMinute;
        if (overlapsBreak) continue;
      }

      const time = DateTimeManager.minutesToHHMM(m);
      const start = DateTimeManager.fromLocalDateTime(date, time, tz);
      const end = DateTimeManager.addMinutes(start, durationMinutes, tz);

      // Geçmiş slotları atla
      if (start <= now) continue;

      // Dolu randevularla çakışanları atla
      const isOccupied = day.occupiedSlots.some((s) =>
        DateTimeManager.isOverlapping(
          { start, end },
          { start: s.startTime, end: s.endTime }
        )
      );
      if (isOccupied) continue;

      slots.push({ time, start, durationMinutes });
    }

    return { data: slots };
  }
}
