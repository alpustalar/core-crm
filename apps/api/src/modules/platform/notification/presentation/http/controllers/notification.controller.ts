import {
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Sse,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { interval, map, merge, Observable } from 'rxjs';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { Public } from '@common/decorators/public.decorator';
import { PaginationDto } from '@shared';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { NotificationRealtimeBridge } from '@modules/platform/notification/infrastructure/realtime/notification-realtime.bridge';
import { GetMyNotificationsQuery } from '@modules/platform/notification/application/queries/get-my-notifications/get-my-notifications.query';
import { GetUnreadCountQuery } from '@modules/platform/notification/application/queries/get-unread-count/get-unread-count.query';
import { MarkNotificationReadCommand } from '@modules/platform/notification/application/commands/mark-notification-read/mark-notification-read.command';
import { MarkAllNotificationsReadCommand } from '@modules/platform/notification/application/commands/mark-all-notifications-read/mark-all-notifications-read.command';
import {
  INotificationCacheService,
  NOTIFICATION_CACHE_SERVICE,
} from '@modules/platform/notification/domain/interfaces/notification-cache.service.interface';

// SSE keepalive — ara proxy'ler boşta bağlantıyı düşürmesin diye periyodik ping.
const SSE_HEARTBEAT_MS = 25000;

/**
 * Personel panel-içi bildirim merkezi. Kapsam daima aktörün kendisidir
 * (staffId = actor.userId); başka kullanıcının bildirimi görülmez/değişmez.
 */
@UseGuards(AuthGuard)
@Controller()
export class NotificationController {
  constructor(
    @Inject(NOTIFICATION_CACHE_SERVICE)
    private readonly cacheService: INotificationCacheService,
    private readonly queryBus: TSQueryBus,
    private readonly commandBus: TSCommandBus,
    private readonly realtimeBridge: NotificationRealtimeBridge
  ) {}

  /**
   * SSE bağlantı bileti üretir. Tarayıcı `EventSource` Authorization header
   * gönderemediği için, auth'lu bu endpoint'ten alınan tek-kullanımlık kısa
   * ömürlü bilet stream açılışında `?ticket=` ile kullanılır.
   */
  @Post('stream-ticket')
  async createStreamTicket(
    @GetContext() ctx: IGetContext
  ): Promise<{ ticket: string }> {
    const ticket = randomUUID();
    await this.cacheService.sseTicket.set(ticket, ctx.actor.userId);
    return { ticket };
  }

  /**
   * Canlı bildirim akışı (SSE). Bilet ile doğrulanır (header taşınamaz), bu yüzden
   * @Public — AuthGuard bypass edilir ama erişim tek-kullanımlık bilete bağlıdır.
   */
  @Public()
  @Sse('stream')
  async stream(
    @Query('ticket') ticket?: string
  ): Promise<Observable<MessageEvent>> {
    const staffId = ticket
      ? await this.cacheService.sseTicket.consume(ticket)
      : null;

    if (!staffId) {
      throw new UnauthorizedException(
        'Geçersiz veya süresi dolmuş bağlantı bileti.'
      );
    }

    const notifications$ = this.realtimeBridge
      .streamFor(staffId)
      .pipe(
        map(
          (payload) =>
            ({ data: payload, type: 'notification' }) as unknown as MessageEvent
        )
      );
    const heartbeat$ = interval(SSE_HEARTBEAT_MS).pipe(
      map(() => ({ data: 'ping', type: 'ping' }) as unknown as MessageEvent)
    );

    return merge(notifications$, heartbeat$);
  }

  @Get()
  list(
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext,
    @Query('onlyUnread') onlyUnread?: string
  ) {
    return this.queryBus.execute(
      new GetMyNotificationsQuery({
        pagination,
        ctx,
        onlyUnread: onlyUnread === 'true',
      })
    );
  }

  @Get('unread-count')
  unreadCount(@GetContext() ctx: IGetContext) {
    return this.queryBus.execute(new GetUnreadCountQuery(ctx));
  }

  @Patch('read-all')
  readAll(@GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new MarkAllNotificationsReadCommand(ctx));
  }

  @Patch(':id/read')
  read(@Param('id') id: string, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new MarkNotificationReadCommand(id, ctx));
  }
}
