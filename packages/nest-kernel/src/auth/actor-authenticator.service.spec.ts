import { UnauthorizedException } from '@nestjs/common';
import Redis from 'ioredis';
import { ActorContext } from '@common/interfaces';
import { LogSource } from '@src/domain/constants/log-action.constant';
import { ActorAuthenticator } from './actor-authenticator.service';
import { AUTH_CACHE_KEYS, hashAuthToken } from './auth-cache.keys';
import { ITokenVerifier, VerifiedToken } from './token-verifier.port';
import { IActorContextResolverPort } from './actor-context-resolver.port';

const TOKEN = 'ey.some.token';
const UID = 'firebase-uid-1';

const actor = (): ActorContext => ({
  userId: UID,
  email: 'a@b.c',
  source: LogSource.SYSTEM,
  capabilities: ['messaging:read'],
  rolePriority: 10,
});

/** Sadece kullanılan komutları taşıyan asgari Redis sahtesi. */
class FakeRedis {
  readonly store = new Map<string, string>();
  setCalls: Array<{ key: string; ttl: number }> = [];

  get(key: string): Promise<string | null> {
    return Promise.resolve(this.store.get(key) ?? null);
  }

  set(key: string, value: string, _mode: string, ttl: number): Promise<'OK'> {
    this.store.set(key, value);
    this.setCalls.push({ key, ttl });
    return Promise.resolve('OK');
  }
}

const build = (options?: {
  verify?: ITokenVerifier['verify'];
  resolve?: IActorContextResolverPort['resolve'];
}) => {
  const redis = new FakeRedis();
  const verify = jest.fn<Promise<VerifiedToken | null>, [string]>(
    options?.verify ?? (() => Promise.resolve({ uid: UID, email: 'a@b.c' }))
  );
  const resolve = jest.fn<Promise<ActorContext | null>, [VerifiedToken]>(
    options?.resolve ?? (() => Promise.resolve(actor()))
  );

  const service = new ActorAuthenticator(
    redis as unknown as Redis,
    { verify },
    { resolve }
  );

  return { service, redis, verify, resolve };
};

describe('ActorAuthenticator', () => {
  it('cache dolu ise kaynağa hiç gitmez', async () => {
    const { service, redis, resolve } = build();
    redis.store.set(AUTH_CACHE_KEYS.actorContext(UID), JSON.stringify(actor()));

    const result = await service.authenticate(TOKEN);

    expect(result.userId).toBe(UID);
    expect(resolve).not.toHaveBeenCalled();
  });

  it('cache boşsa kaynaktan çözer ve TTL ile cache’ler', async () => {
    const { service, redis, resolve } = build();

    await service.authenticate(TOKEN);

    expect(resolve).toHaveBeenCalledTimes(1);
    expect(redis.setCalls).toHaveLength(1);
    expect(redis.setCalls[0].key).toBe(AUTH_CACHE_KEYS.actorContext(UID));
    expect(redis.setCalls[0].ttl).toBeGreaterThan(0);
  });

  // Sıra kuralı: çıkış yapılmış token'ın imzası hâlâ geçerlidir. Blocklist
  // doğrulamadan SONRA bakılsaydı, geçersiz kılınmış token kabul edilirdi.
  it('blocklist’teki token’ı imza doğrulamasına hiç göndermez', async () => {
    const { service, redis, verify } = build();
    redis.store.set(AUTH_CACHE_KEYS.tokenBlocklist(hashAuthToken(TOKEN)), '1');

    await expect(service.authenticate(TOKEN)).rejects.toBeInstanceOf(
      UnauthorizedException
    );
    expect(verify).not.toHaveBeenCalled();
  });

  it('geçersiz token’ı reddeder', async () => {
    const { service, resolve } = build({ verify: () => Promise.resolve(null) });

    await expect(service.authenticate(TOKEN)).rejects.toBeInstanceOf(
      UnauthorizedException
    );
    expect(resolve).not.toHaveBeenCalled();
  });

  it('kullanıcı bulunamazsa reddeder', async () => {
    const { service } = build({ resolve: () => Promise.resolve(null) });

    await expect(service.authenticate(TOKEN)).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });

  // Bozuk cache kaydı, kimliği doğrulanmış kullanıcıyı dışarıda bırakmamalı.
  it('cache kaydı bozuksa kaynaktan yeniden çözer', async () => {
    const { service, redis, resolve } = build();
    redis.store.set(AUTH_CACHE_KEYS.actorContext(UID), '{bozuk json');

    const result = await service.authenticate(TOKEN);

    expect(result.userId).toBe(UID);
    expect(resolve).toHaveBeenCalledTimes(1);
  });
});
