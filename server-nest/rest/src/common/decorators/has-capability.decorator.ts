import { SetMetadata } from '@nestjs/common';
import { Capability } from '@prisma/client';

export type HasCapabilityType = Omit<Capability, 'id' | 'name'>;
export const HAS_CAPABILITY_KEY = Symbol('has_capability_key');

export const HasCapability = (modelCapability: HasCapabilityType) =>
  SetMetadata(HAS_CAPABILITY_KEY, modelCapability);
