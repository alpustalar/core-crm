import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { createHash } from 'crypto';
import { SearchTransferAvailabilityQuery } from './search-transfer-availability.query';
import { SearchTransferAvailabilityResponse } from './search-transfer-availability.response';
import {
  HOTELBEDS_TRANSFER_API_SERVICE,
  IHotelbedsTransferApiService,
} from '@modules/crm/health-tourism/transfer/domain/interfaces/hotelbeds-transfer-api.interface';
import { RedisService } from '@src/infrastructure/cache/redis/redis.service';
import { TransferAvailabilityItem } from '@modules/crm/health-tourism/transfer/domain/transfer.contracts';

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

    private readonly redis: RedisService
  ) {}

  async execute(
    query: SearchTransferAvailabilityQuery
  ): Promise<SearchTransferAvailabilityResponse> {
    const { dto } = query;

    const paramsHash = createHash('sha256')
      .update(JSON.stringify(dto))
      .digest('hex');

    const cached = await this.redis.getTransferAvailability(paramsHash);
    if (cached) {
      return {
        data: cached as TransferAvailabilityItem[],
        fromCache: true,
      };
    }

    const items = await this.transferApi.searchAvailability({
      language: dto.language,
      fromType: dto.fromType,
      fromCode: dto.fromCode,
      toType: dto.toType,
      toCode: dto.toCode,
      outboundDate: dto.outboundDate,
      outboundTime: dto.outboundTime,
      adults: dto.adults,
      children: dto.children,
      infants: dto.infants,
      ages: dto.ages,
      returnDate: dto.returnDate,
      returnTime: dto.returnTime,
    });

    await this.redis.setTransferAvailability(paramsHash, items);

    return { data: items, fromCache: false };
  }
}
