import { CancelAppointmentDto } from '@shared/modules/appointment/dto/commands/cancel-appointment.dto';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class PatientCancelAppointmentCommand {
  constructor(
    public readonly dto: CancelAppointmentDto,
    public readonly ctx: IGetContext
  ) {}
}
