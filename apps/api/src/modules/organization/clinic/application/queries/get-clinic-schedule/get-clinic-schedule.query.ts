import { GetClinicScheduleQueryResponse } from '@modules/organization/clinic/application/queries/get-clinic-schedule/get-clinic-schedule.response';
import { IQuery } from '@nestjs/cqrs';

export class GetClinicScheduleQuery implements IQuery {
  readonly __responseType!: GetClinicScheduleQueryResponse;
  constructor(
    public readonly clinicId: string,
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {}
}
