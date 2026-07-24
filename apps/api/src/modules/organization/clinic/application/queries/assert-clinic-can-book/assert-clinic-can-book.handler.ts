import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  CLINIC_AVAILABILITY_QUERY_REPOSITORY,
  IClinicAvailabilityQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic-availability.repository.interface';
import { DateTimeManager } from '@common/utils';
import { AssertClinicCanBookQuery } from './assert-clinic-can-book.query';
import {
  CLINIC_EXCEPTION_QUERY_REPOSITORY,
  IClinicExceptionQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic-exception.repository.interface';
import { ClinicSchedule } from '@modules/organization/clinic/domain/value-objects/clinic-schedule.vo';
import { DayMinuteRange } from '@src/domain/value-objects/day-minute-range.vo';

@QueryHandler(AssertClinicCanBookQuery)
export class AssertClinicCanBookHandler
  implements IQueryHandler<AssertClinicCanBookQuery, void>
{
  constructor(
    @Inject(CLINIC_AVAILABILITY_QUERY_REPOSITORY)
    private readonly clinicAvailabilityQueryRepository: IClinicAvailabilityQueryRepository,
    @Inject(CLINIC_EXCEPTION_QUERY_REPOSITORY)
    private readonly clinicExceptionQueryRepo: IClinicExceptionQueryRepository
  ) {}

  async execute(query: AssertClinicCanBookQuery): Promise<void> {
    const { clinicId, startTime, endTime } = query.payload;
    const dayOfWeek = DateTimeManager.getDayOfWeek(startTime);

    const [availability, exception] = await Promise.all([
      this.clinicAvailabilityQueryRepository.findByClinicAndDay(
        clinicId,
        dayOfWeek
      ),
      this.clinicExceptionQueryRepo.findExceptionByClinicAndDate(
        clinicId,
        startTime
      ),
    ]);

    const clinicSchedule = ClinicSchedule.create(
      availability ? [availability] : [],
      exception ? [exception] : []
    );

    clinicSchedule.validate
      .bookingAvailability({
        date: startTime,
        requestedRange: DayMinuteRange.fromNumbers(
          DateTimeManager.getDayMinutes(startTime),
          DateTimeManager.getDayMinutes(endTime)
        ),
      })
      .orThrow();
  }
}
