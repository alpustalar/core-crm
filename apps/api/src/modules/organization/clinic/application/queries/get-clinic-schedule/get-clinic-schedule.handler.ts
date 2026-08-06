import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClinicScheduleQuery } from './get-clinic-schedule.query';
import { Inject } from '@nestjs/common';
import {
  CLINIC_AVAILABILITY_QUERY_REPOSITORY,
  IClinicAvailabilityQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic-availability/clinic-availability.query.repository.interface';
import { GetClinicScheduleQueryResponse } from '@modules/organization/clinic/application/queries/get-clinic-schedule/get-clinic-schedule.response';
import {
  CLINIC_EXCEPTION_QUERY_REPOSITORY,
  IClinicExceptionQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic-exception/clinic-exception.query.repository.interface';

@QueryHandler(GetClinicScheduleQuery)
export class GetClinicScheduleHandler
  implements
    IQueryHandler<GetClinicScheduleQuery, GetClinicScheduleQueryResponse>
{
  constructor(
    @Inject(CLINIC_AVAILABILITY_QUERY_REPOSITORY)
    private readonly clinicAvailabilityQueryRepo: IClinicAvailabilityQueryRepository,
    @Inject(CLINIC_EXCEPTION_QUERY_REPOSITORY)
    private readonly clinicExceptionQueryRepo: IClinicExceptionQueryRepository
  ) {}

  async execute(
    query: GetClinicScheduleQuery
  ): Promise<GetClinicScheduleQueryResponse> {
    const { clinicId, startDate, endDate } = query.payload;

    const [availabilities, exceptions] = await Promise.all([
      this.clinicAvailabilityQueryRepo.findAllByClinicId(clinicId),
      this.clinicExceptionQueryRepo.findExceptionsByDateRange(
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
