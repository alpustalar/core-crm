import { MessageChannelType as MessageChannel } from '@shared';

declare module 'ioredis' {
  interface Redis {
    /** SET NX PX; alınamazsa kalan PTTL'i (ms) döner, alındıysa -1. */
    acquireMessagingLock(
      key: string,
      holderId: string,
      ttlMs: string
    ): Promise<number>;
    releaseMessagingLock(key: string, holderId: string): Promise<number>;
    /** Kayan pencere kotası; hak varsa -1, yoksa kaç ms sonra tekrar denenebileceği. */
    consumeMessagingQuota(
      key: string,
      windowMs: string,
      limit: string,
      member: string
    ): Promise<number>;
  }
}

// ----------------------------------------------------------------------
// Payload Types
// ----------------------------------------------------------------------

export interface AcquireInboundLockPayload {
  channel: MessageChannel;
  /** Kanalın mesaj kimliği (WhatsApp wamid, Telegram update id, IG mid). */
  externalId: string;
  holderId: string;
  ttlSeconds?: number;
}

export interface ReleaseInboundLockPayload {
  channel: MessageChannel;
  externalId: string;
  holderId: string;
}

export interface ConsumeSendQuotaPayload {
  clinicId: string;
  /** Pencere başına izin verilen gönderim adedi. */
  limit?: number;
  windowSeconds?: number;
}

export interface AcquireDeliveryLockPayload {
  conversationId: string;
  holderId: string;
  ttlSeconds?: number;
}

export interface ReleaseDeliveryLockPayload {
  conversationId: string;
  holderId: string;
}

// ----------------------------------------------------------------------
// Result Types
// ----------------------------------------------------------------------

export type InboundLockResult =
  | { status: 'acquired' }
  /** Aynı externalId TTL penceresi içinde zaten işlendi/işleniyor. */
  | { status: 'duplicate' };

export type SendQuotaResult =
  | { status: 'allowed' }
  | { status: 'throttled'; retryAfterMs: number };

export type DeliveryLockResult =
  | { status: 'acquired' }
  /** Aynı yazışmada başka bir gönderim uçuşta — sıra bozulmasın diye beklenir. */
  | { status: 'busy'; retryAfterMs: number };

// ----------------------------------------------------------------------
// Contract Interfaces
// ----------------------------------------------------------------------

export interface IInboundDedupOperations {
  /**
   * Gelen webhook mesajını işleme hakkını alır. `duplicate` dönerse mesaj TTL
   * penceresi içinde zaten alınmıştır ve tekrar işlenmemelidir.
   */
  acquire(payload: AcquireInboundLockPayload): Promise<InboundLockResult>;

  /**
   * Kilidi yalnız tutan holder serbest bırakır. İşleme BAŞARISIZ olduğunda çağrılır;
   * başarıda kilit bilinçli olarak TTL boyunca dedup işareti şeklinde bırakılır.
   */
  release(payload: ReleaseInboundLockPayload): Promise<void>;
}

export interface ISendQuotaOperations {
  /**
   * Klinik başına kayan pencere (sliding window) kotasından bir gönderim hakkı düşer.
   * Pencere doluysa `throttled` + kaç ms sonra tekrar denenebileceği döner.
   */
  consume(payload: ConsumeSendQuotaPayload): Promise<SendQuotaResult>;
}

export interface IDeliveryLockOperations {
  /**
   * Yazışma başına gönderim mutex'i — aynı anda tek mesaj uçar, böylece kanala
   * ulaşma sırası kuyruğa alınma sırasıyla aynı kalır.
   */
  acquire(payload: AcquireDeliveryLockPayload): Promise<DeliveryLockResult>;

  release(payload: ReleaseDeliveryLockPayload): Promise<void>;
}

export interface IMessagingCacheService {
  readonly inboundDedupTtlSeconds: number;
  readonly deliveryLockTtlSeconds: number;
  readonly inboundDedup: IInboundDedupOperations;
  readonly sendQuota: ISendQuotaOperations;
  readonly deliveryLock: IDeliveryLockOperations;
}

// ----------------------------------------------------------------------
// Injection Token
// ----------------------------------------------------------------------

export const MESSAGING_CACHE_SERVICE = Symbol('IMessagingCacheService');
