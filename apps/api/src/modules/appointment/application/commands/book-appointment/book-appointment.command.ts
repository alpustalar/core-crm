import { BookAppointmentDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class BookAppointmentCommand {
  constructor(
    public readonly dto: BookAppointmentDto,
    public readonly context: IGetContext
  ) {}
}
