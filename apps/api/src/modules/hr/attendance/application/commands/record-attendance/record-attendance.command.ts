import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { RecordAttendance } from '@shared/modules/attendance/schemas/commands/record-attendance.schema';

export class RecordAttendanceCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly employeeId: string;
      readonly data: RecordAttendance;
      readonly ctx: IGetContext;
    }
  ) {}
}
