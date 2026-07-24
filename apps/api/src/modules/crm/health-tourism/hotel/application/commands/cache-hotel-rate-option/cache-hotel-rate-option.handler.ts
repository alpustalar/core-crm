import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CacheHotelRateOptionCommand } from './cache-hotel-rate-option.command';
import { HotelCacheService } from '@modules/crm/health-tourism/hotel/infrastructure/cache/hotel-cache.service';

@CommandHandler(CacheHotelRateOptionCommand)
export class CacheHotelRateOptionHandler
  implements ICommandHandler<CacheHotelRateOptionCommand, void>
{
  constructor(private readonly cacheService: HotelCacheService) {}

  async execute(command: CacheHotelRateOptionCommand): Promise<void> {
    await this.cacheService.hotelRateOption.set(
      command.optionId,
      command.token
    );
  }
}
