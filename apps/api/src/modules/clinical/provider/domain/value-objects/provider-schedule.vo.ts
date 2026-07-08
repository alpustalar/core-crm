import { DateTimeManager } from '@common/utils';
import { ExceptionTypeSchema } from '@input-type-schemas/ExceptionTypeSchema';
import { ProviderAvailability as IProviderAvailability } from '@model-schema/ProviderAvailabilitySchema';
import {
  ProviderIsOffException,
  ProviderNotWorkingDayException,
  ProviderOnBreakException,
  ProviderOutsideWorkingHoursException,
} from '@modules/clinical/provider/domain/exceptions/provider-schedule.exceptions';
import { ProviderException } from '@modules/clinical/provider/domain/entities/provider-exception.entity';
import { DateRange } from '@src/domain/value-objects/date-range.vo';
import { DayMinuteRange } from '@src/domain/value-objects/day-minute-range.vo';
import { DayMinute } from '@src/domain/value-objects/day-minute.vo';

export class ProviderSchedule {
  private constructor(
    private readonly availabilities: IProviderAvailability[],
    private readonly exceptions: ProviderException[]
  ) {}

  public get validate() {
    return {
      bookingAvailability: (timeRange: DateRange) =>
        this.bookingAvailability(timeRange),
    };
  }

  static create(
    availabilities: IProviderAvailability[],
    exceptions: ProviderException[]
  ) {
    return new ProviderSchedule(availabilities, exceptions);
  }

  private bookingAvailability(timeRange: DateRange) {
    const { startDate: startTime, endDate: endTime } = timeRange;
    const dayOfWeek = startTime.getUTCDay();
    const availability = this.availabilities.find(
      (availability) => availability.dayOfWeek === dayOfWeek
    );

    if (!availability) {
      return this.returnValue(new ProviderNotWorkingDayException());
    }

    const appointmentMinuteRange = DayMinuteRange.create(
      DayMinute.fromDate(startTime),
      DayMinute.fromDate(endTime)
    );

    const availableMinuteRange = DayMinuteRange.create(
      DayMinute.fromNumber(availability.startMinute),
      DayMinute.fromNumber(availability.endMinute)
    );

    if (
      !appointmentMinuteRange.validate.isCompletelyWithIn(availableMinuteRange)
        .value
    ) {
      return this.returnValue(new ProviderOutsideWorkingHoursException());
    }

    if (availability.breakStartMinute && availability.breakEndMinute) {
      const breakTime = DayMinuteRange.create(
        DayMinute.fromNumber(availability.breakStartMinute),
        DayMinute.fromNumber(availability.breakEndMinute)
      );

      if (appointmentMinuteRange.validate.overlapsWith(breakTime).value) {
        return this.returnValue(new ProviderOnBreakException());
      }
    }

    const offExceptions = this.exceptions.filter(
      (e) => e.type === ExceptionTypeSchema.enum.OFF
    );

    for (const ex of offExceptions) {
      const isDoctorOff = DateTimeManager.isOverlapping(
        { start: startTime, end: endTime },
        { start: ex.dateRange.startDate, end: ex.dateRange.endDate }
      );

      if (isDoctorOff) {
        return this.returnValue(
          new ProviderIsOffException(ex.reason ?? undefined)
        );
      }
    }

    return this.returnValue(new Error(), true);
  }

  private returnValue(error: Error, isValid: boolean = false) {
    return {
      isValid,
      isInvalid: !isValid,
      orThrow: () => {
        if (!isValid) {
          throw error;
        }
      },
    };
  }
}
