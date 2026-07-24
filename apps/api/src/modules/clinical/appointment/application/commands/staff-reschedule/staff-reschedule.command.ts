import { StaffReschedule } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class StaffRescheduleCommand {
  constructor(
    public readonly data: StaffReschedule,
    public readonly ctx: IGetContext
  ) {}
}
