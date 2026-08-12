import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { AddEmployeeContract } from '@shared/modules/employee/types/commands';

export class AddEmployeeContractCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly payload: {
      readonly employeeId: string;
      readonly data: AddEmployeeContract;
      readonly ctx: IGetContext;
    }
  ) {}
}
