import { ScheduleAppointmentDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class ScheduleAppointmentCommand {
  constructor(
    public readonly dto: ScheduleAppointmentDto,
    public readonly ctx: IGetContext
  ) {}
}
