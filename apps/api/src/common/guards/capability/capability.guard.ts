import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IRequestWithUser } from '@common/interfaces';
import {
  HAS_CAPABILITY_KEY,
  HasCapabilityType,
} from '@common/decorators/has-capability.decorator';

@Injectable()
export class CapabilityGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredCapability =
      this.reflector.getAllAndOverride<HasCapabilityType>(HAS_CAPABILITY_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!requiredCapability) {
      return true;
    }

    const request = context.switchToHttp().getRequest<IRequestWithUser>();
    const actor = request.actor;
    if (actor?.role?.isSystemRole) return true;

    if (!actor || !actor.capabilities) {
      throw new ForbiddenException();
    }

    const { module, action } = requiredCapability;
    const permissionKey = `${String(module).toLowerCase()}:${String(action).toLowerCase()}`;

    const hasPermission = actor.capabilities.some((capability) => {
      return capability.includes(permissionKey);
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        `Bu işlem için '${permissionKey}' yetkisine sahip olmanız gerekir.`,
      );
    }

    return true;
  }
}
