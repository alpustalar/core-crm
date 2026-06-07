import { Role } from '@shared';
import { Capability } from '@prisma/client';

export type RoleWithCapabilities = Role & {
  capabilities: Array<{
    capability: Capability;
  }>;
};
