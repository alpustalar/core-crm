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
import { AssertClinicCanBookQuery } from './assert-clinic-can-book.query';
import {
  CLINIC_EXCEPTION_QUERY_REPOSITORY,
  IClinicExceptionQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinix-exception.repository.interface';

@QueryHandler(AssertClinicCanBookQuery)
export class AssertClinicCanBookHandler
  implements IQueryHandler<AssertClinicCanBookQuery, void>
{
  constructor(
    @Inject(CLINIC_AVAILABILITY_QUERY_REPOSITORY)
    private readonly clinicAvailabilityQueryRepository: IClinicAvailabilityQueryRepository,
    @Inject(CLINIC_EXCEPTION_QUERY_REPOSITORY)
    private readonly clinicExceptionQueryRepo: IClinicExceptionQueryRepository,
    @Inject(CLINIC_AVAILABILITY_DOMAIN_SERVICE)
    private readonly clinicAvailabilityDomainService: IClinicAvailabilityDomainService
  ) {}

  async execute(query: AssertClinicCanBookQuery): Promise<void> {
    const { clinicId, startTime, endTime } = query;
    const dayOfWeek = startTime.getDay();

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
