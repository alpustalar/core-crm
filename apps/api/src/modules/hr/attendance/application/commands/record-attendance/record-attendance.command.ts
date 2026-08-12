import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { RecordAttendance } from '@shared/modules/attendance/types/commands';

export class RecordAttendanceCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly employeeId: string;
      readonly data: RecordAttendance;
      readonly ctx: IGetContext;
      readonly clinicId: string;
      readonly organizationId?: string | null;
    }
  ) {}
}
