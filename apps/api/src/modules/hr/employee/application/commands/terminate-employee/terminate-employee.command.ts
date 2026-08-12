import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { TerminateEmployee } from '@shared/modules/employee/types/commands';

export class TerminateEmployeeCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly employeeId: string;
      readonly data: TerminateEmployee;
      readonly ctx: IGetContext;
    }
  ) {}
}
