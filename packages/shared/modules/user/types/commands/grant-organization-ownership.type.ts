import { z } from 'zod';
import { GrantOrganizationOwnershipSchema } from '../../schemas/commands';

export type GrantOrganizationOwnership = z.infer<
  typeof GrantOrganizationOwnershipSchema
>;
