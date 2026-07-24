import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CacheTransferRateOptionCommand } from './cache-transfer-rate-option.command';
import { TransferCacheService } from '@modules/crm/health-tourism/transfer/infrastructure/cache/transfer-cache.service';

@CommandHandler(CacheTransferRateOptionCommand)
export class CacheTransferRateOptionHandler
  implements ICommandHandler<CacheTransferRateOptionCommand, void>
{
  constructor(private readonly cacheService: TransferCacheService) {}

  async execute(command: CacheTransferRateOptionCommand): Promise<void> {
    await this.cacheService.transferRateOption.set(
      command.optionId,
      command.token
    );
  }
}
