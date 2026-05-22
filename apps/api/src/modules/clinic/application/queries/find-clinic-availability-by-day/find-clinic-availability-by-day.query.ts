import { IQuery } from '@nestjs/cqrs';
import { FindClinicAvailabilityByDayQueryResponse } from '@modules/clinic/application/queries/find-clinic-availability-by-day/find-clinic-availability-by-day.response';

export class FindClinicAvailabilityByDayQuery implements IQuery {
  readonly __responseType!: FindClinicAvailabilityByDayQueryResponse;
  constructor(
    public readonly clinicId: string,
    public readonly date: Date
  ) {}
}
