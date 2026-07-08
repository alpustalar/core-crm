import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindClinicAvailabilityByDayQuery } from './find-clinic-availability-by-day.query';
import { Inject } from '@nestjs/common';
import {
  CLINIC_AVAILABILITY_QUERY_REPOSITORY,
  IClinicAvailabilityQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic-availability.repository.interface';
import { FindClinicAvailabilityByDayQueryResponse } from '@modules/organization/clinic/application/queries/find-clinic-availability-by-day/find-clinic-availability-by-day.response';
import {
  CLINIC_EXCEPTION_QUERY_REPOSITORY,
  IClinicExceptionQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic-exception.repository.interface';

@QueryHandler(FindClinicAvailabilityByDayQuery)
export class FindClinicAvailabilityByDayHandler
  implements
    IQueryHandler<
      FindClinicAvailabilityByDayQuery,
      FindClinicAvailabilityByDayQueryResponse
    >
{
  constructor(
    @Inject(CLINIC_AVAILABILITY_QUERY_REPOSITORY)
    private readonly clinicAvailabilityQueryRepository: IClinicAvailabilityQueryRepository,
    @Inject(CLINIC_EXCEPTION_QUERY_REPOSITORY)
    private readonly clinicExceptionQueryRepo: IClinicExceptionQueryRepository
  ) {}

  async execute(
    query: FindClinicAvailabilityByDayQuery
  ): Promise<FindClinicAvailabilityByDayQueryResponse> {
    const { clinicId, date } = query;
    const dayOfWeek = date.getDay();

    const [availability, exception] = await Promise.all([
      this.clinicAvailabilityQueryRepository.findByClinicAndDay(
        clinicId,
        dayOfWeek
      ),
      this.clinicExceptionQueryRepo.findExceptionByClinicAndDate(
        clinicId,
        date
      ),
    ]);

    const isOpen =
      !!availability && !availability.isClosed && !exception?.isClosed;

    return {
      data: {
        isOpen,
        workingHours: isOpen
          ? {
              startMinute: availability.startMinute,
              endMinute: availability.endMinute,
            }
          : null,
        reason: exception?.reason ?? null,
      },
    };
  }
}
