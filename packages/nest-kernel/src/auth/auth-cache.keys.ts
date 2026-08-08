import { createHash } from 'crypto';

/**
 * Auth Redis anahtarları — **tek kaynak**.
 *
 * Bu anahtarlar bir süreç sınırını aşıyor: `apps/api` yazıyor (giriş, çıkış, rol
 * değişiminde geçersizleme), `apps/messaging` okuyor. İki tarafın anahtar biçimini
 * kopyala-yapıştır ile "aynı" tutması, sessizce ayrışmanın en kısa yoludur — bir
 * tarafta değişen önek, diğer tarafta her isteğin cache-miss'e düşmesi demektir ve
 * bu hiçbir yerde hata olarak görünmez, yalnız yavaşlar. Bu yüzden anahtar üretimi
 * tek bir yerde, çekirdekte yaşar.
 */
export const AUTH_CACHE_KEYS = {
  actorContext: (userId: string): string => `auth:actor-cache:${userId}`,
  tokenBlocklist: (tokenHash: string): string =>
    `auth:token-blocklist:${tokenHash}`,
} as const;

/** Ham token asla Redis'e yazılmaz; blocklist SHA-256 özeti üzerinden çalışır. */
export const hashAuthToken = (rawToken: string): string =>
  createHash('sha256').update(rawToken).digest('hex');

/** ActorContext cache ömrü (saniye). Rol değişiminde ayrıca elle geçersizlenir. */
export const ACTOR_CONTEXT_CACHE_TTL_SECONDS = 5 * 60;
