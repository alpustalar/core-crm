/* eslint-disable */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { LogSource } from '@src/domain/constants/log-action.constant';
import { ActorContext, IRequestWithUser } from '../interfaces';

export const Actor = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): ActorContext => {
    const req = ctx.switchToHttp().getRequest<IRequestWithUser>();
    const user = req.user;

    const flatCapabilities =
      user.role?.capabilities?.map(
        (rc) => `${rc.capability.module}:${rc.capability.action}`
      ) ?? [];

    const rawSource = req.headers['x-source'] as string;
    const source = Object.values(LogSource).includes(rawSource as LogSource)
      ? (rawSource as LogSource)
      : LogSource.WEB;

    return {
      userId: user.id,
      roleId: user.role?.id,
      source,
      role: user.role ?? undefined,
      email: user.email,
      capabilities: flatCapabilities,
      rolePriority: user.role?.priority ?? 0,
      clinicId: user.clinicId ?? undefined,
      managedClinics: user.managedClinics?.map((c) => ({
        id: c.id,
        name: (c as any).name,
      })),
      ownedOrganizations: user.ownedOrganizations?.map((o) => ({
        id: o.id,
        name: o.name,
      })),
    };
  }
);
