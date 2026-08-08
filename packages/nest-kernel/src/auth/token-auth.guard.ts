import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator';
import { IRequestWithActor } from '@common/interfaces';
import { getBearerToken } from '@common/utils';
import { LogSource } from '@src/domain/constants/log-action.constant';
import { ActorAuthenticator } from './actor-authenticator.service';

/**
 * Süreçten bağımsız kimlik doğrulama guard'ı — `apps/api` ve `apps/messaging` aynı
 * sınıfı kullanır. App'e özgü olan tek şey `ActorAuthenticator`'a bağlanan iki port
 * (`TOKEN_VERIFIER`, `ACTOR_CONTEXT_RESOLVER`); guard ikisini de bilmez.
 */
@Injectable()
export class TokenAuthGuard implements CanActivate {
  constructor(
    private readonly authenticator: ActorAuthenticator,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<IRequestWithActor>();

    const idToken = getBearerToken(request.headers.authorization);
    if (!idToken) throw new UnauthorizedException('Token bulunamadı');

    const actor = await this.authenticator.authenticate(idToken);

    // Çağıran sistemin kendini bildirdiği kaynak; tanınmayan değer SYSTEM'e düşer
    // (audit log'a serbest metin geçmesin).
    const sourceHeader = request.headers['x-source-type'] as LogSource;
    actor.source = Object.values(LogSource).includes(sourceHeader)
      ? sourceHeader
      : LogSource.SYSTEM;

    request.actor = actor;
    return true;
  }
}
