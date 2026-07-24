import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { UpdateEmployee } from '@shared/modules/employee/schemas/commands/update-employee.schema';

export class UpdateEmployeeCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly employeeId: string;
      readonly data: UpdateEmployee;
      readonly ctx: IGetContext;
    }
  ) {}
}
