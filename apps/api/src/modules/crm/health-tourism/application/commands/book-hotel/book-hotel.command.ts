import { BookHotelDto } from '@shared/modules/health-tourism/dto/commands';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class BookHotelCommand {
  constructor(
    public readonly dto: BookHotelDto,
    public readonly ctx: IGetContext,
  ) {}
}
