import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '@modules/auth/auth.service';
import { LogSource } from '@src/domain/constants/log-action.constant';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator';
import { IRequestWithActor } from '@common/interfaces';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<IRequestWithActor>();

    const sourceHeader = request.headers['x-source-type'] as LogSource;

    const source = Object.values(LogSource).includes(sourceHeader)
      ? sourceHeader
      : LogSource.SYSTEM;

    const idToken = this.authService.getBearerTokenOrThrow(
      request.headers.authorization
    );

    const actor = await this.authService.validateAndGetContext(idToken);

    actor.source = source;
    request.actor = actor;

    return true;
  }
}
