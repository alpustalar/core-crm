import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  CLINIC_AVAILABILITY_QUERY_REPOSITORY,
  IClinicAvailabilityQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic-availability.repository.interface';

import {
  CLINIC_EXCEPTION_QUERY_REPOSITORY,
  IClinicExceptionQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic-exception.repository.interface';
import { AssertTimeWithinClinicHoursQuery } from '@modules/organization/clinic/application/queries/assert-time-within-clinic-hours/assert-time-within-clinic-hours.query';
import { ClinicSchedule } from '@modules/organization/clinic/domain/value-objects/clinic-schedule.vo';
import { DayMinuteRange } from '@src/domain/value-objects/day-minute-range.vo';

@QueryHandler(AssertTimeWithinClinicHoursQuery)
export class AssertTimeWithinClinicHoursHandler
  implements IQueryHandler<AssertTimeWithinClinicHoursQuery, void>
{
  constructor(
    @Inject(CLINIC_AVAILABILITY_QUERY_REPOSITORY)
    private readonly clinicAvailabilityRepo: IClinicAvailabilityQueryRepository,
    @Inject(CLINIC_EXCEPTION_QUERY_REPOSITORY)
    private readonly clinicExceptionQueryRepo: IClinicExceptionQueryRepository
  ) {}

  async execute(query: AssertTimeWithinClinicHoursQuery): Promise<void> {
    const { clinicId, items } = query;

    const dates = items.map((i) => i.date.getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    const [availabilities, exceptions] = await Promise.all([
      this.clinicAvailabilityRepo.findAllByClinicId(clinicId),
      this.clinicExceptionQueryRepo.findExceptionsByDateRange(
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
