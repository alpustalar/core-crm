import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { IRequestWithUser } from '@common/interfaces';

@Injectable()
export class SystemAdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const actor = context.switchToHttp().getRequest<IRequestWithUser>().actor;

    if (!actor || !actor.role) return false;
    if (actor.role.priority < 100) {
      throw new ForbiddenException('Sistem Yöneticisi yetkisi gerekli');
    }

    return true;
  }
}
