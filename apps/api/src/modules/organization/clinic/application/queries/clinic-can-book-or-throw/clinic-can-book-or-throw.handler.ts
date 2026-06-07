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
import { DateTimeManager } from '@common/utils';
import { ClinicCanBookOrThrowQuery } from './clinic-can-book-or-throw.query';

@QueryHandler(ClinicCanBookOrThrowQuery)
export class ClinicCanBookOrThrowHandler
  implements IQueryHandler<ClinicCanBookOrThrowQuery, void>
{
  constructor(
    @Inject(CLINIC_AVAILABILITY_QUERY_REPOSITORY)
    private readonly clinicAvailabilityRepo: IClinicAvailabilityQueryRepository,
    @Inject(CLINIC_AVAILABILITY_DOMAIN_SERVICE)
    private readonly clinicAvailabilityDomainService: IClinicAvailabilityDomainService
  ) {}

  async execute(query: ClinicCanBookOrThrowQuery): Promise<void> {
    const { clinicId, startTime, endTime } = query;
    const dayOfWeek = startTime.getDay();

    const [availability, exception] = await Promise.all([
      this.clinicAvailabilityRepo.findByClinicAndDay(clinicId, dayOfWeek),
      this.clinicAvailabilityRepo.findExceptionByClinicAndDate(
        clinicId,
        startTime
      ),
    ]);

    const isOpen =
      !!availability && !availability.isClosed && !exception?.isClosed;

    this.clinicAvailabilityDomainService.validateTimeWithinClinicHoursOrThrow({
      startMinute: DateTimeManager.getDayMinutes(startTime),
      endMinute: DateTimeManager.getDayMinutes(endTime),
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
    });
  }
}
