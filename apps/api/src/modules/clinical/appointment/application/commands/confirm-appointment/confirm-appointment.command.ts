import { IGetContext } from '@common/decorators/get-context.decorator';
import { ICommand } from '@nestjs/cqrs';
import { ConfirmAppointmentCommandResponse } from '@modules/clinical/appointment/application/commands/confirm-appointment/confirm-appointment.response';

export class ConfirmAppointmentCommand implements ICommand {
  readonly __responseType!: ConfirmAppointmentCommandResponse;
  constructor(
    public readonly appointmentId: string,
    public readonly ctx: IGetContext
  ) {}
}
