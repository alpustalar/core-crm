import { ScheduleAppointment } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class ScheduleAppointmentCommand {
  constructor(
    public readonly data: ScheduleAppointment,
    public readonly ctx: IGetContext
  ) {}
}
