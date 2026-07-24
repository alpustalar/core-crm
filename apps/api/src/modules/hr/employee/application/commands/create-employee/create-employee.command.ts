import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateEmployee } from '@shared/modules/employee/schemas/commands/create-employee.schema';

export class CreateEmployeeCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly data: CreateEmployee,
    public readonly ctx: IGetContext
  ) {}
}
