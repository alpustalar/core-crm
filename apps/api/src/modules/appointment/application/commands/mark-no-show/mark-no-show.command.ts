import { IGetContext } from '@common/decorators/get-context.decorator';

export class MarkNoShowCommand {
  constructor(
    public readonly appointmentId: string,
    public readonly ctx: IGetContext
  ) {}
}
