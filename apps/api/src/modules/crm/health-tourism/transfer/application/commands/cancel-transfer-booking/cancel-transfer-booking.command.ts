import { CancelTransferBookingDto } from '@shared/modules/health-tourism/dto/commands';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class CancelTransferBookingCommand {
  constructor(
    public readonly dto: CancelTransferBookingDto,
    public readonly ctx: IGetContext
  ) {}
}
