import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetHotelRateOptionQuery } from './get-hotel-rate-option.query';
import { GetHotelRateOptionResponse } from './get-hotel-rate-option.response';
import { HotelCacheService } from '@modules/crm/health-tourism/hotel/infrastructure/cache/hotel-cache.service';
import { HotelRateOptionToken } from '@modules/crm/health-tourism/hotel/domain/contracts/hotel.contracts';

@QueryHandler(GetHotelRateOptionQuery)
export class GetHotelRateOptionHandler
  implements IQueryHandler<GetHotelRateOptionQuery, GetHotelRateOptionResponse>
{
  constructor(private readonly cacheService: HotelCacheService) {}

  async execute(
    query: GetHotelRateOptionQuery
  ): Promise<GetHotelRateOptionResponse> {
    const token = (await this.cacheService.hotelRateOption.get(
      query.optionId
    )) as HotelRateOptionToken | null;
    return { data: token };
  }
}
