import { StaffRescheduleDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class StaffRescheduleCommand {
  constructor(
    public readonly dto: StaffRescheduleDto,
    public readonly ctx: IGetContext
  ) {}
}
