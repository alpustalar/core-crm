import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClinicScheduleQuery } from './get-clinic-schedule.query';
import { Inject } from '@nestjs/common';
import {
  CLINIC_AVAILABILITY_REPO_TOKEN,
  IClinicAvailabilityRepository,
} from '@modules/clinic/domain/repositories/clinic-availability.repository.interface';
import { QueryResponse } from '@shared/common/response/response.interface';
import { GetClinicScheduleResponse } from '@modules/clinic/application/queries/get-clinic-schedule/get-clinic-schedule.response';

@QueryHandler(GetClinicScheduleQuery)
export class GetClinicScheduleHandler
  implements
    IQueryHandler<
      GetClinicScheduleQuery,
      QueryResponse<GetClinicScheduleResponse>
    >
{
  constructor(
    @Inject(CLINIC_AVAILABILITY_REPO_TOKEN)
    private readonly clinicAvailabilityRepo: IClinicAvailabilityRepository
  ) {}

  async execute(
    query: GetClinicScheduleQuery
  ): Promise<QueryResponse<GetClinicScheduleResponse>> {
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
