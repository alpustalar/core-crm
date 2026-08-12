import {
  Controller,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { MarkNotificationReadCommand } from '@modules/platform/notification/application/commands/mark-notification-read/mark-notification-read.command';
import { MarkAllNotificationsReadCommand } from '@modules/platform/notification/application/commands/mark-all-notifications-read/mark-all-notifications-read.command';
import {
  INotificationCacheService,
  NOTIFICATION_CACHE_SERVICE,
} from '@modules/platform/notification/domain/interfaces/notification-cache.service.interface';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { STAFFNOTIFICATION } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class NotificationCommandController {
  constructor(
    @Inject(NOTIFICATION_CACHE_SERVICE)
    private readonly cacheService: INotificationCacheService,
    private readonly commandBus: TSCommandBus
  ) {}

  /**
   * SSE bağlantı bileti üretir. Tarayıcı `EventSource` Authorization header
   * gönderemediği için, auth'lu bu endpoint'ten alınan tek-kullanımlık kısa
   * ömürlü bilet stream açılışında `?ticket=` ile kullanılır.
   */
  @HasCapability(STAFFNOTIFICATION.read)
  @Post('stream-ticket')
  async createStreamTicket(
    @GetContext() ctx: IGetContext
  ): Promise<{ ticket: string }> {
    const ticket = randomUUID();
    await this.cacheService.sseTicket.set(ticket, ctx.actor.userId);
    return { ticket };
  }

  @HasCapability(STAFFNOTIFICATION.update)
  @Patch('read-all')
  readAll(@GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new MarkAllNotificationsReadCommand(ctx));
  }

  @HasCapability(STAFFNOTIFICATION.update)
  @Patch(':id/read')
  read(@Param('id') id: string, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new MarkNotificationReadCommand(id, ctx));
  }
}
