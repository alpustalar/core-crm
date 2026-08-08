import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { getBearerToken } from '@common/utils';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { ActorAuthenticator } from '@src/auth';
import { UpdateLastLoginCommand } from '@modules/identity/user/application/commands/update-last-login/update-last-login.command';
import { AuthCacheService } from '@modules/identity/auth/auth/infrastructure/cache/auth-cache.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly cacheService: AuthCacheService,
    private readonly actorAuthenticator: ActorAuthenticator
  ) {}

  /**
   * Token doğrulama + `ActorContext` çözümlemesi çekirdekteki `ActorAuthenticator`'da
   * (blocklist → imza → Redis → cache-miss'te `ACTOR_CONTEXT_RESOLVER`).
   * `apps/messaging` de aynı kodu çalıştırır; mantığın burada bir kopyası olsaydı iki
   * süreç zamanla ayrışırdı. Buradaki tek ek, api'ye özgü son-giriş damgasıdır.
   *
   * Kullanıcı/rol okuması `DbActorContextResolver`'a taşındı — o da yalnız cache-miss'te
   * çağrılır.
   */
  async validateAndGetContext(idToken: string) {
    const actor = await this.actorAuthenticator.authenticate(idToken);
    this.updateLastLogin(actor.userId);
    return actor;
  }

  async logout(rawToken: string, userId: string): Promise<void> {
    const parts = rawToken.split('.');
    if (parts.length === 3) {
      try {
        const payload = JSON.parse(
          Buffer.from(parts[1], 'base64url').toString()
        ) as { exp?: number };
        const ttl = (payload.exp ?? 0) - Math.floor(Date.now() / 1000);
        if (ttl > 0) await this.cacheService.token.block(rawToken, ttl);
      } catch {
        // token decode edilemedi, sadece cache temizle
      }
    }
    await this.cacheService.actorContext.del(userId);
  }

  getBearerTokenOrThrow(header?: string): string {
    const idToken = getBearerToken(header);
    if (!idToken) {
      throw new UnauthorizedException('Token bulunamadı');
    }
    return idToken;
  }

  updateLastLogin(userId: string): void {
    this.commandBus.execute(new UpdateLastLoginCommand(userId)).catch((e) => {
      this.logger.error(`auth service last login update: ${e}`);
    });
  }
}
