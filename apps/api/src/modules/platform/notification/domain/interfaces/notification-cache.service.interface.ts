export const NOTIFICATION_CACHE_SERVICE = Symbol('INotificationCacheService');

export interface INotificationCacheService {
  sseTicket: {
    set(ticket: string, userId: string): Promise<void>;
    consume(ticket: string): Promise<string | null>;
  };
}
