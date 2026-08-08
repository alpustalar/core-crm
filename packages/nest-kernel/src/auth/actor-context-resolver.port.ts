import { ActorContext } from '@common/interfaces';
import { VerifiedToken } from './token-verifier.port';

export const ACTOR_CONTEXT_RESOLVER = Symbol('IActorContextResolverPort');

/**
 * Cache'te bulunamayan `ActorContext`'i **kaynağından** çözen sınır.
 *
 * Normal yolda hiç çağrılmaz: `ActorContext` Redis'te durur ve `apps/api` giriş anında
 * doldurur. Bu port yalnız cache-miss içindir (TTL dolmuş ya da rol değişiminde
 * geçersizlenmiş).
 *
 * Implementasyon app'e göre değişir ve ayrımın bel kemiği budur:
 * - `apps/api`  → kullanıcı/rol tablolarını okur (kaynağın sahibi)
 * - `apps/messaging` → NATS ile core'a sorar (kendi veritabanı yok)
 *
 * Guard ikisini de bilmez; bu yüzden aynı guard iki süreçte de çalışır.
 */
export interface IActorContextResolverPort {
  /** Kullanıcı yoksa/pasifse `null` döner — guard bunu 401'e çevirir. */
  resolve(token: VerifiedToken): Promise<ActorContext | null>;
}
