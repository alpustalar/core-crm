import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  CLINIC_AVAILABILITY_DOMAIN_SERVICE,
  IClinicAvailabilityDomainService,
} from '@modules/clinic/domain/interfaces/clinic-availability.domain-service.interface';
import {
  CLINIC_AVAILABILITY_QUERY_REPOSITORY,
  IClinicAvailabilityQueryRepository,
} from '@modules/clinic/domain/repositories/clinic-availability.repository.interface';
import { DateTimeManager } from '@common/utils/date-time.manager';
import { ValidateTimeWithinClinicHoursOrThrowQuery } from './validate-time-within-clinic-hours.query';

@QueryHandler(ValidateTimeWithinClinicHoursOrThrowQuery)
export class ValidateTimeWithinClinicHoursOrThrowHandler
  implements IQueryHandler<ValidateTimeWithinClinicHoursOrThrowQuery, void>
{
  constructor(
    @Inject(CLINIC_AVAILABILITY_QUERY_REPOSITORY)
    private readonly clinicAvailabilityRepo: IClinicAvailabilityQueryRepository,
    @Inject(CLINIC_AVAILABILITY_DOMAIN_SERVICE)
    private readonly clinicAvailabilityDomainService: IClinicAvailabilityDomainService
  ) {}

  async execute(
    query: ValidateTimeWithinClinicHoursOrThrowQuery
  ): Promise<void> {
    const { clinicId, items } = query;

    const dates = items.map((i) => i.date.getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    const [availabilities, exceptions] = await Promise.all([
      this.clinicAvailabilityRepo.findAllByClinicId(clinicId),
      this.clinicAvailabilityRepo.findExceptionsByDateRange(
        clinicId,
        minDate,
        maxDate
      ),
    ]);

    const availabilityByDay = new Map(
      availabilities.map((a) => [a.dayOfWeek, a])
    );
    const exceptionByDate = new Map(
      exceptions.map((e) => [DateTimeManager.toDateKey(e.date), e])
    );

    for (const item of items) {
      const availability = availabilityByDay.get(item.date.getDay());
      const exception = exceptionByDate.get(
        DateTimeManager.toDateKey(item.date)
      );

      const isOpen =
        !!availability && !availability.isClosed && !exception?.isClosed;

      this.clinicAvailabilityDomainService.validateTimeWithinClinicHoursOrThrow(
        {
          startMinute: item.startMinute,
          endMinute: item.endMinute,
          clinicSchedule: {
            isOpen,
            workingHours: isOpen
              ? {
                  startMinute: availability.startMinute,
                  endMinute: availability.endMinute,
                }
              : null,
            reason: exception?.reason ?? null,
          },
        }
      );
    }
  }
}
