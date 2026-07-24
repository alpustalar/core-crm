import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Observable, Subject } from 'rxjs';
import { StaffNotificationRealtimePayload } from '@modules/platform/notification/domain/contracts/staff-notification.contracts';

const CHANNEL_PREFIX = 'notif:user:';
const CHANNEL_PATTERN = `${CHANNEL_PREFIX}*`;

/**
 * Real-time bildirim köprüsü. Yayın Redis Pub/Sub üzerinden yapılır (çok-instance
 * fan-out): bir instance'ta üretilen bildirim, kullanıcı hangi instance'a SSE ile
 * bağlıysa oraya ulaşır. Her instance kendi psubscribe'ıyla dinler ve yalnız
 * kendisine bağlı kullanıcıların in-memory Subject'ine iletir.
 */
@Injectable()
export class NotificationRealtimeBridge
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(NotificationRealtimeBridge.name);
  private subscriber?: Redis;
  private readonly streams = new Map<
    string,
    Subject<StaffNotificationRealtimePayload>
  >();

  constructor(@InjectRedis() private readonly redis: Redis) {}

  async onModuleInit(): Promise<void> {
    // Abone bağlantısı ayrı olmalı: subscribe modundaki bir bağlantı normal komut çalıştıramaz.
    this.subscriber = this.redis.duplicate();
    await this.subscriber.psubscribe(CHANNEL_PATTERN);
    this.subscriber.on('pmessage', (_pattern, channel, message) => {
      const userId = channel.slice(CHANNEL_PREFIX.length);
      const subject = this.streams.get(userId);
      if (!subject) return; // bu instance'ta bağlı client yok

      try {
        subject.next(JSON.parse(message) as StaffNotificationRealtimePayload);
      } catch (error) {
        this.logger.error(`Bildirim mesajı çözümlenemedi: ${error}`);
      }
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.subscriber?.quit();
    this.streams.forEach((subject) => subject.complete());
    this.streams.clear();
  }

  /** Bir kullanıcıya bildirim yayınlar — Redis üzerinden tüm instance'lara fan-out. */
  async publish(
    userId: string,
    payload: StaffNotificationRealtimePayload
  ): Promise<void> {
    await this.redis.publish(
      `${CHANNEL_PREFIX}${userId}`,
      JSON.stringify(payload)
    );
  }

  /**
   * Bu instance'ta bir kullanıcının canlı akışını döndürür. Aynı kullanıcının
   * birden çok sekmesi tek Subject'i paylaşır; son dinleyici ayrılınca temizlenir.
   */
  streamFor(
    userId: string
  ): Observable<StaffNotificationRealtimePayload> {
    let subject = this.streams.get(userId);
    if (!subject) {
      subject = new Subject<StaffNotificationRealtimePayload>();
      this.streams.set(userId, subject);
    }
    const activeSubject = subject;

    return new Observable<StaffNotificationRealtimePayload>((subscriber) => {
      const subscription = activeSubject.subscribe(subscriber);
      return () => {
        subscription.unsubscribe();
        if (activeSubject.observers.length === 0) {
          this.streams.delete(userId);
        }
      };
    });
  }
}
