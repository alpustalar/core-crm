import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetAttendanceSummaryResponse } from './get-attendance-summary.response';
import type { GetAttendanceSummaryFilter } from '@shared/modules/attendance/types/queries';

export class GetAttendanceSummaryQuery implements IQuery {
  readonly __responseType!: GetAttendanceSummaryResponse;
  constructor(
    public readonly payload: {
      readonly employeeId: string;
      readonly filter: GetAttendanceSummaryFilter;
      readonly ctx: IGetContext;
    }
  ) {}
}
