import { Request } from 'express';
import { Capability, Role, RoleCapability, User } from '@prisma/client';
import { ActorContext } from '@common/interfaces/actor-context.type';

export type RoleWithCapabilities = Role & {
  capabilities: (RoleCapability & {
    capability: Capability;
  })[];
};

export interface IRequestWithUser extends Request {
  user: Omit<User, 'role'> & {
    role: RoleWithCapabilities | null;
    managedClinics?: { id: string; name: string }[] | null;
    ownedOrganizations?: { id: string; name: string }[] | null;
    doctorProfile?: { id: string } | null;
  };
  actor: ActorContext;
}
