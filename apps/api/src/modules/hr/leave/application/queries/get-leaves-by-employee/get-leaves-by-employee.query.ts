import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { Pagination } from '@shared/common';
import { GetLeavesByEmployeeResponse } from './get-leaves-by-employee.response';
import { GetLeavesFilter } from '@shared/modules/leave/schemas/queries/get-leaves-filter.schema';

export class GetLeavesByEmployeeQuery implements IQuery {
  readonly __responseType!: GetLeavesByEmployeeResponse;
  constructor(
    public readonly payload: {
      employeeId: string;
      filter: GetLeavesFilter;
      pagination: Pagination;
      ctx: IGetContext;
    }
  ) {}
}
