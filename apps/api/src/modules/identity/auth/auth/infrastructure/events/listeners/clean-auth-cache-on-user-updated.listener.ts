import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuthCacheService } from '@modules/identity/auth/auth/infrastructure/cache/auth-cache.service';
import { USER_EVENTS } from '@src/domain/constants/events';

@Injectable()
export class CleanAuthCacheOnUserUpdatedListener {
  private readonly logger = new Logger(
    CleanAuthCacheOnUserUpdatedListener.name
  );

  constructor(private readonly cacheService: AuthCacheService) {}

  @OnEvent([
    USER_EVENTS.UPDATE,
    USER_EVENTS.SOFT_DELETED,
    USER_EVENTS.BULK_SOFT_DELETED,
    USER_EVENTS.BULK_CHANGE_STATUS,
  ])
  async handle(payload: { userId?: string }): Promise<void> {
    if (!payload?.userId) return;

    try {
      await this.cacheService.actorContext.del(payload.userId);
    } catch (err) {
      this.logger.error(
        `User auth cache bust hatası (userId: ${payload.userId})`,
        err
      );
    }
  }
}
