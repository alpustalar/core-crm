import { AsyncLocalStorage } from 'async_hooks';
import type { ClientSession } from 'mongoose';

export interface MongoSessionContext {
  session: ClientSession;
}

/**
 * Aktif Mongo transaction session'ını çağrı zincirine taşır — Prisma tarafındaki
 * `txStorage`'ın karşılığı. Repository'ler `session`'ı parametre olarak almak yerine
 * buradan okur, böylece handler'lar transaction'ı elden ele geçirmez.
 *
 * NOT: Bu store yalnız **session**'ı taşır. Domain event'leri yine `txStorage`'ta
 * birikir (`ContextService.addEvent`) — event boru hattı ortaktır, yalnız
 * kalıcılaştırma hedefi (Postgres Outbox / Mongo outbox) farklıdır.
 */
export const mongoSessionStorage = new AsyncLocalStorage<MongoSessionContext>();

/** Aktif session (yoksa undefined) — repository okumaları/yazmaları buna bağlanır. */
export const getMongoSession = (): ClientSession | undefined =>
  mongoSessionStorage.getStore()?.session;
