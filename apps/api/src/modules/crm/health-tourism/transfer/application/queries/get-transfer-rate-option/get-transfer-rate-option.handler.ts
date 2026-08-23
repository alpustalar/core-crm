import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTransferRateOptionQuery } from './get-transfer-rate-option.query';
import { GetTransferRateOptionResponse } from './get-transfer-rate-option.response';
import {
  ITransferCacheService,
  TRANSFER_CACHE_SERVICE,
} from '@modules/crm/health-tourism/transfer/domain/interfaces/transfer-cache.service.interface';

@QueryHandler(GetTransferRateOptionQuery)
export class GetTransferRateOptionHandler
  implements
    IQueryHandler<GetTransferRateOptionQuery, GetTransferRateOptionResponse>
{
  constructor(
    @Inject(TRANSFER_CACHE_SERVICE)
    private readonly cacheService: ITransferCacheService
  ) {}

  async execute(
    query: GetTransferRateOptionQuery
  ): Promise<GetTransferRateOptionResponse> {
    const token = await this.cacheService.transferRateOption.get(
      query.optionId
    );
    return { data: token };
  }
}
