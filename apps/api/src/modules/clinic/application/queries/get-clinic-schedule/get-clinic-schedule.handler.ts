import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClinicScheduleQuery } from './get-clinic-schedule.query';
import { Inject } from '@nestjs/common';
import {
  CLINIC_AVAILABILITY_QUERY_REPOSITORY,
  IClinicAvailabilityQueryRepository,
} from '@modules/clinic/domain/repositories/clinic-availability.repository.interface';
import { GetClinicScheduleQueryResponse } from '@modules/clinic/application/queries/get-clinic-schedule/get-clinic-schedule.response';

@QueryHandler(GetClinicScheduleQuery)
export class GetClinicScheduleHandler
  implements
    IQueryHandler<GetClinicScheduleQuery, GetClinicScheduleQueryResponse>
{
  constructor(
    @Inject(CLINIC_AVAILABILITY_QUERY_REPOSITORY)
    private readonly clinicAvailabilityRepo: IClinicAvailabilityQueryRepository
  ) {}

  async execute(
    query: GetClinicScheduleQuery
  ): Promise<GetClinicScheduleQueryResponse> {
    const { clinicId, startDate, endDate } = query;

    const [availabilities, exceptions] = await Promise.all([
      this.clinicAvailabilityRepo.findAllByClinicId(clinicId),
      this.clinicAvailabilityRepo.findExceptionsByDateRange(
        clinicId,
        startDate,
        endDate
      ),
    ]);

    return {
      data: {
        availabilities,
        exceptions,
      },
    };
  }
}
