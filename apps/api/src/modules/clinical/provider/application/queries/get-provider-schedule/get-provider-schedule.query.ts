import { IQuery } from '@nestjs/cqrs';
import { GetProviderScheduleQueryResponse } from '@modules/clinical/provider/application/queries/get-provider-schedule/get-provider-schedule.response';

export class GetProviderScheduleQuery implements IQuery {
  readonly __responseType!: GetProviderScheduleQueryResponse;
  constructor(
    public readonly providerId: string,
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {}
}
