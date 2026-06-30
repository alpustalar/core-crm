import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  CLINIC_AVAILABILITY_DOMAIN_SERVICE,
  IClinicAvailabilityDomainService,
} from '@modules/organization/clinic/domain/interfaces/clinic-availability.domain-service.interface';
import {
  CLINIC_AVAILABILITY_QUERY_REPOSITORY,
  IClinicAvailabilityQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic-availability.repository.interface';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';

import {
  CLINIC_EXCEPTION_QUERY_REPOSITORY,
  IClinicExceptionQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinix-exception.repository.interface';
import { AssertTimeWithinClinicHoursQuery } from '@modules/organization/clinic/application/queries/assert-time-within-clinic-hours/assert-time-within-clinic-hours.query';

@QueryHandler(AssertTimeWithinClinicHoursQuery)
export class AssertTimeWithinClinicHoursHandler
  implements IQueryHandler<AssertTimeWithinClinicHoursQuery, void>
{
  constructor(
    @Inject(CLINIC_AVAILABILITY_QUERY_REPOSITORY)
    private readonly clinicAvailabilityRepo: IClinicAvailabilityQueryRepository,
    @Inject(CLINIC_EXCEPTION_QUERY_REPOSITORY)
    private readonly clinicExceptionQueryRepo: IClinicExceptionQueryRepository,
    @Inject(CLINIC_AVAILABILITY_DOMAIN_SERVICE)
    private readonly clinicAvailabilityDomainService: IClinicAvailabilityDomainService
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
