import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { CreateEmployee } from '@shared/modules/employee/types/commands';

export class CreateEmployeeCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly data: CreateEmployee,
    public readonly ctx: IGetContext
  ) {}
}
