import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  HAS_CAPABILITY_KEY,
  HasCapabilityType,
} from '@common/decorators/has-capability.decorator';
import { IRequestWithActor } from '@common/interfaces';

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

    const request = context.switchToHttp().getRequest<IRequestWithActor>();
    const actor = request.actor;

    if ((actor?.role?.priority ?? 0) >= 100) {
      return true;
    }

    if (!actor || !actor.capabilities) {
      throw new ForbiddenException();
    }

    const { module, action } = requiredCapability;
    const permissionKey = `${String(module).toLowerCase()}:${String(action).toLowerCase()}`;

    // Tam eşitlik şart: `includes` ile `bankaccount:read` → `account:read`,
    // `metalead:read` → `lead:read` gibi 11 model çifti birbirinin yetkisini
    // açıyordu (model adı başka bir model adıyla bitiyorsa substring eşleşiyor).
    const hasPermission = actor.capabilities.some(
      (capability) => capability.toLowerCase() === permissionKey
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Bu işlem için '${permissionKey}' yetkisine sahip olmanız gerekir.`
      );
    }

    return true;
  }
}
