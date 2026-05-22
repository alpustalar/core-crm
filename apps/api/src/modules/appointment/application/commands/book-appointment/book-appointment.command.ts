import { BookAppointmentDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { ICommand } from '@nestjs/cqrs';
import { BookAppointmentCommandResponse } from '@modules/appointment/application/commands/book-appointment/book-appointment.response';

export class BookAppointmentCommand implements ICommand {
  readonly __responseType!: BookAppointmentCommandResponse;
  constructor(
    public readonly dto: BookAppointmentDto,
    public readonly ctx: IGetContext
  ) {}
}
