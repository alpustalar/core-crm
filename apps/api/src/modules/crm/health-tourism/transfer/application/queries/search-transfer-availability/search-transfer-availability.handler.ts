import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { createHash } from 'crypto';
import { SearchTransferAvailabilityQuery } from './search-transfer-availability.query';
import { SearchTransferAvailabilityResponse } from './search-transfer-availability.response';
import {
  HOTELBEDS_TRANSFER_API_SERVICE,
  IHotelbedsTransferApiService,
} from '@modules/crm/health-tourism/transfer/domain/interfaces/hotelbeds-transfer-api.interface';
import {
  ITransferCacheService,
  TRANSFER_CACHE_SERVICE,
} from '@modules/crm/health-tourism/transfer/domain/interfaces/transfer-cache.service.interface';

@QueryHandler(SearchTransferAvailabilityQuery)
export class SearchTransferAvailabilityHandler
  implements
    IQueryHandler<
      SearchTransferAvailabilityQuery,
      SearchTransferAvailabilityResponse
    >
{
  constructor(
    @Inject(HOTELBEDS_TRANSFER_API_SERVICE)
    private readonly transferApi: IHotelbedsTransferApiService,
    @Inject(TRANSFER_CACHE_SERVICE)
    private readonly cacheService: ITransferCacheService
  ) {}

  async execute(
    query: SearchTransferAvailabilityQuery
  ): Promise<SearchTransferAvailabilityResponse> {
    const { filter } = query;

    const paramsHash = createHash('sha256')
      .update(JSON.stringify(filter))
      .digest('hex');

    const cached = await this.cacheService.transferAvailability.get(paramsHash);
    if (cached) {
      return {
        data: cached,
        meta: {
          fromCache: true,
        },
      };
    }

    const items = await this.transferApi.searchAvailability({
      language: filter.language,
      fromType: filter.fromType,
      fromCode: filter.fromCode,
      toType: filter.toType,
      toCode: filter.toCode,
      outboundDate: filter.outboundDate,
      outboundTime: filter.outboundTime,
      adults: filter.adults,
      children: filter.children,
      infants: filter.infants,
      ages: filter.ages,
      returnDate: filter.returnDate,
      returnTime: filter.returnTime,
    });

    await this.cacheService.transferAvailability.set(paramsHash, items);

    return { data: items, meta: { fromCache: false } };
  }
}
