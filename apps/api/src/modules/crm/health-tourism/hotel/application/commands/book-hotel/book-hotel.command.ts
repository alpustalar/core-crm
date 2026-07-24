import { IGetContext } from '@common/decorators/get-context.decorator';
import { BookHotelResponse } from './book-hotel.response';
import { BookHotel } from '@shared/modules/health-tourism';

export class BookHotelCommand {
  readonly __responseType!: BookHotelResponse;

  constructor(
    public readonly data: BookHotel,
    public readonly ctx: IGetContext
  ) {}
}
