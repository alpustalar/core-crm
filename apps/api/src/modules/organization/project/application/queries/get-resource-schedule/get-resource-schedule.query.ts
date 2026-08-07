import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import type { GetResourceSchedule } from '@shared/modules/project/types/queries';
import { GetResourceScheduleResponse } from './get-resource-schedule.response';

export class GetResourceScheduleQuery implements IQuery {
  readonly __responseType!: GetResourceScheduleResponse;

  constructor(
    public readonly payload: {
      readonly filter: GetResourceSchedule;
      readonly ctx: IGetContext;
    }
  ) {}
}
