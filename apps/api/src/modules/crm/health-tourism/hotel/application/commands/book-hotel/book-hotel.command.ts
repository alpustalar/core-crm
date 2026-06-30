import { BookHotelDto } from '@shared/modules/health-tourism/dto/commands';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { BookHotelResponse } from './book-hotel.response';

export class BookHotelCommand {
  readonly __responseType!: BookHotelResponse;

  constructor(
    public readonly dto: BookHotelDto,
    public readonly ctx: IGetContext,
  ) {}
}
