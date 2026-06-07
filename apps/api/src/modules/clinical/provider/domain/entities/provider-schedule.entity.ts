// modules/appointment/domain/models/provider-schedule.model.ts
import { BadRequestException } from '@nestjs/common';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { ProviderAvailability, ProviderException } from '@shared';
import { DateTimeManager } from '@common/utils';

export class ProviderScheduleEntity extends AggregateRoot {
  constructor(
    private readonly availabilities: ProviderAvailability[],
    private readonly exceptions: ProviderException[]
  ) {
    super();
  }

  validateBookingAvailabilityOrThrow(startTime: Date, endTime: Date): void {
    const dayOfWeek = startTime.getUTCDay();
    const availability = this.availabilities.find(
      (a) => a.dayOfWeek === dayOfWeek
    );

    if (!availability) {
      throw new BadRequestException('Doktor bu gün çalışmıyor.');
    }

    // Dakika hesaplamaları
    const apptStartMin = DateTimeManager.getDayMinutes(startTime);
    const apptEndMin = DateTimeManager.getDayMinutes(endTime);

    // Çalışma saatleri kontrolü
    const isWithinWorkingHours =
      DateTimeManager.isTimeWithinRange({
        checkTime: startTime,
        startMinute: availability.startMinute,
        endMinute: availability.endMinute,
      }) && apptEndMin <= availability.endMinute;

    if (!isWithinWorkingHours) {
      throw new BadRequestException(
        'Randevu saati doktorun çalışma saatleri dışında.'
      );
    }

    if (
      availability.breakStartMinute != null &&
      availability.breakEndMinute != null
    ) {
      const isOverlappingWithBreak =
        apptStartMin < availability.breakEndMinute &&
        apptEndMin > availability.breakStartMinute;

      if (isOverlappingWithBreak) {
        throw new BadRequestException(
          'Randevu doktorun mola saatleriyle çakışıyor.'
        );
      }
    }

    const offExceptions = this.exceptions.filter((e) => e.type === 'OFF');

    for (const ex of offExceptions) {
      const isDoctorOff = DateTimeManager.isOverlapping(
        { start: startTime, end: endTime },
        { start: ex.startTime, end: ex.endTime }
      );

      if (isDoctorOff) {
        throw new BadRequestException(
          ex.reason ?? 'Doktor bu saatte müsait değil (İzinli/Kapalı).'
        );
      }
    }
  }
}
