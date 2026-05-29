import { IGetContext } from '@common/decorators/get-context.decorator';
import { ICommand } from '@nestjs/cqrs';

export class CompleteAppointmentCommand implements ICommand {
  readonly __responseType!: void;
  constructor(
    public readonly appointmentId: string,
    public readonly ctx: IGetContext
  ) {}
}
