import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { THROTTLE_EVENTS } from '@src/domain/constants/events';
import { RateLimitExceededPayload } from './throttle-monitor.guard';

@Injectable()
export class ThrottleMonitorListener {
  private readonly logger = new Logger(ThrottleMonitorListener.name);

  @OnEvent(THROTTLE_EVENTS.RATE_LIMIT_EXCEEDED, { async: true })
  handle(payload: RateLimitExceededPayload) {
    this.logger.warn(
      `Rate limit exceeded | ${payload.method} ${payload.url} | ip: ${payload.ip} | userId: ${payload.userId ?? 'anonymous'} | hits: ${payload.totalHits}/${payload.limit} | ttl: ${payload.ttl}ms`
    );
  }
}
