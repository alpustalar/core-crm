import { Inject, Injectable } from '@nestjs/common';

import { DateTimeManager } from '@common/utils';
import { DayMinuteRange } from '@src/domain/value-objects/day-minute-range.vo';
import { ClinicSchedule } from '@modules/organization/clinic/domain/value-objects/clinic-schedule.vo';
import {
  AssertClinicCanBookParams,
  AssertClinicSlotsWithinHoursParams,
  IClinicBookingService,
} from '@modules/organization/clinic/domain/services/clinic-booking/clinic-booking.service.interface';
import {
  CLINIC_EXCEPTION_COMMAND_REPOSITORY,
  IClinicExceptionCommandRepository,
} from '@modules/organization/clinic/domain/repositories/clinic-exception/clinic-exception.command.repository.interface';
import {
  CLINIC_AVAILABILITY_COMMAND_REPOSITORY,
  IClinicAvailabilityCommandRepository,
} from '@modules/organization/clinic/domain/repositories/clinic-availability/clinic-availability.command.repository.interface';

@Injectable()
export class ClinicBookingService implements IClinicBookingService {
  constructor(
    @Inject(CLINIC_AVAILABILITY_COMMAND_REPOSITORY)
    private readonly clinicAvailabilityRepo: IClinicAvailabilityCommandRepository,
    @Inject(CLINIC_EXCEPTION_COMMAND_REPOSITORY)
    private readonly clinicExceptionRepo: IClinicExceptionCommandRepository
  ) {}

  /**
   * Kliniğin belirtilen tarih ve saat aralığında randevu kabul edip edemeyeceğini doğrular.
   * Kural ihlali durumunda ilgili Domain Exception fırlatır.
   */
  async assertCanBook(params: AssertClinicCanBookParams): Promise<void> {
    const { clinicId, startTime, endTime } = params;

    const dayOfWeek = DateTimeManager.getDayOfWeek(startTime);

    // Command (Domain) Repository'lerden Domain Entity'ler çekiliyor
    const [availability, exception] = await Promise.all([
      this.clinicAvailabilityRepo.findByClinicAndDay(clinicId, dayOfWeek),
      this.clinicExceptionRepo.findExceptionByClinicAndDate(
        clinicId,
        startTime
      ),
    ]);

    const clinicSchedule = ClinicSchedule.create(
      availability ? [availability] : [],
      exception ? [exception] : []
    );

    const requestedRange = DayMinuteRange.fromNumbers(
      DateTimeManager.getDayMinutes(startTime),
      DateTimeManager.getDayMinutes(endTime)
    );

    clinicSchedule.validate
      .bookingAvailability({
        date: startTime,
        requestedRange,
      })
      .orThrow();
  }

  async assertTimeWithinClinicHours(
    params: AssertClinicSlotsWithinHoursParams
  ): Promise<void> {
    const { clinicId, items } = params;

    if (!items.length) return;

    const dates = items.map((i) => i.date.getTime());
    const minDate = DateTimeManager.create(Math.min(...dates));
    const maxDate = DateTimeManager.create(Math.max(...dates));

    const [availabilities, exceptions] = await Promise.all([
      this.clinicAvailabilityRepo.findAllByClinicId(clinicId),
      this.clinicExceptionRepo.findExceptionsByDateRange(
        clinicId,
        minDate,
        maxDate
      ),
    ]);

    const clinicSchedule = ClinicSchedule.create(availabilities, exceptions);

    for (const item of items) {
      clinicSchedule.validate
        .bookingAvailability({
          date: item.date,
          requestedRange: DayMinuteRange.fromNumbers(
            item.startMinute,
            item.endMinute
          ),
        })
        .orThrow();
    }
  }
}
