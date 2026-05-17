import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindClinicAvailabilityByDayQuery } from './find-clinic-availability-by-day.query';
import { Inject } from '@nestjs/common';
import {
  CLINIC_AVAILABILITY_REPO_TOKEN,
  IClinicAvailabilityRepository,
} from '@modules/clinic/domain/repositories/clinic-availability.repository.interface';
import { FindClinicAvailabilityByDayResponse } from '@modules/clinic/application/queries/find-clinic-availability-by-day/find-clinic-availability-by-day.response';
import { QueryResponse } from '@shared/common/response/response.interface';

@QueryHandler(FindClinicAvailabilityByDayQuery)
export class FindClinicAvailabilityByDayHandler
  implements
    IQueryHandler<
      FindClinicAvailabilityByDayQuery,
      QueryResponse<FindClinicAvailabilityByDayResponse>
    >
{
  constructor(
    @Inject(CLINIC_AVAILABILITY_REPO_TOKEN)
    private readonly clinicAvailabilityRepo: IClinicAvailabilityRepository
  ) {}

  async execute(
    query: FindClinicAvailabilityByDayQuery
  ): Promise<QueryResponse<FindClinicAvailabilityByDayResponse>> {
    const { clinicId, date } = query;
    const dayOfWeek = date.getDay();

    const [availability, exception] = await Promise.all([
      this.clinicAvailabilityRepo.findByClinicAndDay(clinicId, dayOfWeek),
      this.clinicAvailabilityRepo.findExceptionByClinicAndDate(clinicId, date),
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
