import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { IRequestWithUser } from '@common/interfaces';
import { AuthService } from '@modules/auth/auth.service';
import { AuditSource } from '@modules/audit-log/enums/audit-action.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestWithUser>();

    const sourceHeader = request.headers['x-source-type'] as AuditSource;
    const source = Object.values(AuditSource).includes(sourceHeader)
      ? sourceHeader
      : AuditSource.SYSTEM;

    const idToken = this.authService.getBearerTokenOrThrow(
      request.headers.authorization
    );
    const actor = await this.authService.validateAndGetContext(idToken);
    actor.source = source;

    request.actor = actor;

    return true;
  }
}
