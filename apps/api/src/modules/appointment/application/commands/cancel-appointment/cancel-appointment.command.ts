import { IGetContext } from '@common/decorators/get-context.decorator';
import { CancelAppointmentDto } from '@shared/modules/appointment/dto/commands/cancel-appointment.dto';
import { ICommand } from '@nestjs/cqrs';
import { CancelAppointmentCommandResponse } from '@modules/appointment/application/commands/cancel-appointment/cancel-appointment.response';

export class CancelAppointmentCommand implements ICommand {
  readonly __responseType!: CancelAppointmentCommandResponse;
  constructor(
    public readonly dto: CancelAppointmentDto,
    public readonly ctx: IGetContext
  ) {}
}
