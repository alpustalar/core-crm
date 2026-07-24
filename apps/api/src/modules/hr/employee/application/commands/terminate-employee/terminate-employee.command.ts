import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { TerminateEmployee } from '@shared/modules/employee/schemas/commands/terminate-employee.schema';

export class TerminateEmployeeCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly employeeId: string;
      readonly data: TerminateEmployee;
      readonly ctx: IGetContext;
    }
  ) {}
}
