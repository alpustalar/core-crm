import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SearchHotelsQuery } from './search-hotels.query';
import { SearchHotelsResponse } from './search-hotels.response';
import {
  HOTELBEDS_API_SERVICE,
  IHotelbedsApiService,
} from '@modules/crm/health-tourism/domain/interfaces/hotelbeds-api.interface';
import { DateTimeManager } from '@common/utils';

@QueryHandler(SearchHotelsQuery)
export class SearchHotelsHandler
  implements IQueryHandler<SearchHotelsQuery, SearchHotelsResponse>
{
  constructor(
    @Inject(HOTELBEDS_API_SERVICE)
    private readonly hotelbedsApi: IHotelbedsApiService,
  ) {}

  async execute(query: SearchHotelsQuery): Promise<SearchHotelsResponse> {
    const { dto } = query;

    const hotels = await this.hotelbedsApi.searchAvailability({
      checkIn: DateTimeManager.toDateString(dto.checkIn),
      checkOut: DateTimeManager.toDateString(dto.checkOut),
      occupancies: dto.occupancies,
      destinationCode: dto.destinationCode,
      hotelCodes: dto.hotelCodes,
    });

    return { data: hotels };
  }
}
