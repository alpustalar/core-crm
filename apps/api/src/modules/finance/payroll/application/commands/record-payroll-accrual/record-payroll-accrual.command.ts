import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { RecordPayrollAccrual } from '@shared/modules/payroll/types/commands';

export class RecordPayrollAccrualCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly dto: RecordPayrollAccrual,
    public readonly ctx: IGetContext
  ) {}
}
