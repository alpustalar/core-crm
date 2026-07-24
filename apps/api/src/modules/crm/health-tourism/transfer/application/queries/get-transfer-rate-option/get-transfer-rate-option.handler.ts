import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTransferRateOptionQuery } from './get-transfer-rate-option.query';
import { GetTransferRateOptionResponse } from './get-transfer-rate-option.response';
import { TransferCacheService } from '@modules/crm/health-tourism/transfer/infrastructure/cache/transfer-cache.service';
import { TransferRateOptionToken } from '@modules/crm/health-tourism/transfer/domain/contracts/transfer.contracts';

@QueryHandler(GetTransferRateOptionQuery)
export class GetTransferRateOptionHandler
  implements
    IQueryHandler<GetTransferRateOptionQuery, GetTransferRateOptionResponse>
{
  constructor(private readonly cacheService: TransferCacheService) {}

  async execute(
    query: GetTransferRateOptionQuery
  ): Promise<GetTransferRateOptionResponse> {
    const token = (await this.cacheService.transferRateOption.get(
      query.optionId
    )) as TransferRateOptionToken | null;
    return { data: token };
  }
}
