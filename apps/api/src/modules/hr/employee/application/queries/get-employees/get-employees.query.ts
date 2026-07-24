import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { Pagination } from '@shared/common';
import { GetEmployeesResponse } from './get-employees.response';
import { GetEmployeesFilter } from '@shared/modules/employee/schemas/queries/get-employees.schema';

export class GetEmployeesQuery implements IQuery {
  readonly __responseType!: GetEmployeesResponse;
  constructor(
    public readonly payload: {
      readonly clinicId: string;
      readonly filter: GetEmployeesFilter;
      readonly pagination: Pagination;
      readonly ctx: IGetContext;
    }
  ) {}
}
