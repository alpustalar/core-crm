import { IGetContext } from '@common/decorators/get-context.decorator';
import { ICommand } from '@nestjs/cqrs';
import { CompleteAppointmentCommandResponse } from '@modules/appointment/application/commands/complete-appointment/complete-appointment.response';

export class CompleteAppointmentCommand implements ICommand {
  readonly __responseType!: CompleteAppointmentCommandResponse;
  constructor(
    public readonly appointmentId: string,
    public readonly ctx: IGetContext
  ) {}
}
