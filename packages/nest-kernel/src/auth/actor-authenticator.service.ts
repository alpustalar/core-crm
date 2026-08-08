import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ActorContext } from '@common/interfaces';
import {
  ACTOR_CONTEXT_CACHE_TTL_SECONDS,
  AUTH_CACHE_KEYS,
  hashAuthToken,
} from './auth-cache.keys';
import { ITokenVerifier, TOKEN_VERIFIER } from './token-verifier.port';
import {
  ACTOR_CONTEXT_RESOLVER,
  IActorContextResolverPort,
} from './actor-context-resolver.port';

/**
 * Token → `ActorContext` çözümlemesinin **ortak** mantığı; `apps/api` ve
 * `apps/messaging` aynı kodu çalıştırır.
 *
 * Sıra önemlidir:
 *   1. Blocklist — çıkış yapılmış token, imzası hâlâ geçerli olsa bile reddedilir.
 *      Firebase doğrulamasından ÖNCE bakılır: geçersiz kılınmış bir token için
 *      sağlayıcıya gitmenin anlamı yok.
 *   2. İmza doğrulama (`ITokenVerifier`).
 *   3. Redis'ten `ActorContext` — normal yol burada biter; ek ağ turu yoktur.
 *   4. Cache-miss → `IActorContextResolverPort` (api'de DB, messaging'de NATS) ve
 *      sonuç cache'lenir.
 *
 * Yetki bilgisinin token claim'lerinde DEĞİL Redis'te tutulmasının sebebi tazelik:
 * claim'e gömülseydi rol değişikliği kullanıcı token'ını yenileyene kadar (saatler)
 * yansımazdı. Redis'te ise `apps/api` rol değişiminde kaydı siler ve bir sonraki
 * istek güncel yetkiyle çalışır.
 */
@Injectable()
export class ActorAuthenticator {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    @Inject(TOKEN_VERIFIER) private readonly tokenVerifier: ITokenVerifier,
    @Inject(ACTOR_CONTEXT_RESOLVER)
    private readonly actorResolver: IActorContextResolverPort
  ) {}

  async authenticate(idToken: string): Promise<ActorContext> {
    if (await this.isBlocked(idToken)) {
      throw new UnauthorizedException('Token geçersiz');
    }

    const verified = await this.tokenVerifier.verify(idToken);
    if (!verified) throw new UnauthorizedException('Token geçersiz');

    const cached = await this.readCache(verified.uid);
    if (cached) return cached;

    const resolved = await this.actorResolver.resolve(verified);
    if (!resolved) {
      throw new UnauthorizedException('Kullanıcı bulunamadı veya pasif');
    }

    await this.writeCache(verified.uid, resolved);
    return resolved;
  }

  private async isBlocked(rawToken: string): Promise<boolean> {
    const key = AUTH_CACHE_KEYS.tokenBlocklist(hashAuthToken(rawToken));
    return (await this.redis.get(key)) !== null;
  }

  private async readCache(userId: string): Promise<ActorContext | null> {
    const raw = await this.redis.get(AUTH_CACHE_KEYS.actorContext(userId));
    if (!raw) return null;

    try {
      return JSON.parse(raw) as ActorContext;
    } catch {
      // Bozuk kayıt kimliği doğrulanmış kullanıcıyı dışarıda bırakmamalı;
      // cache-miss gibi davranılır ve kaynaktan yeniden çözülür.
      return null;
    }
  }

  private async writeCache(userId: string, actor: ActorContext): Promise<void> {
    await this.redis.set(
      AUTH_CACHE_KEYS.actorContext(userId),
      JSON.stringify(actor),
      'EX',
      ACTOR_CONTEXT_CACHE_TTL_SECONDS
    );
  }
}
