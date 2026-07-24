import { IQuery } from '@nestjs/cqrs';
import { GetProviderScheduleQueryResponse } from '@modules/clinical/provider/application/queries/get-provider-schedule/get-provider-schedule.response';
import { IGetContext } from '@common/decorators';

export class GetProviderScheduleQuery implements IQuery {
  readonly __responseType!: GetProviderScheduleQueryResponse;
  constructor(
    public readonly payload: {
      providerId: string;
      startDate: Date;
      endDate: Date;
      ctx: IGetContext;
    }
  ) {}
}
