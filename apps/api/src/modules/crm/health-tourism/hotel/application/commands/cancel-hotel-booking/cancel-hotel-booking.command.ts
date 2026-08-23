import { CancelHotelBookingDto } from '@shared/modules/health-tourism/dto/commands';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class CancelHotelBookingCommand {
  constructor(
    public readonly dto: CancelHotelBookingDto,
    public readonly ctx: IGetContext
  ) {}
}
