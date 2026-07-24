import { IGetContext } from '@common/decorators/get-context.decorator';
import { ICommand } from '@nestjs/cqrs';
import { CancelAppointmentCommandResponse } from '@modules/clinical/appointment/application/commands/cancel-appointment/cancel-appointment.response';
import { CancelAppointment } from '@shared/modules/appointment/types/commands/cancel-appointment.type';

export class CancelAppointmentCommand implements ICommand {
  readonly __responseType!: CancelAppointmentCommandResponse;
  constructor(
    public readonly data: CancelAppointment,
    public readonly ctx: IGetContext
  ) {}
}
