import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { Pagination } from '@shared/common';
import { GetAttendanceByEmployeeResponse } from './get-attendance-by-employee.response';
import { GetAttendanceFilter } from '@shared/modules/attendance/schemas/queries/get-attendance-filter.schema';

export class GetAttendanceByEmployeeQuery implements IQuery {
  readonly __responseType!: GetAttendanceByEmployeeResponse;
  constructor(
    public readonly payload: {
      readonly employeeId: string;
      readonly filter: GetAttendanceFilter;
      readonly pagination: Pagination;
      readonly ctx: IGetContext;
    }
  ) {}
}
