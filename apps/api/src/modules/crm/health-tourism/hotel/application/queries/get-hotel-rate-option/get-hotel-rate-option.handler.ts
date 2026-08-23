import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetHotelRateOptionQuery } from './get-hotel-rate-option.query';
import { GetHotelRateOptionResponse } from './get-hotel-rate-option.response';
import {
  HOTEL_CACHE_SERVICE,
  IHotelCacheService,
} from '@modules/crm/health-tourism/hotel/domain/interfaces/hotel-cache.service.interface';

@QueryHandler(GetHotelRateOptionQuery)
export class GetHotelRateOptionHandler
  implements IQueryHandler<GetHotelRateOptionQuery, GetHotelRateOptionResponse>
{
  constructor(
    @Inject(HOTEL_CACHE_SERVICE)
    private readonly cacheService: IHotelCacheService
  ) {}

  async execute(
    query: GetHotelRateOptionQuery
  ): Promise<GetHotelRateOptionResponse> {
    const token = await this.cacheService.hotelRateOption.get(query.optionId);
    return { data: token };
  }
}
