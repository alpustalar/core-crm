import { AsyncLocalStorage } from 'async_hooks';
import { DomainEvent } from '@common/interfaces';

export interface TransactionContext {
  /**
   * Aktif veritabanı transaction handle'ı — Prisma'da `Prisma.TransactionClient`,
   * Mongo'da yoktur (Mongo session'ı ayrı bir ALS'te, `mongoSessionStorage`'da tutulur).
   *
   * Tip bilerek `unknown`: bu bağlam **veritabanı-bağımsızdır**. `Prisma.TransactionClient`
   * olarak tiplenseydi, event toplama mekanizmasının tamamı (`BaseEvent`, `AggregateRoot`,
   * `ContextService`) `@prisma/client`'a zincirlenirdi ve messaging gibi Mongo kullanan
   * bir modül ayrı sürece çıkarılamazdı. Sürücüye özgü daraltma, sürücüyü zaten bilen
   * tek yerde yapılır: `BaseRepository.db`.
   */
  tx?: unknown;
  events: DomainEvent[];
  correlationId: string;
}

export const txStorage = new AsyncLocalStorage<TransactionContext>();
