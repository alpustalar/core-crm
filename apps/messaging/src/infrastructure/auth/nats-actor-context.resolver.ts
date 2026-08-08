import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ActorContext } from '@common/interfaces';
import { IActorContextResolverPort, VerifiedToken } from '@src/auth';
import {
  NATS_CLIENT,
  NATS_SUBJECTS,
  ResolveActorRequest,
  ResolveActorResponse,
} from '@src/transport';

/** Kimlik doğrulaması bir kullanıcıyı bekletir; kısa tutulur. */
const RESOLVE_TIMEOUT_MS = 3_000;

/**
 * `ActorContext`'i core'dan çözer — kullanıcı/rol tabloları orada.
 *
 * **Sıcak yolda çağrılmaz**: `ActorAuthenticator` önce Redis'e bakar ve cache'i core
 * dolduruyor (TTL 5 dk, rol değişiminde geçersizleniyor). Buraya yalnız cache soğukken
 * düşülür.
 *
 * Hata halinde `null` döner ve guard 401 verir. Sessizce "yetkisiz kabul et" davranışı
 * YOK: core erişilemiyorsa yetkiyi doğrulayamayız, uydurmak güvenlik açığı olurdu.
 */
@Injectable()
export class NatsActorContextResolver implements IActorContextResolverPort {
  private readonly logger = new Logger(NatsActorContextResolver.name);

  constructor(@Inject(NATS_CLIENT) private readonly client: ClientProxy) {}

  async resolve(token: VerifiedToken): Promise<ActorContext | null> {
    try {
      const actor = await firstValueFrom(
        this.client
          .send<ResolveActorResponse, ResolveActorRequest>(
            NATS_SUBJECTS.auth.resolveActor,
            token
          )
          .pipe(timeout(RESOLVE_TIMEOUT_MS))
      );
      return actor ?? null;
    } catch (err) {
      this.logger.warn(
        `ActorContext çözülemedi (uid=${token.uid}): ${
          err instanceof Error ? err.message : err
        }`
      );
      return null;
    }
  }
}
