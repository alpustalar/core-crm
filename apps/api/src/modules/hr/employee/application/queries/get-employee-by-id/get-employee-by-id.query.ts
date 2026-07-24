import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetEmployeeByIdResponse } from './get-employee-by-id.response';

export class GetEmployeeByIdQuery implements IQuery {
  readonly __responseType!: GetEmployeeByIdResponse;
  constructor(
    public readonly employeeId: string,
    public readonly ctx: IGetContext
  ) {}
}
